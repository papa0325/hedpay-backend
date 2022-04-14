import * as Joi from '@hapi/joi';
import * as handlers from '../../api/ws/index';
import config from '../../config/config';

export default [{
  method: 'POST',
  path: `/notification/${config.notification.token}/push`,
  handler: handlers.push,
  options: {
    id: 'notifications.push',
    tags: ['api', 'notifications'],
    description: 'Push notification',
    auth: false,
    validate: {
      payload: Joi.object({
        userId: Joi.string().uuid().required(),
        meta: Joi.object().required(),
        id: Joi.string().required(),
        createdAt: Joi.string()
      })
    }
  }
}, {
  method: 'GET',
  path: `/notifications`,
  handler: handlers.getList,
  options: {
    id: 'notifications.list',
    tags: ['api', 'notifications'],
    description: 'Push notification'
  }
}
];
