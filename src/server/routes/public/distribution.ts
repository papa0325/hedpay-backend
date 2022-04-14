import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/distribution';
import { outputOkSchema } from '../../schemes';

export default [{
  method: 'GET',
  path: '/distribution/list',
  handler: handlers.getDistributionList,
  options: {
    id: 'distribution.list',
    tags: ['api', 'distribution'],
    description: 'Get distribution list',
    response: {
      schema: outputOkSchema(Joi.array().items(Joi.object({
        id: Joi.string(),
        amount: Joi.number().integer(),
        months: Joi.number().allow(null),
        percentage: Joi.number().allow(null),
        leftAmount: Joi.number().allow(null),
        price: Joi.number().allow(null),
        min: Joi.number().allow(null),
        max: Joi.number().allow(null)
      }))),
      failAction: 'log'
    }
  }
},
{
  method: 'POST',
  path: '/distribution/buy',
  handler: handlers.buyHDP,
  options: {
    id: 'distribution.buy',
    tags: ['api', 'distribution'],
    description: 'Get distribution BUY',
    response: {
      schema: outputOkSchema(Joi.object({
        txID: Joi.string()
      })),
      failAction: 'log'
    }
  }
}
];
