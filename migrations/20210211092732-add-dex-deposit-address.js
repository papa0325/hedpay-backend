'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.addColumn('Users', 'depositDex', {
        type: Sequelize.STRING,
      });
      transaction.commit();
    } catch (e) {
      transaction.rollback();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.removeColumn('Users', 'depositDex');
      transaction.commit();
    } catch (e) {
      transaction.rollback();
    }
  },
};
