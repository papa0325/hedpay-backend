/*eslint-disable*/
import { Currency } from '../models/Currency';
import axios from 'axios';
import config from '../config/config';
import { RatesHistory } from '../models/RatesHistory';
import { getDate } from '../utils';
import { Op } from 'sequelize';
import {deleteJob} from "../utils/helpers";



export default async function(p, h) {
  await deleteJob('updateFiat');
  let fiatCurrencies = await Currency.findAll({ where: { fiat: true } });
  let rates = (await axios.get('https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=' + fiatCurrencies.map(curr => curr.id.toUpperCase()).join(','))).data;
  for (const curr of fiatCurrencies) {
    curr.currentRate = Math.floor((1 / (rates[curr.id.toUpperCase()])) * 10 ** config.rates.precision);
    let change = null;
    let previousRate = await RatesHistory.findOne({
      where: {
        currencyId: curr.id,
        createdAt: {
          [Op.lt]: getDate(new Date(), -86400)
        }
      },
      order: [['createdAt', 'DESC']]
    });
    if (previousRate) {
      change = ((curr.currentRate / Number(previousRate.rate)) - 1) * 100;
    }
    curr.change = change;
    await curr.save();
    await RatesHistory.create({
      currencyId: curr.id,
      rate: Math.floor((1 / (rates[curr.id.toUpperCase()])) * 10 ** config.rates.precision)
    });
  }
  await h.addJob('updateFiat', {}, { runAt: getDate(new Date(), 60000 * 10) });
}
