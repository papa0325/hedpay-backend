import * as Joi from '@hapi/joi';
import config from '../../config/config';
import * as handlers from '../../api/public/coming-soon';

export default [{
  method: 'POST',
  path: '/coming-soon/subscribe',
  handler: handlers.subscribe,
  options: {
    id: 'coming-soon.subscribe',
    auth: false,
    validate: {
      payload: Joi.object({
        email: Joi.string().required(),
        recaptcha: Joi.string().required()
      })
    }
  }
}];
