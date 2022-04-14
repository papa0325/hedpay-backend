'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('StakingPackages', {
       id: {
         allowNull: false,
         autoIncrement: true,
         primaryKey: true,
         type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('StakingPackages')
  }
};
