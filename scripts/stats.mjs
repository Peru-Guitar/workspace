// Personal Fret Quest dashboard: users and the most practiced modules/lessons this week.
// Reads production with the Firebase CLI login (admin access, bypasses rules) and writes
// a local HTML page to .stats/index.html. Run: npm run stats
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const PROJECT = "fretquest-d02c2";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "pg-fretquest");

const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const now = new Date();
const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
const weekStart = dateKey(monday);

// Users from Firebase Auth. The export also refreshes the CLI access token used below.
const exportFile = join(tmpdir(), `fretquest-users-${process.pid}.json`);
execFileSync("firebase", ["auth:export", exportFile, "--format=json", "--project", PROJECT], { stdio: "ignore" });
const users = JSON.parse(readFileSync(exportFile, "utf8")).users;
rmSync(exportFile);
const token = JSON.parse(readFileSync(join(homedir(), ".config/configstore/firebase-tools.json"), "utf8")).tokens.access_token;

// Every practice day of this week, across all users.
const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:runQuery`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ structuredQuery: {
    from: [{ collectionId: "days", allDescendants: true }],
    where: { fieldFilter: { field: { fieldPath: "date" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: weekStart } } },
  } }),
});
if (!response.ok) throw new Error(`Firestore ${response.status}: ${await response.text()}`);
const num = v => Number(v?.integerValue ?? v?.doubleValue ?? 0);
const days = (await response.json()).filter(row => row.document).map(({ document }) => {
  const f = document.fields;
  return {
    uid: document.name.split("/users/")[1].split("/")[0],
    name: f.name?.stringValue ?? "",
    seconds: num(f.seconds),
    lessons: Object.entries(f.lessons?.mapValue?.fields ?? {}).map(([id, v]) => ({ id, attempts: num(v.mapValue.fields.attempts), seconds: num(v.mapValue.fields.seconds) })),
  };
});

// Lesson → module from the app catalog (documents only store lessonId).
const require = createRequire(join(app, "package.json"));
const jiti = require("jiti").createJiti(join(app, "package.json"), { alias: { "@": join(app, "src") } });
const { courses } = await jiti.import(join(app, "src/data/questMock.ts"));
const lessonInfo = new Map(courses.flatMap(m => m.lessons.map(l => [l.id, { title: l.title, module: m }])));

const tally = () => ({ users: new Set(), attempts: 0, seconds: 0 });
const modules = new Map(), lessons = new Map();
for (const day of days) for (const l of day.lessons) {
  const info = lessonInfo.get(l.id);
  const moduleId = info?.module.id ?? "?";
  for (const [map, key] of [[modules, moduleId], [lessons, l.id]]) {
    const t = map.get(key) ?? map.set(key, tally()).get(key);
    t.users.add(day.uid); t.attempts += l.attempts; t.seconds += l.seconds;
  }
}
const rank = map => [...map].sort(([, a], [, b]) => b.users.size - a.users.size || b.attempts - a.attempts || b.seconds - a.seconds);

const ms = Number(monday);
const stats = {
  total: users.length,
  newThisWeek: users.filter(u => Number(u.createdAt) >= ms).length,
  signedInThisWeek: users.filter(u => Number(u.lastSignedInAt) >= ms).length,
  practicing: new Set(days.map(d => d.uid)).size,
  minutes: Math.round(days.reduce((s, d) => s + d.seconds, 0) / 60),
};

const esc = s => String(s).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);
const mins = s => s < 60 ? `${s} s` : `${Math.round(s / 60)} min`;
const rows = (list, label) => list.length ? list.map(([key, t], i) => `<tr><td>${i + 1}</td><td>${label(key)}</td><td>${t.users.size}</td><td>${t.attempts}</td><td>${mins(t.seconds)}</td></tr>`).join("")
  : `<tr><td colspan="5" class="empty">Sin práctica esta semana</td></tr>`;
const table = (title, head, body) => `<section><h2>${title}</h2><table><thead><tr><th>#</th><th>${head}</th><th>Usuarios</th><th>Intentos</th><th>Tiempo</th></tr></thead><tbody>${body}</tbody></table></section>`;
const tile = (label, value) => `<div class="tile"><span>${label}</span><strong>${value}</strong></div>`;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fret Quest Stats</title><style>
:root{--bg:#f7f7f5;--card:#fff;--text:#1d1d1b;--muted:#6b6b66;--line:#e4e4df;--accent:#c2410c}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--card:#1e1e1c;--text:#ececea;--muted:#9a9a94;--line:#2e2e2b;--accent:#fb923c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,sans-serif;padding:32px 16px}
main{max-width:960px;margin:auto}h1{margin:0;font-size:24px}p.sub{color:var(--muted);margin:4px 0 24px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:28px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}.tile span{color:var(--muted);font-size:13px}
.tile strong{display:block;font-size:28px;font-variant-numeric:tabular-nums}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:20px;overflow-x:auto}
h2{font-size:16px;margin:0 0 10px}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:500;font-size:13px}
td:nth-child(n+3),th:nth-child(n+3){text-align:right}tr:last-child td{border-bottom:0}td small{color:var(--muted)}.empty{color:var(--muted);text-align:center!important}
</style></head><body><main>
<h1>Fret Quest · esta semana</h1><p class="sub">Del lunes ${weekStart} al ${dateKey(now)} · generado ${now.toLocaleString("es-PE")}</p>
<div class="tiles">${tile("Usuarios totales", stats.total)}${tile("Nuevos esta semana", stats.newThisWeek)}${tile("Entraron esta semana", stats.signedInThisWeek)}${tile("Practicaron esta semana", stats.practicing)}${tile("Minutos practicados", stats.minutes)}</div>
${table("Módulos más tomados", "Módulo", rows(rank(modules), id => esc(courses.find(m => m.id === id)?.title ?? id)))}
${table("Lecciones más tomadas", "Lección", rows(rank(lessons), id => { const i = lessonInfo.get(id); return i ? `${esc(i.title)}<br><small>${esc(i.module.title)}</small>` : esc(id); }))}
</main></body></html>`;

const out = join(root, ".stats/index.html");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);

console.log(`Fret Quest, week from ${weekStart}`);
console.table(stats);
console.table(rank(modules).map(([id, t]) => ({ module: courses.find(m => m.id === id)?.title ?? id, users: t.users.size, attempts: t.attempts, time: mins(t.seconds) })));
console.log(`Dashboard: ${out}`);
if (!process.argv.includes("--no-open")) execFileSync("open", [out]);
