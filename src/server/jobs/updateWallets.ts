import { Op } from 'sequelize';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { addJob } from '../utils/helpers';

export default async () => {
  // Find all users. Check if they have wallets for all assosiated currencies. If not -- create one.
  const users = await User.findAll({
    where: {
      status: {
        [Op.not]: -1
      }
    },
    include: [{
      model: Wallet,
      as: 'wallets'
    }]
  });
  const missingUsers = [];
  users.forEach((user) => {
    ['hdp.ф', 'usdt', 'eth', 'btc'].forEach((cur) => {
      if (!user.wallets.find((wallet) => wallet.currency.id === cur)) {
        missingUsers.push({
          userId: user.id,
          currency: cur
        });
      }
    });
  });
  // console.log(missingUsers);
  for (const user of missingUsers) {
    // eslint-disable-next-line no-await-in-loop
    setTimeout(() => {
      addJob('createWallet', user);
    }, 5000);
  }
  // Promise.all(missingUsers.map((user) => addJob('createWallet', user)));
};
