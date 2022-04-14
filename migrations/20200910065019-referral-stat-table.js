'use strict';
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    

    return queryInterface.createTable('ReferralStat', {
      bonusAmount: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: '0',
        allowNull: false
      },
      refCount: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      invitationCount: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      userId: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        references: {
          model: {
            tableName: 'Users',
            schema: 'public'
          },
          key: 'id'
        },
        allowNull: false
      },
      currencyId: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: 'hdp.ф',
        references: {
          model: {
            tableName: 'Currencies',
            schema: 'public'
          },
          key: 'id'
        },
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: d
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: d
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ReferralStat');
  }
};
