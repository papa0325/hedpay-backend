import * as Hapi from '@hapi/hapi';
import * as Nes from '@hapi/nes';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as dotenv from 'dotenv';
import { run } from 'graphile-worker/dist';
import * as Pino from 'hapi-pino';
import * as HapiBearer from 'hapi-auth-bearer-token';
import * as HapiCors from 'hapi-cors';
import * as Bell from '@hapi/bell';
import * as Basic from '@hapi/basic';
import { Op } from 'sequelize';
import * as grScheduler from 'graphile-scheduler';
import Config from './config/server';
import config from './config/config';
import * as SwaggerOptions from './config/swagger.json';
import { routes } from './routes/public';
import subscriptions from './ws-subscription';
import sequelize from './models';
import {
  accessUniValidate,
  accessValidate,
  chatValidate,
  ipnValidate,
  refreshValidate
} from './utils/auth';
import { checkOrCreateStorageFolders, error } from './utils';
import { addJob } from './utils/helpers';
import { Chat } from './models/Chat';

const fs = require('fs');

const HapiSwagger = require('hapi-swagger');

const Package = require('../../package.json');

SwaggerOptions.info.version = Package.version;

const init = async () => {
  // Инициализируем сервер
  const server = await new Hapi.Server({
    host: Config.server.host,
    port: Config.server.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction: async (r, h, err) => error(
          400000,
          'Validation error',
          err.details.map((e) => ({ field: e.context.key, reason: e.type.replace('any.', '') }))
        )
      },
      response: {
        failAction: 'log'
      }
    }
  });
  // Регистрируем расширения
  await server.register([
    Bell,
    Basic,
    Nes,
    Inert,
    Vision,
    Pino,
    HapiBearer,
    { plugin: HapiSwagger, options: SwaggerOptions }
  ]);
  // Запускаем Job scheduler
  server.app.scheduler = await run({
    connectionString: config.scheduler.db,
    concurrency: config.scheduler.concurrency,
    pollInterval: config.scheduler.interval,
    taskDirectory: `${__dirname}/jobs`
  });
  await grScheduler.run({
    connectionString: config.scheduler.db,
    schedules: [
      {
        queueName: 'addRevenue',
        name: 'addRevenue',
        pattern: '0 0 */1 * *',
        timeZone: 'Europe/London'
      },
      {
        queueName: 'claimRevenue',
        name: 'claimRevenue',
        pattern: '0 0 0 */1 *',
        timeZone: 'Europe/London'
      },
      {
        queueName: 'getRates',
        name: 'getRates',
        pattern: '*/10 * * * *',
        timeZone: 'Europe/London'
      }
      // {
      //   queueName: 'updateWallets',
      //   name: 'updateWallets',
      //   pattern: '* * * * *',
      //   timeZone: 'Europe/London'
      // }
    ]
  });
  // await addJob('emailForImportUsers'); // TODO email newsletter for imported users

  // await addJob('updateFiat');
  await addJob('unbanUsers');
  await addJob('receiveInterest');
  // await addJob('migrated-records-balance-update');
  await addJob('define-buy-limit-date');
  await addJob('staking-reward-enroll');

  // await addJob('_generateWallets'); // TODO remove it
  // await addJob('_createDepositDex');

  await checkOrCreateStorageFolders();

  server.auth.strategy('chat-access', 'basic', {
    validate: chatValidate
  });

  server.auth.strategy('jwt-unified-access', 'bearer-access-token', {
    validate: accessUniValidate
  });

  server.auth.strategy('jwt-access', 'bearer-access-token', {
    validate: accessValidate
  });
  server.auth.strategy('jwt-refresh', 'bearer-access-token', {
    validate: refreshValidate
  });
  server.auth.strategy('ipn', 'basic', {
    validate: ipnValidate
  });
  server.auth.default('jwt-access');

  server.realm.modifiers.route.prefix = '/api';
  server.route(routes);

  for (const i in subscriptions) {
    await server.subscription(subscriptions[i].path, subscriptions[i].options);
  }

  server.app.db = sequelize;

  server.ext('onPreResponse', (r, h) => {
    if (r.app.error) {
      r.response = h
        .response({
          ok: false,
          code: r.app.error.data.code,
          data: r.app.error.data.data,
          msg: r.app.error.output.payload.message
        })
        .code(Math.floor(r.app.error.data.code / 1000));
      return h.continue;
    }

    if (r.response.isBoom && r.response.data) {
      if (r.response.data.custom) {
        r.response = h
          .response({
            ok: false,
            code: r.response.data.code,
            data: r.response.data.data,
            msg: r.response.output.payload.message
          })
          .code(Math.floor(r.response.data.code / 1000));

        return h.continue;
      }

      return h.continue;
    }

    return h.continue;
  });

  try {
    await server.register({ plugin: HapiCors, options: config.cors });

    server.subscription('/test');

    server.subscription('/user/chat/{id}', {
      filter: async function (path, message, options): Promise<boolean> {
        const chat: Chat = await Chat.findByPk(message.chatID);
        if (!chat) {
          return false;
        }

        return chat.userId === options.credentials.id;
      },
      onSubscribe: async function (socket, path, params) {
        const chat: Chat | null = await Chat.findOne({
          where: { [Op.and]: { active: true, id: params.id } }
        });
        if (!chat) {
          socket.send('Chat with given ID was not found');
        }
      }
    });

    await server.start();
    server.log('info', `Server running at: ${server.info.uri}`);
  }
  catch (err) {
    server.log('error', JSON.stringify(err));
  }

  return server;
};

addJob('updateWallets');
export { init };
