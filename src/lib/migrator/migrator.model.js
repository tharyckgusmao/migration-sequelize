import { Sequelize } from "sequelize";

export default {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  file: Sequelize.STRING,
  batch: Sequelize.INTEGER,
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
};
