import * as Big from 'big-js';
import { Wallet } from '../models/Wallet';
import { Currency } from '../models/Currency';
import { Transaction } from '../models/Transaction';
import { withdraw } from '../utils/gateway';


interface IWithdrawJob {
  address: string;
  walletId: string;
  amount: string;
  commission: string;
}

export default async function (payload: IWithdrawJob) {
  const amount = Big(payload.amount);
  const wallet = await Wallet.findByPk(payload.walletId, {
    attributes: {
      include: ['currencyId', 'userId']
    }
  });

  const currency = await Currency.findByPk(wallet.currencyId, {
    attributes: {
      include: ['parentId']
    }
  });
  const currencyType = currency.parentId ? currency.parentId : currency.id;
  const isTokenTransfer = !!currency.parentId;
  const tx = await Transaction.create({
    status: 0,
    amount: payload.amount.toString(),
    userId: wallet.userId,
    walletId: wallet.id,
    currencyId: wallet.currencyId,
    type: 1,
    to: payload.address
  });
  const commission = Big(payload.commission);

  try {
    const res = (await withdraw(wallet.address, payload.address, payload.amount, currencyType, tx.id, isTokenTransfer, currency.id))[0];
    tx.set({
      'meta.tx_id': res.tx_id, 'meta.fee': res.fee, status: 1, 'meta.commission': commission.toString()
    });
    await tx.save();
  }
  catch (e) {
    tx.set({ status: -1 });
    await tx.save();
    wallet.balance = Big(wallet.balance).plus(amount.plus(commission)).toString();
    await wallet.save();
    console.log('WITHDRAW ERROR---', e);
  }
}
