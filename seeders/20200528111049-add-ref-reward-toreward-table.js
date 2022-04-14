'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const d = new Date();
    const uuid = require( 'uuid/v4');
    await queryInterface.bulkInsert('Rewards',[{
      id: uuid(),
      name: 'referral',
      amount: 100000,
      currencyId:'hdp.ф',
      createdAt:d,
      updatedAt:d
    }
    ],{
      ignoreDuplicates: true
    })
  },

  down: async (queryInterface, Sequelize) => {

  }
};
