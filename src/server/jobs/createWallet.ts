import * as Big from 'big-js';
import { Currency } from '../models/Currency';
import { createAddress } from '../utils/gateway';
import { Wallet } from '../models/Wallet';
import { TOKEN } from '../store/constants/default-currencies';


interface ICreateWalletJob {
  userId: string;
  currency: string;
}

const GREETING_BONUS_HDP = 100000;

export default async (payload: ICreateWalletJob) : Promise<void> => {
  const currency = await Currency.findByPk(payload.currency, {
    attributes: {
      include: ['parentId', 'meta']
    }
  });

  const address = await createAddress({
    currency: currency.parentId ? currency.parentId : currency.id
  });

  const initBalance = payload.currency === TOKEN ? new Big(GREETING_BONUS_HDP).toFixed() : '0';

  await Wallet.create({
    userId: payload.userId,
    balance: initBalance,
    currencyId: payload.currency,
    address
  });

  console.log(`[create wallet] ${payload.userId} :  ${address}`);
};
