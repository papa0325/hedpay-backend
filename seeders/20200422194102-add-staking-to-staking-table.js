'use strict';
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const uuid = require( 'uuid/v4');
      await queryInterface.bulkInsert('Staking', [
        {
          id:uuid(),
          min: 10000,
          max: 200000,
          percentage: 7,
          price: 0.5,
          createdAt: d,
          updatedAt: d
        }, {
          id:uuid(),
          min: 200001,
          max: 500000,
          percentage: 12,
          price: 1,
          createdAt: d,
          updatedAt: d
        }, {
          id:uuid(),
          min: 500001,
          max: null,
          percentage: 18,
          price: 2,
          createdAt: d,
          updatedAt: d
        }
      ]);
  },

  down: async (queryInterface, Sequelize) => {

  }
};
