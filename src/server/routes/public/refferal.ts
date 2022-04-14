import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/referrals';
import { outputOkSchema } from '../../schemes';

export default [{
  method: 'GET',
  path: '/referral',
  handler: handlers.getRefInfo,
  options: {
    id: 'referrals.info',
    tags: ['api', 'referral'],
    description: 'Get ref info',
    response: {
      schema: outputOkSchema(Joi.array().items(Joi.object({
        amount: Joi.number(),
        withdrawnAmount: Joi.number(),
        refLink: Joi.string().example('53fdfbbeeb22205c'),
        usersCount: Joi.number().integer()
      }))),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/referral/send-mail',
  handler: handlers.sendRefInvitation,
  options: {
    id: 'referrals.send.mail',
    tags: ['api', 'referral'],
    description: 'Send ref invitation',
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
        text: Joi.string().required(),
        refLink: Joi.string().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        success: Joi.boolean()
      })),
      failAction: 'log'
    }
  }
}
];
