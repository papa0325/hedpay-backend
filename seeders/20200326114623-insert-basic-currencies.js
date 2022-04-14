'use strict';
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Currencies',[{
      id: 'eth',
      fullTitle: 'Ethereum',
      decimals: 18,
      currentRate: 0,
      symbol:'ETH',
      createdAt:d,
      updatedAt:d
    }, {
      id: 'hdp.ф',
      fullTitle: 'HEdpAY',
      decimals: 4,
      currentRate: 0,
      symbol:'Hdp.ф',
      parentId: 'ETH',
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'btc',
      fullTitle: 'BitCoin',
      decimals: 8,
      currentRate: 0,
      parentId: null,
      symbol:'BTC',
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'gbp',
      fullTitle: 'Pound sterling',
      decimals: 2,
      symbol:'£',
      fiat:true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'cad',
      fullTitle: 'Canadian Dollar',
      decimals: 2,
      symbol:'CA$',
      fiat:true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'cny',
      fullTitle: 'Chinese yen',
      decimals: 2,
      symbol:'¥',
      fiat:true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'aed',
      fullTitle: 'UAE Dirham',
      decimals: 2,
      symbol:'AED',
      fiat:true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    }, {
      id: 'eur',
      fullTitle: 'Euro',
      decimals: 2,
      symbol:'€',
      fiat:true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    },
    {
      id: "jpy",
      fullTitle: "Japanese yen",
      decimals: 2,
      symbol: "¥",
      fiat: true,
      currentRate: 0,
      parentId: null,
      createdAt:d,
      updatedAt:d,
    }
    ],{
      ignoreDuplicates: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Currencies',{
      id:{[Sequelize.Op.in]:['hdp.ф','eth']}
    })
  }
};
