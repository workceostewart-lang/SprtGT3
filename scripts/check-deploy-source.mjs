import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const fail = (message) => {
  console.error(`Deployment blocked: ${message}`);
  process.exit(1);
};

if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") {
  fail("Sprt GT3 must be deployed from the main branch.");
}

if (git("status", "--porcelain")) {
  fail("commit all changes before deploying Sprt GT3.");
}

execFileSync("git", ["fetch", "--quiet", "origin", "main"], { stdio: "inherit" });

if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) {
  fail("local main does not match GitHub origin/main. Pull the latest hub first.");
}

console.log("Deployment source verified against GitHub main.");

