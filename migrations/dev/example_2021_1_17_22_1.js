module.exports = {
  up: async (q, s) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await q.createTable('users', { id: s.INTEGER });
     */

    await q.createTable("justificativa", {
      id: {
        type: s.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      justificativa: {
        type: "VARCHAR(60)",
        defaultValue: null,
        allowNull: true,
      },
      diatrabalhofk: {
        type: s.INTEGER,
        defaultValue: null,
        allowNull: true,
        unique: true,
      },
    });
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
