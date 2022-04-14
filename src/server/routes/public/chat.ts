import * as api from '../../api/public/chat';
import * as Joi from '@hapi/joi';
import { Op } from 'sequelize';
import config from '../../config/config';

const routes = [
  {
    method: 'POST',
    path: '/user/chats',
    handler: api.sendMessage,
    options: {
      auth: 'jwt-access',
      description: 'Use this endpoint to start a chat with support team',
      notes: 'Requires access token',
      tags: ['api', 'POST', 'CHAT', 'REST', 'PRIVATE-USER'],
      payload: {
        maxBytes: config.files.maxFilesSize,
        output: 'data',
        allow: 'multipart/form-data',
        parse: true,
      },
      validate: {
        payload: Joi.object({
          file: Joi.any()
            .meta({ swaggerType: 'file' })
            .optional()
            .allow('')
            .description('Message attachment file'),
          message: Joi.string().allow('').optional().max(1500),
        }),
        failAction: (req, h, err) => {
          return err.isJoi
            ? h.response(err.details[0]).takeover().code(400)
            : h.response(err).takeover();
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/user/chats',
    handler: api.getMessages,
    options: {
      auth: 'jwt-access',
      description: 'Use this  endpoint to get previous chat messages',
      notes: 'You do not have to enter chat id',
      tags: ['api', 'CHAT', 'REST', 'PRIVATE', 'USER'],
    },
  },
  {
    method: 'POST',
    path: '/user/chats/send-ws',
    handler: api.sendWS,
    options: {
      auth: 'chat-access',
      description: 'Server method to send',
      notes: 'none',
      tags: ['SERVER'],
    },
  },
  {
    method: 'GET',
    path: '/chat-file/{chatID}/{file*}',
    handler: {
      directory: {
        path: api.getFilePath,
      },
    },
    options: {
      pre: [{ method: api.checkFileAccess }],
      auth: 'jwt-unified-access',
      description: 'Use this endpoint to receive chat message attachments',
      notes: 'Enter valid chat id',
      tags: ['api', 'AUTH', 'REST', 'PUBLIC'],
      validate: {
        params: Joi.object({
          chatID: Joi.number().integer().min(0).required(),
          file: Joi.string()
            .regex(/^[a-zA-Z0-9.-]*$/)
            .required(),
        }),
        failAction: (req, h, err) => {
          return err.isJoi
            ? h.response(err.details[0]).takeover().code(400)
            : h.response(err).takeover();
        },
      },
    },
  },
];

export default routes;
