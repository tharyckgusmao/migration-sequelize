import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import {
  makeConfigMigrate,
  makeMigrate,
  makeProduction,
  publishMigrations,
  showMigrations,
} from "./lib/migrator/migrator.service";

const program = new Command();

const prompt = inquirer.createPromptModule();

const promptDevOrProd = async () => {
  const data = await prompt([
    {
      type: "list",
      message: "Select publishing mode:",
      name: "mode",
      choices: [
        {
          name: "Development",
          value: "dev",
        },
        {
          name: "Stagging",
          value: "stag",
        },
        {
          name: `${chalk.bold.red("Production")}`,
          value: "prod",
        },
      ],
      validate(answer) {
        if (!answer) {
          return "Select one Option";
        }

        return true;
      },
    },
  ]);
  const mode = data?.mode || "dev";
  if (mode == "prod") {
    const confirm = await prompt([
      { type: "confirm", name: "confirm", message: "Are you sure ?" },
    ]);

    if (confirm?.confirm) {
      return mode;
    }
    return null;
  }
  return mode;
};

const run = async () => {
  program
    .option("-M, --make:migrate <name>", "Migration to create a new one")
    .option(
      "-MP, --make:production <name>",
      "Copy and Make migrations for folder Dev -> <name>"
    )
    .option("-C, --make:config", "Create Tables for migrate")
    .option(
      "-P, --publish:migrations [start]",
      "Publication of migrations to database"
    )
    .option("-F, --find [value]", "Find Database")
    .option("-D, --debug:migrations", "Show Migrations Not Aplied and Aplied");

  program.version("0.0.2");
  program.parse(process.argv);

  const opts = program.opts();
  if (opts[`make:migrate`]) {
    makeMigrate(opts[`make:migrate`]);
  }
  if (opts[`make:production`]) {
    makeProduction(opts[`make:production`]);
  }
  if (opts[`publish:migrations`]) {
    const mode = await promptDevOrProd();
    if (mode) {
      publishMigrations(
        mode,
        isNaN(opts[`publish:migrations`]) || 0,
        opts?.find || null
      );
    }
  }
  if (opts[`make:config`]) {
    const mode = await promptDevOrProd();
    if (mode) {
      makeConfigMigrate(mode);
    }
  }
  if (opts[`debug:migrations`]) {
    const mode = await promptDevOrProd();
    if (mode) {
      showMigrations(mode);
    }
  }
};

run();
