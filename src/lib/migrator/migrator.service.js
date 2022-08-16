/* eslint-disable no-restricted-syntax */
import chalk from "chalk";
import chalkTable from "chalk-table";
import inquirer from "inquirer";
import path from "path";
import { QueryTypes, Sequelize } from "sequelize";
import config from "../../config";
import { copyDir, readDir, writeFile } from "../utils/fs";
import { getDateFile } from "../utils/helper";
import migratorModel from "./migrator.model";
import { tablesMigrate, templateMigrate } from "./template";

const prompt = inquirer.createPromptModule();

const databases = async (mode) => {
  try {
    const sequelize = new Sequelize({
      connectionLimit: 5000,
      username: config[`${mode}`]?.username,
      password: config[`${mode}`]?.password,
      database: config[`${mode}`]?.database,
      host: config[`${mode}`]?.host,
      dialect: config[`${mode}`]?.dialect,
      // dialectOptions: config[`${mode}`]?.dialectOptions,
      port: 3306,
      // timeout: 60000,
    });

    const auth = await sequelize.authenticate();
    console.log(auth);
    if (!auth) {
      const dt = await sequelize.query(
        "SELECT d.nomedobanco FROM `empresa` AS d",
        { type: QueryTypes.SELECT }
      );
      console.log(dt);

      return dt?.map((e) => `${config[`${mode}`]?.preffix}${e.nomedobanco}`);
    }

    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const makeMigrate = async (name = "") => {
  const nameMigrateFile = `${name}_${getDateFile()}.js`;
  await writeFile(
    path.resolve(__dirname, `../../../migrations/dev/${nameMigrateFile}`),
    templateMigrate
  );
  console.log(
    chalk.bold.green(
      `****************************************************\n\nMigrate Create Succefull:${nameMigrateFile}\n\n****************************************************`
    )
  );
};
export const makeProduction = async (mode = "") => {
  const pathPreffix = path.resolve(__dirname, `../../../migrations`);
  console.log(chalk.bold.green(`Publishing Dev to -> ${mode}`));
  await copyDir(
    path.resolve(`${pathPreffix}/dev`),
    path.resolve(`${pathPreffix}/${mode}`)
  );
  console.log(chalk.bold.green(`Publishing Migrates Successful : ${mode}`));
};
export const makeConfigMigrate = async (mode) => {
  try {
    const dt = await databases(mode);

    // const mP = dt.map(async (databaseName) => {
    // const sequelize = new Sequelize(config[`${mode}`]);
    for (const databaseName of dt) {
      try {
        const sequelize = new Sequelize({
          connectionLimit: 5000,
          username: config[`${mode}`]?.username,
          password: config[`${mode}`]?.password,
          database: databaseName,
          host: config[`${mode}`]?.host,
          dialect: config[`${mode}`]?.dialect,
        });
        const auth = await sequelize.authenticate();
        if (!auth) {
          const queryinterface = sequelize.getQueryInterface();

          console.log(chalk.bold.green(`Mode : ${mode}`));
          console.log(
            chalk.bold.green(
              `Create Initital Tables for Migration : ${databaseName}`
            )
          );
          await tablesMigrate(queryinterface, Sequelize);
          console.log(chalk.bold.green(`Created Success : ${databaseName}`));
          sequelize.close();
        }
      } catch (error) {
        console.log(`error${error}`);
      }
    }
    // });
    // await Promise.all(mP);
  } catch (error) {
    console.log(chalk.bold.red("Unable to connect to the database!", error));
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const publishMigrations = async (mode, start = 0, search = null) => {
  // console.clear();
  // try {
  let dt = await databases(mode);

  if (search) {
    dt = dt.filter((e) => {
      return e.toLowerCase() == `${search}`.toLowerCase();
    });
  }
  if (start > 0) {
    dt = dt.slice(start);
  }

  let sequelize = null;
  let auth = null;
  let index = 0;
  console.log(chalk.bold.green(`Total : ${dt.length || 0}`));

  for (const databaseName of dt) {
    // const mP = dt.map(async (databaseName) => {
    // const sequelize = new Sequelize(config[`${mode}`]);
    try {
      console.log(chalk.bold.green(`Index : ${index}`));
      index += 1;
      sequelize = new Sequelize({
        connectionLimit: 5000,
        username: config[`${mode}`]?.username,
        password: config[`${mode}`]?.password,
        database: databaseName,
        host: config[`${mode}`]?.host,
        dialect: config[`${mode}`]?.dialect,
      });
      auth = await sequelize.authenticate();
      if (!auth) {
        console.log(chalk.bold.green(`Mode : ${mode}`));
        console.log(chalk.bold.blue(`Connected on Database : ${databaseName}`));
        const queryinterface = sequelize.getQueryInterface();
        const pathMig = path.resolve(__dirname, `../../../migrations/${mode}/`);

        let migrations = await readDir(`${pathMig}/*.js`);

        const migrationModel = sequelize.define(
          "migrations_controll",
          migratorModel,
          {
            timestamps: false,
          }
        );
        const migratorbatch = await migrationModel.findAll();

        migrations = migrations.filter((ee) => {
          const name = ee.split("/")[ee.split("/")?.length - 1];

          const findIdx = migratorbatch.findIndex((e) => {
            return e.file == name;
          });
          if (findIdx <= -1) {
            return true;
          }
          return false;
        });
        await sleep(2000);
        // const mPMap = migrations?.map(async (e) => {
        for (const e of migrations) {
          const migration = require(e);
          const name = e.split("/")[e.split("/")?.length - 1];

          sequelize = new Sequelize({
            connectionLimit: 5000,
            username: config[`${mode}`]?.username,
            password: config[`${mode}`]?.password,
            database: databaseName,
            host: config[`${mode}`]?.host,
            dialect: config[`${mode}`]?.dialect,
          });
          const queryinterface = sequelize.getQueryInterface();

          try {
            const mig = await migration.up(queryinterface, Sequelize);
            migrationModel.create({
              file: name,
              batch: 1,
            });
          } catch (error) {
            migrationModel.create({
              file: name,
              batch: 0,
            });
          }
          console.log(
            chalk.bold.green(
              `Executted Migrate ${name} on Database : ${chalk.bold.red(
                `${databaseName}`
              )}`
            )
          );
        }
        if (migrations?.length === 0) {
          console.log(
            chalk.bold.green(
              `Not Have Migrate on  Database : ${chalk.bold.red(
                `${databaseName}`
              )}`
            )
          );
        } else {
          console.log(
            chalk.bold.green(
              `All Migrations Executted on  Database : ${chalk.bold.red(
                `${databaseName}`
              )}`
            )
          );
        }
        sequelize.close();
        await sleep(2000);
        // await Promise.all(mPMap);
      } else {
        console.log("Unable to connect to the database!");
      }
    } catch (e) {
      console.log(e);
    }
  }
  // await Promise.all(mP);
  // } catch (error) {
  //   console.log(chalk.bold.red("Unable to connect to the database!", error));
  // }
};

export const debugMigrations = async (mode) => {
  console.clear();
  try {
    const dt = await databases(mode);

    const mP = dt.map(async (databaseName) => {
      // const sequelize = new Sequelize(config[`${mode}`]);
      const sequelize = new Sequelize({
        connectionLimit: 5000,
        username: config[`${mode}`]?.username,
        password: config[`${mode}`]?.password,
        database: databaseName,
        host: config[`${mode}`]?.host,
        dialect: config[`${mode}`]?.dialect,
      });
      const auth = await sequelize.authenticate();
      if (!auth) {
        console.log(chalk.bold.green(`Mode : ${mode}`));
        console.log(
          chalk.bold.blue(
            `Connected on Database : ${config[`${mode}`].database}`
          )
        );
        const queryinterface = sequelize.getQueryInterface();
        const pathMig = path.resolve(__dirname, `../../../migrations/${mode}/`);

        let migrations = await readDir(`${pathMig}/*.js`);

        const migrationModel = sequelize.define(
          "migrations_controll",
          migratorModel,
          {
            timestamps: false,
          }
        );
        const migratorbatch = await migrationModel.findAll();

        migrations = migrations.filter((ee) => {
          const name = ee.split("/")[ee.split("/")?.length - 1];

          const findIdx = migratorbatch.findIndex((e) => {
            return e.file == name;
          });
          if (findIdx <= -1) {
            return true;
          }
          return false;
        });

        const mPMap = migrations?.map(async (e) => {
          const migration = require(e);
          const mi = await migration.up(queryinterface, Sequelize);
          const name = e.split("/")[e.split("/")?.length - 1];
          migrationModel.create({
            file: name,
            batch: 1,
          });
          console.log(
            chalk.bold.green(
              `Executted Migrate ${name} on Database : ${chalk.bold.red(
                `${config[`${mode}`].database}`
              )}`
            )
          );
          return mi;
        });

        await Promise.all(mPMap);

        if (migrations?.length === 0) {
          console.log(
            chalk.bold.green(
              `Not Have Migrate on  Database : ${chalk.bold.red(
                `${config[`${mode}`].database}`
              )}`
            )
          );
        } else {
          console.log(
            chalk.bold.green(
              `All Migrations Executted on  Database : ${chalk.bold.red(
                `${config[`${mode}`].database}`
              )}`
            )
          );
        }
      } else {
        throw "Unable to connect to the database!";
      }
    });
    await Promise.all(mP);
  } catch (error) {
    console.log(chalk.bold.red("Unable to connect to the database!", error));
  }
};

export const showMigrations = async (mode) => {
  console.clear();
  try {
    const dt = await databases(mode);

    const choice = await prompt([
      {
        type: "list",
        name: "db",
        message: "Select Database:",
        choices: dt,
      },
    ]);
    // const sequelize = new Sequelize(config[`${mode}`]);
    const sequelize = new Sequelize({
      connectionLimit: 5000,
      username: config[`${mode}`]?.username,
      password: config[`${mode}`]?.password,
      database: choice?.db,
      host: config[`${mode}`]?.host,
      dialect: config[`${mode}`]?.dialect,
      port: 3306,
    });

    const auth = await sequelize.authenticate();
    if (!auth) {
      console.log(chalk.bold.green(`Mode : ${mode}`));
      console.log(
        chalk.bold.blue(`Connected on Database : ${config[`${mode}`].database}`)
      );
      const pathMig = path.resolve(__dirname, `../../../migrations/${mode}/`);

      const migrations = await readDir(`${pathMig}/*.js`);

      const migrationModel = sequelize.define(
        "migrations_controll",
        migratorModel,
        {
          timestamps: false,
        }
      );
      const migratorbatch = await migrationModel.findAll();
      const apllied = [];
      const notApllied = [];

      migrations.forEach((ee) => {
        const name = ee.split("/")[ee.split("/")?.length - 1];

        const findIdx = migratorbatch.findIndex((e) => {
          return e.file == name;
        });
        if (findIdx <= -1) {
          notApllied.push({
            status: chalk.bold.red("Y"),
            name: chalk.green.red(name),
          });
        } else {
          apllied.push({
            status: chalk.green.green("S"),
            name: chalk.green.green(name),
          });
        }
      });

      const formmatedData = [...notApllied, ...apllied];
      console.log(
        chalkTable(
          {
            leftPad: 2,
            columns: [
              { field: "status", name: "Status" },
              { field: "name", name: "name" },
            ],
          },
          formmatedData
        )
      );
    } else {
      throw "Unable to connect to the database!";
    }
  } catch (error) {
    console.log(chalk.bold.red("Unable to connect to the database!", error));
  }
};

export default { makeMigrate, publishMigrations };
