import { Op } from 'sequelize';
import * as Big from 'big-js';
import { getDate } from '../utils';
import { Wallet } from '../models/Wallet';
import { User } from '../models/User';
import { Currency } from '../models/Currency';
import { createAddress, getBalance, withdraw } from '../utils/gateway';

export default async function (payload, helpers) {
  const users = await User.findAll({
    where: { status: -1 },
    // limit:20,
    attributes: {
      include: ['settings']
    }
  });
  const currencies = await Currency.findAll({
    where: {
      id: {
        [Op.in]: ['hdp.ф', 'eth']
      }
    },
    attributes: {
      include: ['parentId', 'meta']
    }
  });
  for (const user of users) {
    const HDPWallet = null;
    // console.log(user);
    // for (let i in currencies){
    //     const currency = currencies[i]
    //     let address = await createAddress({ currency: currency.parentId ? currency.parentId : currency.id });
    //     let wallet = await Wallet.create({
    //         userId: user.id,
    //         balance: 0,
    //         currencyId: currency.id,
    //         address: address,
    //         settings: {}
    //     });
    //     if(currency.id === 'hdp.ф'){
    //         HDPWallet = wallet
    //     }
    // }
    if (user.settings.wallet_address) {
      const res = await getBalance({ address: user.settings.wallet_address, currency: `eth` });
    }
    // await getBalance();
    // if(HDPWallet){
    //     (await withdraw(wallet.address, payload.address, payload.amount, currencyType, tx.id, isTokenTransfer, currency.id))
    // }
  }

  return true;
}
