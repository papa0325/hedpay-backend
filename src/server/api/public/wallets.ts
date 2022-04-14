import * as Big from 'big-js';
import {
  error, output, totpValidate, validateAddress
} from '../../utils';
import { Wallet } from '../../models/Wallet';
import { Transaction } from '../../models/Transaction';
import { Currency } from '../../models/Currency';
import { User } from '../../models/User';
import { TX_COMPLETE } from '../../store/constants/tx-status';
import { TX_DEPOSIT, TX_WITHDRAW } from '../../store/constants/tx-types';

export async function getAll(r) {
  const user = r.auth.credentials;
  const wallets = await Wallet.findAll({
    where: {
      userId: user.id
    }
  });
  // if (user.status !== 2) {
  //   wallets = JSON.parse(JSON.stringify(wallets));
  //   wallets = wallets.map((item) => ({ ...item, address: '' }));
  // }

  return output(
    {
      wallets
    }
  );
}

export async function getById(r) {
  const wallet = await Wallet.findByPk(r.params.walletId, {
    attributes: {
      include: [
        'userId'
      ]
    }
  });
  if (!wallet) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  if (wallet.userId !== r.auth.credentials.id) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  return output({ wallet });
}

export async function transactions(r) {
  const wallet = await Wallet.findByPk(r.params.walletId, {
    attributes: {
      include: [
        'userId'
      ]
    }
  });
  if (!wallet) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  if (wallet.userId !== r.auth.credentials.id) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  const transactions = await Transaction.findAndCountAll({
    where: {
      walletId: wallet.id
    },
    limit: r.query.limit,
    offset: r.query.offset
  });
  return output({ count: transactions.count, txs: transactions.rows });
}

export async function withdraw(r) {
  try {
    if (r.auth.credentials.status !== 2) {
      return error(400000, 'Verify your account first', {});
    }

    if (r.auth.credentials.settings.totpToken === null) {
      return error(400007, 'You have to activate totp before withdraw', {});
    }

    if (!totpValidate(r.payload.totp, r.auth.credentials.settings.totpToken)) {
      return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
    }

    const wallet = await Wallet.findByPk(r.params.walletId, {
      attributes: {
        include: [
          'userId',
          'currencyId'
        ]
      }
    });
    if (!wallet) {
      return error(404000, 'Wallet not found', { field: 'walletId' });
    }

    if (wallet.userId !== r.auth.credentials.id) {
      return error(404000, 'Wallet not found', { field: 'walletId' });
    }

    const currency = await Currency.findByPk(wallet.currencyId, {
      attributes: {
        include: ['parentId', 'txLimits']
      }
    });
    if (currency.txLimits.minWithdraw) {
      if (Big(r.payload.amount).lt(Big(currency.txLimits.minWithdraw))) {
        return error(400007, 'Withdraw amount less than minimum', { minLimit: currency.txLimits.minWithdraw });
      }
    }

    const addressType = currency.parentId ? currency.parentId : currency.id;
    if (!validateAddress(r.payload.address, addressType)) {
      return error(400000, 'Invalid address', { field: 'address', reason: 'invalid' });
    }

    const amount = Big(r.payload.amount);
    let commission = Big(0);
    if (currency.txLimits.withdrawCommissionFixed) {
      commission = commission.plus(Big(currency.txLimits.withdrawCommissionFixed));
    }

    if (currency.txLimits.withdrawCommissionPercentage) {
      commission = commission.plus(amount.times(Big(currency.txLimits.withdrawCommissionPercentage).div(100000)));
    }

    const total = amount.plus(commission);
    if (Big(wallet.balance).cmp(total) === -1) {
      return error(400006, 'Insufficient balance', { commission: commission.toString() });
    }

    wallet.balance = Big(wallet.balance).minus(total).toString();
    await wallet.save();
    await r.server.app.scheduler.addJob('withdraw', {
      walletId: wallet.id,
      amount: r.payload.amount,
      address: r.payload.address,
      commission: commission.toString()
    });
    return output({ success: true });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
}

export async function send(r) {
  try {
    if (r.auth.credentials.settings.totpToken === null) {
      return error(400007, 'You have to activate totp before withdraw', {});
    }

    if (!totpValidate(r.payload.totp, r.auth.credentials.settings.totpToken)) {
      return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
    }

    const { address, username } = r.payload;

    const amount = Big(r.payload.amount);
    const senderWallet = await Wallet.findByPk(r.params.walletId, {
      attributes: {
        include: [
          'userId',
          'currencyId'
        ]
      }
    });

    if (!senderWallet) {
      return error(404000, 'Wallet not found', { field: 'walletId' });
    }

    if (senderWallet.userId !== r.auth.credentials.id) {
      return error(404000, 'Wallet not found', { field: 'walletId' });
    }

    if (Big(senderWallet.balance).cmp(amount) === -1) {
      return error(400006, 'Insufficient balance', {});
    }

    const currency = await Currency.findByPk(senderWallet.currencyId, {
      attributes: {
        include: ['parentId', 'txLimits']
      }
    });

    if (currency.txLimits.minSend) {
      if (Big(r.payload.amount).lt(Big(currency.txLimits.minSend))) {
        return error(400007, 'Send amount less than minimum', { minLimit: currency.txLimits.minSend });
      }
    }

    let recipientWallet = null;

    if (address) {
      recipientWallet = await Wallet.findOne({
        where: { address, currencyId: senderWallet.currencyId },
        attributes: { include: ['currencyId', 'userId'] }
      });
    }
    else if (username) {
      const recipientUser = await User.findOne({
        where: { username },
        include: [{
          model: Wallet,
          attributes: { include: ['currencyId', 'userId'] }
        }]
      });

      if (!recipientUser) {
        return error(404000, 'The recipient is not found', { field: 'username' });
      }

      recipientWallet = recipientUser.wallets.find((wallet) => wallet.currency.id === senderWallet.currencyId);
    }

    if (!recipientWallet) {
      return error(404000, 'Recipient\'s wallet was not found on HedPay', { field: address ? 'address' : 'username' });
    }

    if (recipientWallet.id === senderWallet.id) {
      return error(400000, `You can't send funds to yourself`, { field: address ? 'address' : 'username' });
    }

    senderWallet.set({ balance: new Big(senderWallet.balance).minus(amount).toFixed() });
    recipientWallet.set({ balance: new Big(recipientWallet.balance).plus(amount).toFixed() });

    await senderWallet.save();
    await recipientWallet.save();

    await Transaction.create({
      status: TX_COMPLETE,
      amount,
      userId: senderWallet.userId,
      walletId: senderWallet.id,
      currencyId: senderWallet.currencyId,
      type: TX_WITHDRAW,
      to: recipientWallet.address,
      description: 'Internal send',
      meta: {
        recipientId: recipientWallet.userId
      }
    });

    await Transaction.create({
      status: TX_COMPLETE,
      amount,
      userId: recipientWallet.userId,
      walletId: recipientWallet.id,
      currencyId: recipientWallet.currencyId,
      type: TX_DEPOSIT,
      to: recipientWallet.address,
      description: 'Internal send',
      meta: {
        senderId: senderWallet.userId
      }
    });

    return output({ success: true });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
}
