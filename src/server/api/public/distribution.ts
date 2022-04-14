import * as Big from 'big-js';
import { DistributionSession } from '../../models/DistributionSession';
import { error, output } from '../../utils';
import { Transaction } from '../../models/Transaction';
import { Order } from '../../models/Order';
import { Wallet } from '../../models/Wallet';
import { DistributionSessionPacks } from '../../models/DistributionSessionPacks';
import { Currency } from '../../models/Currency';
import { addJob } from '../../utils/helpers';
import { DECIMALED } from '../../utils/NumConverter/actions';
import { ETHID, HDPID } from '../../utils/NumConverter/constants';
import { TYPE_NEW_TRANSACTION } from '../../store/constants/rewards';
import { Referral } from '../../models/Referral';

// TODO Refactor this method
export const getDistributionList = async (r, h) => {
  try {
    const currency = await Currency.findOne({
      where: { id: 'hdp.ф' }
    });

    let { activePack, packs } = await DistributionSessionPacks.getPacks();
    if (activePack) {
      const startDate = new Date(activePack.lastCounterDropTime);
      const endDate = new Date(activePack.lastCounterDropTime);
      endDate.setMinutes(endDate.getMinutes() + 5);

      let todayTransactionSum = await Order.getHDPBoughtTransactionSumByUserId({
        userId: r.auth.credentials.id,
        period: { from: startDate, to: endDate }
      });

      todayTransactionSum = Big(todayTransactionSum).div(10 ** parseInt(currency.decimals, 10));
      let c = 1;
      packs = packs.map((itm) => {
        itm.amountLeft = 0;
        if (!itm.disabled && c) {
          itm.amountLeft = parseFloat(itm.max) - todayTransactionSum;
          itm.counterDropTime = endDate.getTime();
          c--;
        }

        return itm;
      });
    }

    // endDate.setHours(endDate.getHours() + activePack.counterInterval || 0);
    return output(packs);
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Failed to get package distribution', null);
  }
};

// TODO Refactor this method
export const buyHDP = async (r, h) => {
  try {
    if (!r.auth.credentials.id) {
      return error(400000, 'User not found', { field: 'user_id', reason: 'not found' });
    }

    if (!r.payload.id) {
      return error(400000, 'Pack not found', { field: 'id', reason: 'not found' });
    }

    const targetPack = await DistributionSessionPacks.findOne({
      where: {
        id: r.payload.id
      }
    });

    if (!targetPack) {
      return error(400000, 'Pack not found', { field: 'id', reason: 'not found' });
    }

    const rate = parseFloat(targetPack.price);

    const converter = await Currency.getConverter();
    const DRate = converter[DECIMALED](rate, ETHID);
    const { activePack } = await DistributionSessionPacks.getPacks();
    if (activePack.id != r.payload.id) {
      return error(400000, 'Target pack is not active anymore', {
        field: 'id',
        reason: 'pack no active'
      });
    }

    const { amount } = r.payload;

    const BoughtAmount = converter[DECIMALED](amount, HDPID);
    const PackPrice = converter[DECIMALED](amount * rate, ETHID);

    const startDate = new Date(activePack.lastCounterDropTime);
    const endDate = new Date(activePack.lastCounterDropTime);
    endDate.setHours(endDate.getHours() + activePack.counterInterval || 0);

    let todayTransactionSum = await Order.getHDPBoughtTransactionSumByUserId({
      userId: r.auth.credentials.id,
      period: { from: startDate, to: endDate }
    });
    todayTransactionSum = converter[DECIMALED](todayTransactionSum, HDPID);

    if (todayTransactionSum.d.plus(amount).gt(parseFloat(targetPack.max))) {
      return error(400000, 'Daily limit has been reached', { field: 'id', reason: 'not found' });
    }

    const wallets = await Wallet.getUserWallets(r.auth.credentials.id, [HDPID, ETHID]);

    const balance = Big(wallets[ETHID].balance);

    if (activePack.inPackLeft < amount) {
      return error(
        400000,
        `Pack limit reached, Maximum available for purchase: ${activePack.inPackLeft}`,
        { field: 'amount', reason: 'limit' }
      );
    }

    if (!wallets[ETHID] || !balance.gt(0) || balance.lt(PackPrice.p)) {
      return error(400000, 'Insufficient funds in the account', {
        field: 'amount',
        reason: 'balance'
      });
    }

    const newOrder = await Order.create({
      userId: r.auth.credentials.id,
      pairName: 'HDPETH',
      side: 0,
      amount: BoughtAmount.p.toString(),
      unitPrice: DRate.p.toString(),
      status: 1,
      leftSideSymbolId: HDPID,
      rightSideSymbolId: ETHID
    });
    const TransferData = {
      walletId: wallets[ETHID].id,
      to: null,
      userId: r.auth.credentials.id,
      orderId: newOrder.id,
      cur2Amount: PackPrice.p.toString(),
      cur1Amount: BoughtAmount.p.toString()
    };

    await Transaction.createTransfer(HDPID, ETHID, TransferData);

    newOrder.set({ status: 1 });
    newOrder.save();

    await wallets[ETHID].update({ balance: Big(balance).minus(PackPrice.p).toString() });
    await wallets[HDPID].update({
      balance: Big(wallets[HDPID].balance).plus(BoughtAmount.p).toString()
    });

    const Dist = await DistributionSession.findOne({
      where: {
        active: true
      }
    });

    if (Dist) {
      let boughtAmount = parseFloat(Dist.boughtAmount) + amount;
      if (activePack.inPackLeft - amount < activePack.min) {
        boughtAmount += activePack.inPackLeft - amount;
      }

      await Dist.update({
        boughtAmount
      });
    }

    await addJob('define-buy-limit-date');
    const ref = await Referral.findOne({
      where: {
        refId: r.auth.credentials.id
      }
    });

    if (ref) {
      await addJob('ref-reward', {
        type: TYPE_NEW_TRANSACTION,
        userId: ref.userId,
        amount: BoughtAmount.n.toFixed(),
        refRecord: ref
      });
    }

    return output({ txID: null, orderId: newOrder.id });
  }
  catch (e) {
    console.log(e);
  }
};
