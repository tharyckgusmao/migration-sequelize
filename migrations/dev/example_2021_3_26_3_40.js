module.exports = {
  up: async (q, s) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await q.createTable('users', { id: s.INTEGER });
     */

    await q.addColumn("adicionalnoturno", "datacriacao", "TIMESTAMP", {
      defaultValue: s.literal("CURRENT_TIMESTAMP"),
      allowNull: true,
    });
    await q.addColumn("horaextra", "datacriacao", "TIMESTAMP", {
      defaultValue: s.literal("CURRENT_TIMESTAMP"),
      allowNull: true,
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
