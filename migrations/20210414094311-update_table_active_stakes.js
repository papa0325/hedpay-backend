'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return Promise.all([

            queryInterface.changeColumn('ActiveStakes',
                'deposit', {
                    type: Sequelize.DOUBLE
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'revenue', {
                    type: Sequelize.DOUBLE
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'receivable', {
                    type: Sequelize.DOUBLE
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'minValue', {
                    type: Sequelize.DOUBLE
                },
            ),
            queryInterface.changeColumn('ActiveStakes',
                'interest', {
                    type: Sequelize.DOUBLE
                },
            ),
            queryInterface.changeColumn('ActiveStakes',
                'fee', {
                    type: Sequelize.DOUBLE
                },
            )
        ])
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        return Promise.all([

            queryInterface.changeColumn('ActiveStakes',
                'deposit', {
                    type: Sequelize.DECIMAL
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'revenue', {
                    type: Sequelize.DECIMAL
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'receivable', {
                    type: Sequelize.DECIMAL
                },
            ),

            queryInterface.changeColumn('ActiveStakes',
                'minValue', {
                    type: Sequelize.DECIMAL
                },
            ),
            queryInterface.changeColumn('ActiveStakes',
                'interest', {
                    type: Sequelize.DECIMAL
                },
            ),
            queryInterface.changeColumn('ActiveStakes',
                'fee', {
                    type: Sequelize.DECIMAL
                },
            )
        ])
    }
};
