import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Currency } from '../models/Currency';
import config from '../config/config';

// variables
const HDP_ID = 'HDP.Ф';

export default async function (): Promise<void> {
  // all rates
  const {
    data: {
      data: { rates }
    }
  } = await axios.get('https://api.coinbase.com/v2/exchange-rates');

  // hdp rate
  const {
    data: {
      market_data: {
        current_price: { usd: hdp_rates }
      }
    }
  } = await axios.get('https://api.coingecko.com/api/v3/coins/hedpay');

  // all currencies
  const currencies = await Currency.findAll();

  // combined rates
  const combined_rates = hdp_rates ? { ...rates, ...{ [HDP_ID]: 1 / hdp_rates } } : rates;

  // proccessing
  if (currencies && currencies.length > 0) {
    currencies.forEach((currency) => {
      const currency_rate = combined_rates[currency.id.toUpperCase()];

      if (currency_rate) {
        const rate = new BigNumber(1)
          .dividedBy(currency_rate)
          .shiftedBy(config.rates.precision)
          .toNumber();

        currency.update({
          currentRate: rate
        });
      }
    });
  }
}
