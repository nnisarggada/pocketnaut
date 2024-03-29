#!/usr/bin/env node

import { execSync } from "child_process";
import readline from "readline";

let repoName = process.argv[2];
let backend = process.argv[3];

const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.log("Failed to run command: ", error);
    return false;
  }
  return true;
};

const checkPnpm = () => {
  try {
    execSync("pnpm --version");
    return true;
  } catch (error) {
    return false;
  }
};

const npmCommand = checkPnpm() ? "pnpm" : "npm";

if (!repoName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  repoName = await new Promise((resolve) => {
    rl.question("Give your project a name: ", (answer) => {
      resolve(answer.trim().replace(/\s+/g, "-"));
    });
  });
  rl.close();
}

if (!repoName) {
  console.log("Please provide a name for your project");
  process.exit(1);
}

if (!backend) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  backend = await new Promise((resolve) => {
    rl.question(
      "Do you want to use a pocketbase backend? (Y/n): ",
      (answer) => {
        if (answer[0].toLowerCase() === "n") {
          console.log("Setting up without backend...");
          resolve("-nb");
        }
        console.log("Setting up with pocketbase...");
        resolve("");
      },
    );
  });
  rl.close();
}

const gitCloneCommand = `git clone --depth 1 https://github.com/nnisarggada/pocketnaut ${repoName}`;
const setupCommand = `cd ${repoName} && rm -rf .git && git init && rm -rf bin && mkdir public && mkdir src/components && mkdir src/icons`;
const noBackendCommand = `cd ${repoName} && mv nb_package.json package.json && rm pb_package.json && rm src/utils/pocketbase.ts && mv src/pages/nb_index.astro src/pages/index.astro`;
const backendCommand = `cd ${repoName} && mv pb_package.json package.json && rm nb_package.json && rm src/pages/nb_index.astro && mkdir backend`;
const changeProjectName = `cd ${repoName} && sed -i 's/pocketnaut/${repoName}/g' package.json`;
const installDependenciesCommand = `cd ${repoName} && ${npmCommand} install && ${npmCommand} update`;

console.log(`Cloning repository to ${repoName}...`);

if (!runCommand(gitCloneCommand)) {
  process.exit(1);
}

console.log(`Setting up ${repoName}...`);

if (!runCommand(setupCommand)) {
  process.exit(1);
}

console.log(`Changing files...`);

if (backend == "-nb") {
  if (!runCommand(noBackendCommand)) {
    process.exit(1);
  }
} else {
  if (!runCommand(backendCommand)) {
    process.exit(1);
  }
}

console.log(`Changing project name...`);

if (!runCommand(changeProjectName)) {
  process.exit(1);
}

console.log(`Installing dependencies...`);

const installSuccess = runCommand(installDependenciesCommand);
if (!installSuccess) {
  process.exit(1);
}

console.log(
  `Done! Run "cd ${repoName} && ${npmCommand} dev" to start developing! 🚀`,
);
