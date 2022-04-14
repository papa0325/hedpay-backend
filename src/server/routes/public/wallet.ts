import * as Joi from '@hapi/joi';
import * as wallet from '../../api/public/wallets';
import { currency, outputOkSchema } from '../../schemes';


export default [{
  method: 'GET',
  path: '/profile/me/wallets',
  handler: wallet.getAll,
  options: {
    id: 'wallet.getAll',
    tags: ['api', 'wallet'],
    response: {
      schema: outputOkSchema(Joi.object({
        wallets: Joi.array().items(Joi.object({
          id: Joi.string().uuid(),
          balance: Joi.string(),
          address: Joi.string(),
          currency
        }))
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/profile/me/wallet/{walletId}',
  handler: wallet.getById,
  options: {
    id: 'wallet.getById',
    tags: ['api', 'wallet'],
    validate: {
      params: Joi.object({
        walletId: Joi.string().uuid().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        wallet: Joi.object({
          id: Joi.string().uuid(),
          userId: Joi.string().uuid(),
          balance: Joi.string(),
          address: Joi.string(),
          currency
        })
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/profile/me/wallet/{walletId}/txs',
  handler: wallet.transactions,
  options: {
    id: 'wallet.getTxs',
    tags: ['api', 'wallet'],
    validate: {
      params: Joi.object({
        walletId: Joi.string().uuid().required()
      }),
      query: Joi.object({
        limit: Joi.number().integer().default(10).min(0)
          .max(100),
        offset: Joi.number().integer().default(0).min(0)
      })
    }
  }
}, {
  method: 'POST',
  path: '/profile/me/wallet/{walletId}/withdraw',
  handler: wallet.withdraw,
  options: {
    id: 'wallet.withdraw',
    tags: ['api', 'wallet'],
    validate: {
      params: Joi.object({
        walletId: Joi.string().uuid().required()
      }),
      payload: Joi.object({
        address: Joi.string().required(),
        amount: Joi.string().regex(/^\d+$/).required(),
        totp: Joi.string().required()
      })
    }
  }
}, {
  method: 'POST',
  path: '/profile/me/wallet/{walletId}/send',
  handler: wallet.send,
  options: {
    id: 'wallet.send',
    tags: ['api', 'wallet'],
    validate: {
      params: Joi.object({
        walletId: Joi.string().uuid().required()
      }),
      payload: Joi.object({
        address: Joi.string(),
        username: Joi.string(),
        amount: Joi.string().regex(/^\d+$/).required(),
        totp: Joi.string().required()
      })
        .xor('address', 'username')
    }
  }
}
];
