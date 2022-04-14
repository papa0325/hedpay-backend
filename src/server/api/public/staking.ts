import * as Big from 'big-js';
import { literal, Op, where } from 'sequelize';
import { type } from 'os';
import BigNumber from 'bignumber.js';
import { DistributionSession } from '../../models/DistributionSession';
import { error, output } from '../../utils';
import { Transaction } from '../../models/Transaction';
import { Order } from '../../models/Order';
import { Wallet } from '../../models/Wallet';
import { DistributionSessionPacks } from '../../models/DistributionSessionPacks';
import { Currency } from '../../models/Currency';
import { addJob } from '../../utils/helpers';
import { Staking } from '../../models/Staking';
import { UserStaking } from '../../models/UserStaking';
import { DECIMALED, RATE } from '../../utils/NumConverter/actions';
import {
  ETHID,
  HDPID
} from '../../utils/NumConverter/constants';
import { Notification } from '../../models/Notification';
import { StakingRewards } from '../../models/StakingRewards';
import { StakingPackage } from '../../models/StakingPackage';
import sequelize from '../../models';
import { ActiveStake } from '../../models/ActiveStake';

// TODO Refactor this method
export const getStackingList = async (r, h) => {
  try {
    const packs = await Staking.getPacks();
    return output(packs);
  }
  catch (e) {
    console.log(e);
  }
};

export const listStakingPackages = async (r, h) => {
  try {
    const packages = await StakingPackage.findAll({
      order: [['minValue', 'ASC']]
    });
    return output({ packages });
  }
  catch (e) {
    console.log(e);
    return output({ packages: [] });
  }
};

export const listActiveStakes = async (r, h) => {
  try {
    const stakes = await ActiveStake.findAndCountAll({
      where: {
        userId: r.auth.credentials.id
      },
      limit: r.query.limit,
      offset: r.query.offset
    });
    return output({
      stakes
    });
  }
  catch (e) {
    return error(500000, 'Unable to list all stakes', {});
  }
};

export const createNewStake = async (r, h) => {
  const { amount } = r.payload;
  const pack = await StakingPackage.findOne({
    where: {
      minValue: {
        [Op.lte]: amount
      }
    },
    order: [['minValue', 'DESC']]
  });
  if (!pack) {
    return error(400000, 'Unable to find appropriate package', {});
  }

  const fee = 1 + parseFloat(pack.fee);
  const requiredSum = amount * fee;
  const wallet = await Wallet.findOne({
    where: {
      userId: r.auth.credentials.id,
      currencyId: 'hdp.ф'
    }
  });
  if (!wallet) {
    return error(500000, 'Unable to find required wallet', {});
  }

  const diff = new BigNumber(requiredSum)
    .shiftedBy(wallet.currency.decimals).minus(wallet.balance).negated();
  if (diff.isLessThan(0)) {
    return error(402000, 'Insufficient funds', {
      requiredSum
    });
  }

  try {
    await wallet.update({ balance: diff.toNumber() });
  }
  catch (e) {
    return error(500000, 'Unable to process payment', {});
  }
  // Calculate fee + amount, check if user has sufficient funds

  // if so, find a package, copy its fields to a stake
  try {
    const currentDate = Date.now();
    const endingDate = new Date(currentDate);
    const unlockDate = new Date(currentDate);
    unlockDate.setMonth(unlockDate.getMonth() + 3);
    endingDate.setFullYear(endingDate.getFullYear() + 1);
    const params = {
      deposit: amount,
      revenue: 0,
      receivable: 0,
      minValue: Number(pack.minValue),
      interest: Number(pack.interest),
      fee: Number(pack.fee),
      status: ActiveStake.STATUS_ACTIVE,
      userId: r.auth.credentials.id,
      endingDate,
      unlockDate

    };
    const stake = await ActiveStake.create(params);
    return output({ stake });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Unable to create new stake', {});
  }
};

export const claimStake = async (r, h) => {
  try {
    const result = await ActiveStake.update({
      status: ActiveStake.STATUS_CLOSED
    },
    {
      where: {
        id: r.params.id,
        userId: r.auth.credentials.id,
        status: ActiveStake.STATUS_ACTIVE,
        unlockDate: {
          [Op.lte]: Date.now()
        }
      }
    });
    if (result[0]) {
      return output({ message: 'Your request was accepted' });
    }

    return error(403000, 'This operation is forbidden', null);
  }
  catch (e) {
    return error(500000, 'Unable to update package', {});
  }
};

