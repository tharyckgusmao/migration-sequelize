export default {
  dev: {
    username: "-",
    password: "-",
    database: "-",
    host: "-",
    dialect: "mysql",
    preffix: "-_",
  },
  stag: {
    username: "-",
    password: "'-",
    database: "-",
    host: "-",
    dialect: "mysql",
  },
  prod: {
    username: "-",
    password: "tc05FwKeRJGbXELy0soN",
    database: "-",
    host: "-",
    dialect: "mysql",
    preffix: "-_",
    dialectOptions: {
      ssl: "Amazon RDS",
    },
  },
};
