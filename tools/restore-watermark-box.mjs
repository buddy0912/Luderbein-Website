import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { detectBoxWatermark, detectBoxWatermarkBuffer, listImageFiles } from "./detect-watermark-box.mjs";

const ROOT_DIR = process.cwd();
const LOG_LIMIT = 30;

function getCommitList(filePath) {
  const output = execSync(`git log -n ${LOG_LIMIT} --format=%H -- "${filePath}"`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (!output) return [];
  return output.split("\n").filter(Boolean);
}

function getFileFromCommit(commit, filePath) {
  return execSync(`git show ${commit}:"${filePath}"`, {
    encoding: "buffer",
    maxBuffer: 50 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
}

async function restoreFile(filePath) {
  const commits = getCommitList(filePath);
  for (const commit of commits) {
    const buffer = getFileFromCommit(commit, filePath);
    const hasBox = await detectBoxWatermarkBuffer(buffer);
    if (!hasBox) {
      await fs.writeFile(filePath, buffer);
      return true;
    }
  }
  return false;
}

async function run() {
  const files = await listImageFiles();
  const flagged = [];

  for (const filePath of files) {
    if (await detectBoxWatermark(filePath)) {
      flagged.push(filePath);
    }
  }

  const restored = [];
  const noClean = [];

  for (const filePath of flagged) {
    const ok = await restoreFile(filePath);
    const relPath = path.relative(ROOT_DIR, filePath);
    if (ok) {
      restored.push(relPath);
    } else {
      noClean.push(relPath);
    }
  }

  return { restored, noClean };
}

if (process.argv[1] && process.argv[1].endsWith("restore-watermark-box.mjs")) {
  run().then(({ restored, noClean }) => {
    console.log("restored:");
    restored.forEach((item) => console.log(item));
    console.log("no-clean-version:");
    noClean.forEach((item) => console.log(item));
  });
}
