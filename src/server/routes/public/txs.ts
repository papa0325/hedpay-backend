import * as Joi from '@hapi/joi';
import * as txs from '../../api/public/txs';

export default [
  {
    method: 'GET',
    path: '/profile/me/txs',
    handler: txs.list,
    options: {
      id: 'txs.list',
      tags: ['api', 'txs'],
      validate: {
        query: Joi.object({
          limit: Joi.number().integer().default(10).min(0)
            .max(100),
          offset: Joi.number().integer().default(0).min(0)
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/profile/me/txs/bonuses',
    handler: txs.refList,
    options: {
      id: 'txs.list.bonuses',
      tags: ['api', 'txs'],
      validate: {
        query: Joi.object({
          limit: Joi.number().integer().default(10).min(0)
            .max(100),
          offset: Joi.number().integer().default(0).min(0)
        })
      }
    }
  }
];
