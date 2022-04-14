import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/staking';
import { outputOkSchema } from '../../schemes';

export default [{
  method: 'GET',
  path: '/staking/list',
  handler: handlers.getStackingList,
  options: {
    id: 'staking.list',
    tags: ['api', 'staking'],
    description: 'Get staking list',
    response: {
      schema: outputOkSchema(Joi.array().items(Joi.object({
        id: Joi.string(),
        min: Joi.number().integer(),
        max: Joi.number().allow(null),
        percentage: Joi.number().allow(null),
        price: Joi.number().allow(null)
      }))),
      failAction: 'log'
    }
  }
},
// New method to list all packages
{
  method: 'GET',
  path: '/staking-packages',
  handler: handlers.listStakingPackages,
  options: {
    id: 'staking-packages',
    tags: ['api', 'staking'],
    description: 'List available staking packages',
    auth: false
  }
},
{
  method: 'GET',
  path: '/user/active-stakes',
  handler: handlers.listActiveStakes,
  options: {
    id: 'list-active-packages',
    tags: ['api', 'staking'],
    description: 'List currently active stakes',
    validate: {
      query: Joi.object({
        limit: Joi.number().default(10),
        offset: Joi.number().default(0)
      })
    }
  }
},
{
  method: 'POST',
  path: '/user/active-stakes',
  handler: handlers.createNewStake,
  options: {
    id: 'add-a-new-stake',
    tags: ['api', 'staking'],
    description: 'Create new stake with given amount',
    validate: {
      payload: Joi.object(
        {
          amount: Joi.number().required()
        }
      )
    }
  }

},
{
  method: 'POST',
  path: '/user/active-stakes/{id}/claim',
  handler: handlers.claimStake,
  options: {

    id: 'claim-package',
    tags: ['api', 'staking'],
    description: 'Create new stake with given amount',
    validate: {
      params: Joi.object({
        id: Joi.number().required()
      })
    }
  }
},

{
  method: 'GET',
  path: '/staking/user-list',
  handler: handlers.getUserStaking,
  options: {
    id: 'staking.user.list',
    tags: ['api', 'staking'],
    description: 'Get user staking list',
    response: {
      schema: outputOkSchema(Joi.array().items(Joi.object({
        id: Joi.string(),
        stakeId: Joi.string(),
        userId: Joi.string(),
        amount: Joi.number(),
        unlockDate: Joi.string(),
        total: Joi.number()
      }))),
      failAction: 'log'
    }
  }
},
{
  method: 'POST',
  path: '/staking/buy',
  handler: handlers.purchaseStaking,
  options: {
    id: 'stacking.buy',
    tags: ['api', 'stacking'],
    description: 'Buy stacking',
    validate: {
      payload: Joi.object({
        id: Joi.string(),
        amount: Joi.number()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        stakingId: Joi.string()
      })),
      failAction: 'log'
    }
  }
},
{
  method: 'POST',
  path: '/staking/withdrawal',
  handler: handlers.withdrawStaking,
  options: {
    id: 'stacking.withdrawal',
    tags: ['api', 'stacking'],
    description: 'Stacking withdrawal',
    validate: {
      payload: Joi.object({
        id: Joi.string(),
        amount: Joi.string().regex(/^\d+$/)
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        stakingId: Joi.string()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/staking/reward/to-stake',
  handler: handlers.enrollToStake,
  options: {
    id: 'stacking.reward.toStake',
    tags: ['api', 'stacking'],
    description: 'Stacking withdrawal',
    validate: {
      payload: Joi.object({
        nId: Joi.string(),
        approveToken: Joi.string()
      })
    }
  }
}, {
  method: 'POST',
  path: '/staking/reward/to-wallet',
  handler: handlers.enrollToWallet,
  options: {
    id: 'stacking.reward.toWallet',
    tags: ['api', 'stacking'],
    description: 'Stacking withdrawal',
    validate: {
      payload: Joi.object({
        nId: Joi.string(),
        approveToken: Joi.string()
      })
    }
  }
}
];
