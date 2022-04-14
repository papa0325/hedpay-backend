'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        await queryInterface.addColumn('ActiveStakes', 'unlockDate', {
            type: Sequelize.DATE
        })
    },

    down: async (queryInterface, Sequelize) => {

        await queryInterface.removeColumn('ActiveStakes', 'unlockDate')
    }
};
