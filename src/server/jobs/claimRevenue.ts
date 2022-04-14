import { literal, Op } from 'sequelize';
import BigNumber from 'bignumber.js';
import { ActiveStake } from '../models/ActiveStake';
import { Wallet } from '../models/Wallet';

function claimRevenue() {
  return ActiveStake.update({
    receivable: literal('"receivable" + "revenue" '),
    revenue: 0
  }, {
    where: {
      status: ActiveStake.STATUS_ACTIVE
    }
  });
}

async function claimReceivable(stake) {
  try {
    const reward = stake.receivable + stake.deposit;
    const wallet = await Wallet.findOne({
      where: {
        userId: stake.userId,
        currencyId: 'hdp.ф'
      }
    });
    const newBalance = new BigNumber(reward)
      .shiftedBy(wallet.currency.decimals)
      .plus(wallet.balance)
      .toNumber();
    await wallet.update({
      balance: newBalance
    });
    await stake.update({
      status: ActiveStake.STATUS_WITHDRAWN
    });
  }
  catch (e) {
    console.log(e);
  }
}

export default async function () {
  await claimRevenue();
  const stakes = await ActiveStake.findAll({
    where: {
      status: ActiveStake.STATUS_CLOSED
    }
  });
  await Promise.all(stakes.map((stake) => claimReceivable(stake)));
}
