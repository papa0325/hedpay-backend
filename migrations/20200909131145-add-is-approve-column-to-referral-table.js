'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.addColumn('Referrals', 'isApprove', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
      transaction.commit();
    } catch (e) {
      transaction.rollback();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.removeColumn('Referrals', 'isApprove');
      transaction.commit();
    } catch (e) {
      transaction.rollback();
    }
  },
};
