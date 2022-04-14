'use strict';


const fieldScheme = {
  'user_name': 'firstName',
  'user_nicename': 'firstName',
  'user_lname': 'lastName',
  'user_email': 'email',
  'user_pass': 'password',
  'user_ip':'settings',
  'public_key': 'settings',
  'private_key': 'settings',
  'wallet_address': 'settings',
  // 'signup_date': 'createdAt',
};


module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {

      let Seq = require('sequelize-typescript');
      let {config} = require('dotenv');
      config();
      const newDB = new Seq.Sequelize(
          process.env.DB_LINK,
          { dialect: 'postgres' });
      newDB.sync();

      const d = new Date();
      const uuid = require('uuid/v4');
      const tableDescribe = await queryInterface.describeTable(`Users`);
      let newUsers = await newDB.query('select * from wp_users where user_email is not null', { raw: true });

      newUsers = newUsers[0].map(record => {
        const newRecord = {
          id: uuid(),
          updatedAt: d,
          createdAt: d,
          // settings: "{}",
          status: -1
        };
        for (let n in record) {
          if (fieldScheme[n]) {
            if (fieldScheme[n] === 'settings') {
              newRecord.settings[n] = record[n]
            }
            else if (tableDescribe[fieldScheme[n]]) {
              const fieldName = fieldScheme[n];
              if (fieldName)
                newRecord[fieldScheme[n]] = record[n]
            }
          }
        }
        return newRecord;
      });
      await queryInterface.bulkInsert(`Users`, newUsers, {
        ignoreDuplicates: true
      });
    }catch (e) {
      console.log(e);
    }
    // console.log(``)
    // console.log(`file ${f}`);
    // console.log(`${recordList.length + skipped} total records`);
    // console.log(`${recordList.length} records was selected to insert`);
    // console.log(`${skipped} skipped`);
    // console.log(``)
  },

  down: (queryInterface, Sequelize) => {

  }
};
