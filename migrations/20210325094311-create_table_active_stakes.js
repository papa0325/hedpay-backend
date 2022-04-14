'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('ActiveStakes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deposit: {
        type: Sequelize.DECIMAL,

      },
      revenue: {
        type: Sequelize.DECIMAL,

      },
      receivable: {
        type: Sequelize.DECIMAL,

      },
      minValue: {
        type: Sequelize.DECIMAL,

      },
      interest: {
        type: Sequelize.DECIMAL,

      },
      fee: {
        type: Sequelize.DECIMAL,

      },
      endingDate: {
        type: Sequelize.DATE,

      },
      status: {
        type: Sequelize.STRING,

      },
      userId: {
        type: Sequelize.STRING,

      },
      createdAt: {
        type: Sequelize.DATE,

      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('ActiveStakes')
  }
};
