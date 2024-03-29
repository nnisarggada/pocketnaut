#!/usr/bin/env node

import { execSync } from "child_process";
import readline from "readline";

let repoName = process.argv[2];

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

  console.log(`Your project will be called ${repoName}`);
  rl.close();
}

if (!repoName) {
  console.log("Please provide a name for your project");
  process.exit(1);
}

const gitCloneCommand = `git clone --depth 1 https://github.com/nnisarggada/pocketnaut ${repoName}`;
const installDependenciesCommand = `cd ${repoName} && ${npmCommand} install && ${npmCommand} update`;

console.log(`Cloning repository to ${repoName}`);

const cloneSuccess = runCommand(gitCloneCommand);
if (!cloneSuccess) {
  process.exit(1);
}

console.log(`Installing dependencies`);
const installSuccess = runCommand(installDependenciesCommand);
if (!installSuccess) {
  process.exit(1);
}

console.log(
  `Done! Run "cd ${repoName} && ${npmCommand} dev" to start developing!`,
);
