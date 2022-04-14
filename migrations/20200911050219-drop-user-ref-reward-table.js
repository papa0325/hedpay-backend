'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserRefReward');
  },

  down: async (queryInterface, Sequelize) => {
  }
};
