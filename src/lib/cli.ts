import { Command } from "commander";

import { ApplicationProperties } from "../interfaces/types.js";
import { Commands } from "./commands.js";
import { askConfiguration } from "./credentials.js";
import { Git } from "./git.js";
import { prompts } from "./utils.js";

class CommandLine {
  private applicationProperties: ApplicationProperties;
  private git: Git;
  private cli: Command;
  private commands: Commands;

  constructor(cli: Command, applicationProperties: ApplicationProperties) {
    this.applicationProperties = applicationProperties;
    this.cli = cli;
    this.git = new Git();
    this.commands = new Commands(applicationProperties);
  }

  /**
   * @description Show the Application options and actions, you may see a guided tour,
   * calling the application without arguments
   *
   * Some commands has the name Dry for no interface
   * and Onboard for Guided use
   */

  public async createCLI(): Promise<void> {
    this.cli
      .command("cli")
      .description("Use Guided way to use GitRay")
      .action(async () => {
        const response = await prompts({
          choices: [
            {
              title: "Pull Request",
              value: "pr",
            },
            { disabled: false, title: "Fetch", value: "fetch" },
          ],
          initial: 0,
          message: "Which Action do you want to perform?",
          name: "value",
          type: "select",
        });

        if (response.value === "pr") {
          await this.commands.workflowForPullRequestOnboard();
        } else {
          await this.commands.workflowForFetchOnboard();
        }
      });

    this.cli
      .command("config")
      .description(
        "Configure Gitray with Github Credentials and desired options"
      )
      .action(async () => {
        await askConfiguration(this.applicationProperties.config.config);
      });

    this.cli
      .command("fetch")
      .description("Use to fetch data from a specific remote")
      .action(async () => {
        await this.commands.workflowForFetchDry();
      });

    this.cli
      .command("issues")
      .description("Use to manage Issues from Github")
      .action(() => {
        console.log("Disabled for now");
      });

    this.cli
      .command("pr")
      .description("Manage Pull Requests")
      .option(
        "-b, --base <destination branch>",
        "Use to define the destination branch"
      )
      .option(
        "-c, --comment <review comment>",
        "Add Pull Request Reviewing Comment"
      )
      .option("--no-comment", "No Pull Request Reviewing Comment", false)
      .option(
        "--no-report",
        "Don't create a Jira Report when a Pull Request is opened"
      )
      .option("-f, --forward <github username>", "Forward a PR")
      .option("-s, --send [github username]", "Send a PR to this Username")
      .option("-t, --title <pr title>", "Title of Pull Request")
      .option(
        "-u, --user [github username]",
        "List or Fetch PR from Github Username"
      )
      .action(async (cmd, { args }) => {
        await this.commands.workflowForPullRequestDry(cmd, args);
      });

    this.cli
      .command("update")
      .description("Update Gitray")
      .action(async () => {
        this.git.updateGitray();
      });

    this.cli
      .command("sync")
      .description(
        "Syncronize your fork(origin) with latest code from Upstream"
      )
      .action(async () => {
        this.git.sync();
      });

    this.cli.parse(process.argv.filter((argv) => argv !== "--verbose"));

    return Promise.resolve();
  }
}

export default CommandLine;
