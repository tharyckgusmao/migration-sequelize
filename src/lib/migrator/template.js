import migratorModel from "./migrator.model";

export const templateMigrate = `module.exports = {
  up: async (q, s) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await q.createTable('users', { id: s.INTEGER });
     */
  },

  down: async (q, s) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await q.dropTable('users');
     */
  },
};
`;

export const tablesMigrate = async (q, s) => {
  const c = await q.createTable("migrations_controlls", migratorModel);
};