export const getUserStaking = async (r, h) => {
  try {
    let { count, packs } = await UserStaking.getPacks(r.auth.credentials.id,
      r.query.offset || 0, r.query.limit || 5);
    const converter = await Currency.getConverter();

    const stakes = await UserStaking.getStakesSum(r.auth.credentials.id);

    const B_totalAmount = converter[DECIMALED](stakes[0].dataValues.total_amount || 0, HDPID);
    const withdrawableStakes = await UserStaking.getWithdrawable(r.auth.credentials.id);
    const currDate = new Date();
    const USDRate = converter[RATE](HDPID).d.toString();

    packs = packs.map((itm) => {
      const d = new Date(itm.unlockDate);
      const amount = converter[DECIMALED](itm.amount || 0, HDPID);

      return {
        id: itm.id,
        withdrawable: d.getTime() < currDate.getTime(),
        usdRate: USDRate,
        amount: amount.d.toString(),
        inUSDAmount: amount.d.times(USDRate).toString(),
        unlockDate: itm.unlockDate,
        lockDate: itm.createdAt,
        stakeId: itm.stakeId,
        interest: itm.stake.percentage,
        earnings: converter[DECIMALED](itm.totalRewardAmount, HDPID).d.toFixed(0)
      };
    });

    return output({
      list: packs,
      total: count,
      totalReward: B_totalAmount.d.toFixed(2),
      allStakesUnlockDate: stakes[0].dataValues.all_stakes_unlock_date,
      withdrawablePacks: withdrawableStakes
    });
  }
  catch (e) {
    console.log(e);
  }
};

export const purchaseStaking = async (r, h) => {
  try {
    const stake = await Staking.findOne({
      where: { id: r.payload.id }
    });
    const converter = await Currency.getConverter();

    if (!stake) {
      return error(400000, 'Stake not found', { field: 'id', reason: 'not found' });
    }

    const wallets = await Wallet.getUserWallets(r.auth.credentials.id, [ETHID, HDPID]);

    const BigHDP = converter[DECIMALED](wallets[HDPID].balance, HDPID);
    const BigETH = converter[DECIMALED](wallets[ETHID].balance, ETHID);
    const BigStakePrice = converter[DECIMALED](stake.price, ETHID);
    const purchaseAmount = converter[DECIMALED](r.payload.amount, HDPID);

    const existsStake = await UserStaking.findOne({
      where: {
        stakeId: r.payload.id,
        userId: r.auth.credentials.id
      }
    });
    if ((!existsStake || existsStake.rewardCount > 0) && BigETH.d.lt(stake.price)) {
      return error(400000, 'Insufficient ETH', { field: 'currency', reason: ETHID });
    }

    if (BigHDP.d.lt(r.payload.amount)) {
      return error(400000, 'Insufficient HDP', { field: 'currency', reason: HDPID });
    }

    const newOrder = await Order.create({
      userId: r.auth.credentials.id,
      pairName: 'HDPETH',
      side: 2,
      amount: 0,
      unitPrice: purchaseAmount.p.toString(),
      status: 1,
      leftSideSymbolId: HDPID,
      rightSideSymbolId: ETHID
    });

    let txData = {
      amount: purchaseAmount.p.toString(),
      status: 1,
      type: 1,
      to: null,
      currencyId: HDPID,
      walletId: wallets[HDPID].id,
      userId: r.auth.credentials.id,
      orderId: newOrder.id
    };

    await Transaction.create(txData);
    let stakeId = existsStake ? existsStake.id : null;
    wallets[HDPID].set({ balance: BigHDP.n.minus(purchaseAmount.p).toString() });
    await wallets[HDPID].save();

    if (!existsStake || existsStake.rewardCount > 0) {
      txData = {
        ...txData,
        ...{
          amount: BigStakePrice.p.toString(),
          currencyId: ETHID,
          walletId: wallets[ETHID].id
        }
      };
      await Transaction.create(txData);

      wallets[ETHID].set({ balance: BigETH.n.minus(BigStakePrice.p).toString() });
      await wallets[ETHID].save();
      const d = new Date();
      // d.setMonth(d.getMonth() + 3);
      d.setMinutes(d.getMinutes() + 6);
      const userStaking = await UserStaking.create({
        stakeId: stake.id,
        userId: r.auth.credentials.id,
        amount: purchaseAmount.p.toString(),
        unlockDate: d
      });
      stakeId = userStaking.id;
    }
    else {
      const BigExistsBalance = converter[DECIMALED](existsStake.amount, HDPID);
      existsStake.set({ amount: BigExistsBalance.n.plus(purchaseAmount.p) });
      await existsStake.save();
    }

    return output({ stakingId: stakeId });
  }
  catch (e) {
    console.log(e);
  }
};

