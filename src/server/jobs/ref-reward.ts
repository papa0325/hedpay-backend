import * as Big from 'big-js';
import { TYPE_NEW_TRANSACTION, TYPE_NEW_USER } from '../store/constants/rewards';
import { Transaction } from '../models/Transaction';
import { Wallet } from '../models/Wallet';
import { Rewards } from '../models/Rewards';
import { TOKEN } from '../store/constants/default-currencies';
import { TX_PENDING, TX_FAILED, TX_COMPLETE } from '../store/constants/tx-status';
import { ReferralStat } from '../models/ReferralStat';
import { User } from '../models/User';
import BigNumber from 'bignumber.js';

Big.RM = 0;

interface IRefReward {
  type: string;
  userId: string;
  amount?: string;
  refRecord: any;
}

export default async (data: IRefReward) => {
  const rewardRecord: Rewards = await Rewards.findOne();

  const REWARD_FOR_NEW_USER = rewardRecord
    ? new BigNumber(rewardRecord.amount)
    : new BigNumber(100000); // 10 TOKENS
  const REWARD_FOR_PURCHASE_PERCENT = rewardRecord
    ? new BigNumber(rewardRecord.percentRewardForTransaction).shiftedBy(3)
    : new BigNumber(0.05); // 5 %

  const { type, userId, amount, refRecord } = data;

  const wallet = await Wallet.findOne({
    where: {
      currencyId: TOKEN,
      userId,
    },
    include: ['currency'],
  });

  const bonusStat = await ReferralStat.findOne({
    where: {
      userId,
    },
  });

  const tx = await Transaction.create({
    status: TX_PENDING,
    amount: '0',
    userId,
    walletId: wallet.id,
    currencyId: TOKEN,
    type: 0,
    to: wallet.address,
    description: 'Referral reward',
    meta: {},
  });

  let reward;
  const initiator = await User.findByPk(
    type === TYPE_NEW_USER ? refRecord.userId : refRecord.refId,
    {
      attributes: ['username'],
    }
  );

  tx.set({ 'meta.initiator': initiator.username });
  await tx.save();

  try {
    if (type === TYPE_NEW_USER) {
      if (rewardRecord && rewardRecord.payRewardFixed) reward = REWARD_FOR_NEW_USER;
    } else if (type === TYPE_NEW_TRANSACTION) {
      if (rewardRecord && rewardRecord.payRewardForTransaction)
        reward = new BigNumber(amount)
          .shiftedBy(wallet.currency.decimals)
          .multipliedBy(REWARD_FOR_PURCHASE_PERCENT);
    } else {
      throw new Error('Invalid type of reward');
    }

    tx.set({ amount: reward, status: TX_COMPLETE });
    wallet.set({ balance: new BigNumber(wallet.balance).plus(reward) });
    bonusStat.set({
      bonusAmount: new BigNumber(bonusStat.bonusAmount).plus(reward).toFixed(0),
    });
    await wallet.save();
    await bonusStat.save();
  } catch (e) {
    console.log(e);
    tx.set({ status: TX_FAILED });
  } finally {
    await tx.save();
  }
};
