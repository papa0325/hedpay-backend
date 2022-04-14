'use strict';
const d = new Date();

const uuid = require('uuid/v4')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Contacts', {
      id: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: () => uuid(),
        allowNull: false,
        unique: true
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
      contactId: {
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
    return queryInterface.dropTable('Contacts');
  }
};