export const withdrawStaking = async (r, h) => {
  try {
    const stake = await UserStaking.findOne({
      where: {
        id: r.payload.id
      },
      include: [{
        model: Staking,
        required: true
      }]
    });

    const currentDate = new Date();
    if (!stake) {
      return error(400000, 'Stake not found', { field: 'id', reason: 'not found' });
    }

    const converter = await Currency.getConverter();

    // if(currentDate.getTime() < (new Date(stake.unlockDate)).getTime())
    //     return error(400000, 'Funds still locked', {field: 'date', reason: 'locked'});

    const wallets = await Wallet.getUserWallets(r.auth.credentials.id, [ETHID, HDPID]);

    const BigMin = converter[DECIMALED](stake.stake.min, HDPID);
    // let BigMax = stake.stake.max? converter[DECIMALED](stake.stake.max,HDPID): null;
    const BigCurrentAmount = converter[DECIMALED](stake.amount, HDPID);
    const BigAmount = converter[DECIMALED](r.payload.amount, HDPID);
    const BigHDPBalance = converter[DECIMALED](wallets[HDPID].balance, HDPID);

    if (BigAmount.n.gt(stake.amount)) {
      return error(400000, 'Insufficient HDP', { field: 'currency', reason: 'limit' });
    }

    let withdrawalAmount = BigAmount.n.toString();
    const rewardsList = await StakingRewards.findOne({
      where: { stakeId: stake.id },
      attributes: [[literal('array_agg(id)'), 'reward_list'], [literal('sum(amount::decimal)'), 'reward_sum']],
      raw: true
    });
    let notifyList = [];
    const rewardsSum = rewardsList.reward_sum || 0;
    if (rewardsList.reward_list) {
      const [result] = await sequelize.query(
        `SELECT array_agg(id) AS "nots"
                        FROM "Notifications" AS "Notification"
                        WHERE "Notification"."userId" = :userId
                        AND "Notification"."meta"::jsonb->'approveToken' ?|
                        array[:ids]
                        LIMIT 1;`,
        {
          replacements: {
            ids: rewardsList.reward_list,
            userId: r.auth.credentials.id
          },
          raw: true
        }
      );
      notifyList = result[0].nots || [];
    }

    if (BigCurrentAmount.n.minus(withdrawalAmount).lt(BigMin.p)) {
      const newStaking = await Staking.findOne({
        where: {
          min: {
            [Op.lte]: BigCurrentAmount.n.minus(withdrawalAmount)
          }
        },
        order: [['min', 'DESC']]
      });
      if (!newStaking) {
        withdrawalAmount = BigCurrentAmount.n.toString();
        await stake.destroy();
      }
      else {
        stake.set({ stakeId: newStaking.id, amount: BigCurrentAmount.n.minus(BigAmount.n).toString() });
        await stake.save();
      }
    }

    withdrawalAmount = new Big(withdrawalAmount).plus(rewardsSum).toString();

    await Transaction.create({
      amount: parseInt(withdrawalAmount),
      status: 1,
      type: 0,
      to: null,
      currencyId: HDPID,
      walletId: wallets[HDPID].id,
      userId: r.auth.credentials.id,
      orderId: null
    });
    wallets[HDPID].set({ balance: BigHDPBalance.n.plus(withdrawalAmount).toString() });
    await wallets[HDPID].save();

    if (notifyList.length) {
      await Notification.destroy({ where: { id: { [Op.in]: notifyList } } });
    }

    if (rewardsList.reward_list) {
      await StakingRewards.destroy({ where: { id: { [Op.in]: rewardsList.reward_list } } });
    }

    return output({ success: true, notifyList });
  }
  catch (e) {
    console.log(e);
  }
};

export const enrollToWallet = async (r) => {
  try {
    const rew = await StakingRewards.findByPk(r.payload.approveToken);
    if (!rew) {
      return error(400000, 'reward not found', {});
    }

    const wallet = await Wallet.findOne({
      where: {
        userId: r.auth.credentials.id,
        currencyId: HDPID
      }
    });

    if (wallet) {
      const converter = await Currency.getConverter();
      const B_amount = await converter[DECIMALED](wallet.balance, HDPID);
      console.log(B_amount.n.plus(rew.amount).toString());
      wallet.set({ balance: B_amount.n.plus(rew.amount).toString() });
      await wallet.save();

      if (r.payload.nId) {
        await Notification.destroy({ where: { id: r.payload.nId } });
      }

      await rew.destroy();

      return output({ success: true });
    }
  }
  catch (e) {
    console.log(e);
  }
};

export const enrollToStake = async (r) => {
  try {
    const rew = await StakingRewards.findByPk(r.payload.approveToken);
    if (!rew) {
      return error(400000, 'reward not found', {});
    }

    const userStake = await UserStaking.findByPk(rew.stakeId);
    const converter = await Currency.getConverter();
    const B_amount = converter[DECIMALED](userStake.amount, HDPID);
    userStake.set({ amount: B_amount.n.plus(rew.amount).toString() });
    await userStake.save();

    if (r.payload.nId) {
      await Notification.destroy({ where: { id: r.payload.nId } });
    }

    await rew.destroy();

    return output({ success: true });
  }
  catch (e) {
    console.log(e);
  }
};
