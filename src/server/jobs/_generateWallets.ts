/* eslint-disable @hapi/hapi/for-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Op } from 'sequelize';
import { Wallet } from '../models/Wallet';
import { addJob } from '../utils/helpers';
import { User } from '../models/User';
import { BTC, MAIN_CURRENCY, TOKEN } from '../store/constants/default-currencies';
import { getDate } from '../utils';


export default async () : Promise<void> => {
  const users = await User.findAll({
    where: {
      status: {
        [Op.or]: [1, -2, 2]
      }
    }
  });

  for (let i = 0; i < users.length; i++) {
    for (const curr of [BTC, MAIN_CURRENCY, TOKEN]) {
      const wallet = await Wallet.findOne({
        where: {
          userId: users[i].id,
          currencyId: curr
        }
      });

      if (!wallet) {
        await addJob('createWallet', { userId: users[i].id, currency: curr }, { run_at: getDate(new Date(), 1000 * i) });
      }
    }
  }
};
