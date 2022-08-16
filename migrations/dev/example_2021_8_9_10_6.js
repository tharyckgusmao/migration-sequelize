module.exports = {
  up: async (q, s) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await q.createTable('users', { id: s.INTEGER });
     */
    await q.addColumn("funcionario", "fuso", s.INTEGER(4), {
      defaultValue: null,
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
