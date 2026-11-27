import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const processes = [
  spawn(process.execPath, ["server.js"], { cwd: directory, stdio: "inherit" }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
    cwd: directory,
    stdio: "inherit",
  }),
];
let stopping = false;

const stopProcesses = (exitCode) => {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of processes) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
};

for (const child of processes) {
  child.on("error", (error) => {
    console.error("Could not start a development process:", error);
    stopProcesses(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stopProcesses(code === 0 ? 0 : code || 1);
  });
}

process.on("SIGINT", () => stopProcesses(0));
process.on("SIGTERM", () => stopProcesses(0));
