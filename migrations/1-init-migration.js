'use strict';

module.exports = {
    up: async function(queryInterface, Sequelize)
    {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname,'..', 'scheme_dump.sql');

        if(fs.existsSync(filePath)){
            await queryInterface.sequelize.query(fs.readFileSync(filePath,{encoding:'utf8'}));
        }
    }
};
