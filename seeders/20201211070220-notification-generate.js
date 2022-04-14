/*eslint-disable*/
const uuid = require('uuid/v4');

const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (let i = 0; i < 3; i++) {
      await queryInterface.bulkInsert('Notifications', [{
        id: uuid(),
        userId: '047c3753-96ad-40b1-9925-46ebd1a83adc',
        seen: false,
        type: null,
        meta: JSON.stringify({
          "type": 0,
          "message": "Received a monthly reward: 116.66, choose where to enroll",
          "subject": "Reward Notification",
          "approveToken": "8a97bf51-4fc2-4e9a-8c7b-9daee140688f"
      }),
        transport: 0,
        createdAt: d,
        updatedAt: d
      }], {
        ignoreDuplicates: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
  }
};
