'use strict';
const d = new Date();
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const uuid = require( 'uuid/v4');
        const session = await queryInterface.bulkInsert('TokenDistributionSessions',[{
            id:uuid(),
            boughtAmount:0,
            leftAmount:1000000,
            createdAt:d,
            updatedAt:d,
        }],{
            returning:true
        });
        if(session.length){
            const sessionID = session[0].id;
            await queryInterface.bulkInsert('TokenDistributionSessionsPacks', [
                {
                    id:uuid(),
                    limit: 70000,
                    price: 0.0003,
                    currencyID: 'eth',
                    sessionID,
                    min: 333,
                    max: 3500,
                    lastCounterDropTime:null,
                    counterInterval:24,
                    createdAt: d,
                    updatedAt: d
                }, {
                    id:uuid(),
                    limit: 100000,
                    price: 0.0005,
                    currencyID: 'eth',
                    sessionID,
                    min: 200,
                    max: 5000,
                    lastCounterDropTime:null,
                    counterInterval:24,
                    createdAt: d,
                    updatedAt: d
                }, {
                    id:uuid(),
                    limit: 150000,
                    price: 0.0007,
                    currencyID: 'eth',
                    sessionID,
                    min: 142,
                    max: 7500,
                    lastCounterDropTime:null,
                    counterInterval:24,
                    createdAt: d,
                    updatedAt: d
                }, {
                    id:uuid(),
                    limit: 400000,
                    price: 0.001,
                    currencyID: 'eth',
                    sessionID,
                    min: 5000,
                    max: 20000,
                    lastCounterDropTime:null,
                    counterInterval:72,
                    createdAt: d,
                    updatedAt: d
                }, {
                    id:uuid(),
                    limit: 500000,
                    currencyID: 'eth',
                    sessionID,
                    price: 0.003,
                    min: 1666,
                    max: 25000,
                    lastCounterDropTime:null,
                    counterInterval:72,
                    createdAt: d,
                    updatedAt: d
                }, {
                    id:uuid(),
                    limit: 1000000,
                    currencyID: 'eth',
                    sessionID,
                    price: 0.0035,
                    min: 1428,
                    max: 50000,
                    lastCounterDropTime:null,
                    counterInterval:72,
                    createdAt: d,
                    updatedAt: d
                }
            ]);
        }

    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('TokenDistributionSessionsPacks', {
            limit: { [Sequelize.Op.in]: [1000000, 500000,400000,150000,100000,70000] }
        });
    }
};
