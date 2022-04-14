import { Currency } from '../../models/Currency';
import { output } from '../../utils';

export async function list(r) {
  const currencies = await Currency.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });
  return output(currencies);
}
