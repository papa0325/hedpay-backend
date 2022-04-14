import { Op } from 'sequelize';
import * as Big from 'big-js';
import { getDate } from '../utils';
import { Wallet } from '../models/Wallet';

export default async function (payload, helpers) {
  const nextStart = getDate(new Date(), 60000); // every minute

  const expiredBonusWallets = await Wallet.findAll({
    where: {
      'settings.greetingBonus.until': {
        [Op.lt]: new Date()
      }
    },
    attributes: {
      include: ['settings']
    }
  });

  for (const wallet of expiredBonusWallets) {
    wallet.balance = (Big(wallet.balance) - Big(wallet.settings.greetingBonus.amount)).toString();
    wallet.set({ 'settings.greetingBonus': null });
    await wallet.save();
  }

  await helpers.addJob('returnGreetingBonus', {}, { runAt: nextStart });
}
