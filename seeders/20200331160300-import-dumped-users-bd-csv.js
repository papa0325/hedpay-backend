'use strict';

const fieldScheme = {
  'user_name': 'firstName',
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

    const d = new Date();
    const parse = require('csv-parse');
    const fs = require('fs');
    const path = require('path');
    const uuid = require( 'uuid/v4');
    const tableDescribe = await queryInterface.describeTable(`Users`);
    const directoryPath = path.join(__dirname,'..', 'database_dumps','users');

    if(fs.existsSync(directoryPath)){
     const fileList = fs.readdirSync(directoryPath);
      for(let i in fileList){
        let f = fileList[i];
        let recordList = [];
        let skipped = 0;
        const parser = parse({
          trim: true,
          skip_empty_lines: true,
          columns:true,
          delimiter:';'
        });
        parser.on('readable',async ()=>{
          let record;
          while (record = parser.read()){
            if(!parseInt(record[`safety_status`]) && record[`user_email`].trim().length){
              let newRecord = {updatedAt:d,createdAt:d, settings:{},status:-1};
              for(let n in record){
                if(fieldScheme[n]){
                  if(fieldScheme[n] === 'settings'){
                    newRecord.settings[n] = record[n]
                  }else if(tableDescribe[fieldScheme[n]]){
                    const fieldName = fieldScheme[n];
                    if(fieldName)
                      newRecord[fieldScheme[n]] = record[n]
                  }
                }
              }
              newRecord.settings = JSON.stringify(newRecord.settings);
              newRecord.id = uuid();
              recordList.push(newRecord);
            }else{
              skipped++
            }
          }
        });
        parser.on('error',err => console.log(err.message));
        parser.write(fs.readFileSync(path.join(directoryPath,f)));
        parser.end();
        await queryInterface.bulkInsert(`Users`,recordList,{
          ignoreDuplicates: true
        });
        console.log(``)
        console.log(`file ${f}`);
        console.log(`${recordList.length + skipped} total records`);
        console.log(`${recordList.length} records was selected to insert`);
        console.log(`${skipped} skipped`);
        console.log(``)
      }
    }
  },

  down: (queryInterface, Sequelize) => {

  }
};
