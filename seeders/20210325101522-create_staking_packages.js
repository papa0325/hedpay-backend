
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('StakingPackages', [
      {
        id: 1,
        minValue: 10000,
        interest: 0.06,
        fee: 0.01,
        createdAt: d,
        updatedAt: d

      },
      {
        id: 2,
        minValue: 100000,
        interest: 0.09,
        fee: 0.008,
        createdAt: d,
        updatedAt: d

      },
      {
        id: 3,
        minValue: 250000,
        interest: 0.12,
        fee: 0.006,
        createdAt: d,
        updatedAt: d

      },
      {
        id: 4,
        minValue: 500000,
        interest: 0.18,
        fee: 0.005,
        createdAt: d,
        updatedAt: d

      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('StakingPackages', null, {});
  }
};
