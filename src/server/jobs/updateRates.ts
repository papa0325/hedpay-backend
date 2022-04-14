/*eslint-disable*/
import axios from 'axios';
import * as Big from 'big-js';
import config from '../config/config';
import { Currency } from '../models/Currency';
import { getDate } from '../utils';
import { RatesHistory } from '../models/RatesHistory';
import { deleteJob } from '../utils/helpers';
import { TOKEN } from '../store/constants/default-currencies';
import { DistributionSessionPacks } from '../models/DistributionSessionPacks';

export default async (p, h) => {
  try {
    const currencies = [{ curr: 'eth', id: 1027 }, { curr: 'btc', id: 1 }];

    for (const curr of currencies) {
      const ratesRes = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${curr.id}`, {
        headers: {
          'X-CMC_PRO_API_KEY': config.rates.apiKey
        }
      });

      const ratesInfo = ratesRes.data.data[String(curr.id)].quote.USD;
      const currency = await Currency.findByPk(curr.curr);
      let ratedPrice = ratesInfo.price * 10 ** config.rates.precision;

      currency.currentRate = Math.floor(ratedPrice);
      currency.change = ratesInfo.percent_change_24h;

      await currency.save();
      await RatesHistory.create({
        currencyId: currency.id,
        rate: Math.floor(ratedPrice),
        volume: Math.floor(ratesInfo.volume_24h)
      });

      if (curr.curr == 'eth') {
        const { activePack } = await DistributionSessionPacks.getPacks();
        const currentPrice = activePack.price;

        ratedPrice = Big(ratesInfo.price).times(currentPrice).times(10 ** config.rates.precision).toString();

        const upd = {
          currentRate: Math.floor(ratedPrice),
          change: ratesInfo.percent_change_24h
        };
        await Currency.update(upd, { where: { id: TOKEN } });
        await RatesHistory.create({ currencyId: TOKEN, rate: upd.currentRate });
      }
    }

  }
  catch (e) {
    console.log('-------------', e);
  }
};
