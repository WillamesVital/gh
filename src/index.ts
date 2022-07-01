#!/usr/bin/env zx
import "zx/globals";

import { Command } from "commander";
import figlet from "figlet";

import CLI from "./lib/cli.js";
import { APP_NAME } from "./lib/constants.js";
import { getConfig } from "./lib/credentials.js";
import Git from "./lib/git.js";
import { Github } from "./lib/github.js";

/**
 * @description If you want to see what happens under the hoods, use the flag --verbose
 */

$.verbose = process.argv.includes("--verbose");

class Application {
  public cli: Command;

  constructor() {
    this.cli = new Command(APP_NAME);

    this.welcome();
  }

  /**
   * @description Just an ASCII Art
   */

  private welcome(): void {
    const version = process.env.PACKAGE_VERSION;

    console.log(
      figlet.textSync(APP_NAME, {
        font: "Big",
      })
    );

    if (version) {
      this.cli.version(version, "-v", `Display ${APP_NAME} Version`);

      console.log(`CLI Version: ${version}`);
    }
  }

  /**
   * @description The principal workflow of the Application is here
   * Also, the SETUP and configurations are made here and used in all application
   */

  public async init(): Promise<void> {
    const isValidGitRepository = await Git.isProjectUsingGit();

    if (!isValidGitRepository) {
      return console.error(
        `Not a git repository (or any of the parent directories): ${chalk.red(
          ".git not found"
        )}`
      );
    }

    const config = await getConfig();

    const [octokit, [owner, repo]] = await Promise.all([
      Github.getGithubClient(config.token),
      Git.getOriginRemote(),
    ]);

    const applicationProperties = {
      config: {
        config,
        owner,
        repo,
      },
      octokit,
    };

    const cli = new CLI(this.cli, applicationProperties);

    await cli.createCLI();
  }
}

const application = new Application();

application.init();
