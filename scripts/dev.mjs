// Frees the dev ports, starts every app with concurrently and prints a status table.
import { execSync, spawn } from "node:child_process";
import net from "node:net";

const apps = [
  { name: "PG Web", port: 4100, color: "\x1b[34m" },
  { name: "PG FretQuest", port: 4200, color: "\x1b[32m" },
  { name: "PG Fighters", port: 4300, color: "\x1b[35m" },
  { name: "PG Composer", port: 4400, color: "\x1b[36m" },
];

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";

const pidsOnPort = (port) => {
  try {
    return execSync(`lsof -t -nP -iTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
};

const isListening = (port) =>
  new Promise((resolve) => {
    const tryHost = (hosts) => {
      if (!hosts.length) return resolve(false);
      const socket = net.connect({ port, host: hosts[0] });
      socket.once("connect", () => (socket.destroy(), resolve(true)));
      socket.once("error", () => tryHost(hosts.slice(1)));
    };
    tryHost(["127.0.0.1", "::1"]);
  });

const printTable = (title) => {
  const rows = apps.map((a) => ({ ...a, url: `http://localhost:${a.port}` }));
  const statusText = { starting: "○ starting", running: "● running", stopped: "✕ stopped" };
  const statusColor = { starting: yellow, running: green, stopped: red };
  const w = [
    Math.max(7, ...rows.map((r) => r.name.length)),
    Math.max(3, ...rows.map((r) => r.url.length)),
    Math.max(6, ...Object.values(statusText).map((s) => s.length)),
  ];
  const line = (l, m, r) => `  ${dim}${l}${w.map((n) => "─".repeat(n + 2)).join(m)}${r}${reset}`;
  const bar = `${dim}│${reset}`;
  const row = (cells) => `  ${bar} ${cells.join(` ${bar} `)} ${bar}`;

  console.log(`\n  ${bold}🎸 Peru Guitar — ${title}${reset}`);
  console.log(line("┌", "┬", "┐"));
  console.log(row(["Project", "URL", "Status"].map((h, i) => `${bold}${h.padEnd(w[i])}${reset}`)));
  console.log(line("├", "┼", "┤"));
  for (const r of rows) {
    console.log(
      row([
        `${r.color}${r.name.padEnd(w[0])}${reset}`,
        r.url.padEnd(w[1]),
        `${statusColor[r.status]}${statusText[r.status].padEnd(w[2])}${reset}`,
      ])
    );
  }
  console.log(line("└", "┴", "┘") + "\n");
};

// Kill anything left over on our ports (e.g. a previous run that didn't shut down).
for (const app of apps) {
  const pids = pidsOnPort(app.port);
  if (pids.length) {
    console.log(`  ${yellow}Port ${app.port} in use (pid ${pids.join(", ")}), killing it…${reset}`);
    try {
      execSync(`kill ${pids.join(" ")}`);
    } catch {}
  }
  app.status = "starting";
}

printTable("starting");

const child = spawn(
  "npx",
  ["concurrently", "-k", "-c", "blue,green,magenta,cyan", "npm:dev:*"],
  { stdio: "inherit" }
);

// Reprint the table once every app answers on its port.
const poll = setInterval(async () => {
  for (const app of apps) if (await isListening(app.port)) app.status = "running";
  if (apps.every((a) => a.status === "running")) {
    clearInterval(poll);
    printTable("all apps running");
  }
}, 1000);

const stop = (signal) => child.kill(signal);
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => {
  clearInterval(poll);
  for (const app of apps) app.status = "stopped";
  printTable("stopped");
  process.exit(code ?? 0);
});
