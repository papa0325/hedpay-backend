import * as Joi from '@hapi/joi';
import * as currency from '../../api/public/currency';
import { outputOkSchema } from '../../schemes';

export default [{
  method: 'GET',
  path: '/currencies',
  handler: currency.list,
  options: {
    id: 'currency.list',
    tags: ['api', 'currency'],
    auth: false,
    description: 'Get currency list',
    response: {
      schema: outputOkSchema(Joi.array().items(Joi.object({
        id: Joi.string(),
        symbol: Joi.string(),
        fullTitle: Joi.string(),
        decimals: Joi.number().integer(),
        currentRate: Joi.string(),
        fiat: Joi.boolean(),
        txLimits: Joi.object({
          minWithdraw: Joi.string(),
          withdrawCommissionFixed: Joi.string(),
          withdrawCommissionPercentage: Joi.string()
        })
      }))),
      failAction: 'log'
    }
  }
}];
