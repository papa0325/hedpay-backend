/*eslint-disable*/
import axios from 'axios';
import { Op } from 'sequelize';
import { IsUUID } from 'sequelize-typescript';
import { Currency } from '../models/Currency';
import { Notification } from '../models/Notification';
import config from '../config/config';
import { RatesHistory } from '../models/RatesHistory';
import { getDate, getUUID } from '../utils';
import { addJob, deleteJob, diffIn } from '../utils/helpers';

import {
  ETHID,
  HDPID
} from '../utils/NumConverter/constants';
import { UserStaking } from '../models/UserStaking';
import { Staking } from '../models/Staking';
import { DECIMALED } from '../utils/NumConverter/actions';
import { StakingRewards } from '../models/StakingRewards';


export default async function (p, h) {
  await deleteJob('staking-reward-enroll');
  const currentDate = new Date();

  try {
    const isPreRollDay = !((currentDate.getMinutes() + 1) % 2);
    const enrollDay = !(currentDate.getMinutes() % 2);

    if (enrollDay) {
      const converter = await Currency.getConverter();

      const packs = await UserStaking.findAll({
        include: [{
          model: Staking,
          required: true
        }],
        order: [['createdAt', 'DESC']]
      });

      for (const pack of packs) {
        const count = await Notification.count({ where: { userId: pack.userId } });
        if (count > 12) {
          continue;
        }

        const BigPackAmount = converter[DECIMALED](pack.amount, HDPID);
        if (enrollDay) {
          const rew = BigPackAmount.n.times(parseFloat(pack.stake.percentage) / 100).div(6);
          const rewardAmount = BigPackAmount.n.times(parseFloat(pack.stake.percentage) / 100).div(6).toString();
          const totalRewardAmount = converter[DECIMALED](pack.totalRewardAmount, HDPID);
          pack.set({
            totalRewardAmount: totalRewardAmount.n.plus(rewardAmount),
            rewardCount: pack.rewardCount + 1
          });
          const newReward = await StakingRewards.create({
            userId: pack.userId,
            stakeId: pack.id,
            amount: rewardAmount
          });
          await pack.save();
          const B_Reward = converter[DECIMALED](rewardAmount, HDPID);
          const newNotification = await Notification.createNotification(pack.userId, {
            type: 0,
            subject: 'Reward Notification',
            message: `Received a monthly reward: ${B_Reward.d.toFixed(2)}, choose where to enroll`,
            approveToken: newReward.id
          });

          await addJob('NotificationBroker', { notificationId: newNotification.id });
        }
        else {
          // console.log('preroll')
        }
      }
    }
  }
  catch (e) {
    console.log(e);
  }

  currentDate.setMinutes(currentDate.getMinutes() + 1);
  await addJob('staking-reward-enroll', null, { run_at: currentDate });
}
