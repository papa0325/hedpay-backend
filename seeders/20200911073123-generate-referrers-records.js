/* eslint-disable */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let Seq = require('sequelize-typescript');
    let { config } = require('dotenv');
    config();
    const newDB = new Seq.Sequelize(process.env.DB_LINK, { dialect: 'postgres' });
    newDB.sync();

    const data = [];
    const currentDate = new Date();
    const users = await newDB.query(`SELECT id FROM public."Users" WHERE status > 0`, {
      raw: true,
    });
    
    users[0].forEach((user) => {
      data.push({
        userId: user.id,
        bonusAmount: '0',
        currencyId: 'hdp.ф',
        refCount: 0,
        invitationCount: 0,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    });
    
    // await queryInterface.bulkInsert('ReferralStat', data, {
    //   ignoreDuplicates: true,
    // });
    
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
