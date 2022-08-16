const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (q, s) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await q.createTable('users', { id: s.INTEGER });
     */

    const t = await q.sequelize.query(
      `${"SELECT * FROM "}${q.sequelize.config.database}.funcionario`,
      { raw: true, type: QueryTypes.SELECT }
    );

    console.log(t);
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
