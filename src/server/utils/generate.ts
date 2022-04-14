import { Currency } from '../models/Currency';

const currencies = [{
  id: 'ETH',
  fullTitle: 'Ethereum',
  decimals: 18,
  currentRate: '0'
}, {
  id: 'Hdp.ф',
  fullTitle: 'HEdpAY',
  decimals: 4,
  currentRate: '0',
  parentId: 'ETH'
}];

export async function init() {
  await Currency.bulkCreate(currencies);
}
