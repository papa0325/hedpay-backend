import * as Joi from '@hapi/joi';
import * as auth from '../../api/public/auth';
import { output, passwordValidJoiHandler } from '../../utils';
import { outputOkSchema } from '../../schemes';

export default [
  {
    method: 'POST',
    path: '/auth/register',
    handler: auth.register,
    options: {
      id: 'auth.register',
      tags: ['api', 'auth'],
      auth: false,
      validate: {
        payload: Joi.object({
          firstName: Joi.string()
            .min(2)
            .max(30)
            .regex(/^[a-zA-Z]*$/)
            .required(),
          lastName: Joi.string()
            .min(2)
            .max(30)
            .regex(/^[a-zA-Z]*$/)
            .required(),
          email: Joi.string().email().required(),
          password: Joi.string().custom(passwordValidJoiHandler).required(),
          username: Joi.string().min(5).max(40).alphanum()
            .required(),
          ref: Joi.string().optional(),
          recaptcha: Joi.string().required()
        })
      },
      response: {
        schema: outputOkSchema(
          Joi.object({
            access: Joi.string().required(),
            refresh: Joi.string().required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: auth.login,
    options: {
      id: 'auth.login',
      tags: ['api', 'auth'],
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
          password: Joi.string().required(),
          totp: Joi.string(),
          recaptcha: Joi.string() // .required(),
        })
      },
      response: {
        schema: outputOkSchema(
          Joi.object({
            access: Joi.string().required(),
            refresh: Joi.string().required(),
            status: Joi.number().integer().required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/validate/access',
    handler: () => output({}),
    options: {
      id: 'auth.validate.access',
      tags: ['api', 'auth'],
      auth: 'jwt-access',
      response: {
        schema: outputOkSchema(Joi.object({})),
        failAction: 'log'
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/validate/refresh',
    handler: () => output({}),
    options: {
      id: 'auth.validate.refresh',
      tags: ['api', 'auth'],
      auth: 'jwt-refresh',
      response: {
        schema: outputOkSchema(Joi.object({})),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/refresh-token',
    handler: auth.refreshToken,
    options: {
      id: 'auth.refresh-token',
      tags: ['api', 'auth'],
      auth: 'jwt-refresh',
      response: {
        schema: outputOkSchema(
          Joi.object({
            access: Joi.string().required(),
            refresh: Joi.string().required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/validate-email',
    handler: auth.validateEmail,
    options: {
      id: 'auth.validateEmail',
      tags: ['api', 'auth'],
      validate: {
        payload: Joi.object({
          code: Joi.string().required().length(6).example('A1234A')
        })
      },
      response: {
        schema: outputOkSchema(Joi.object()),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/totp/enable',
    handler: auth.enableTotp,
    options: {
      id: 'auth.totp.enable',
      tags: ['api', 'auth', 'totp'],
      response: {
        schema: outputOkSchema(
          Joi.object({
            tempTotp: Joi.string().example('MNFTU6BINV4VI6ST').required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/totp/validate',
    handler: auth.validateTotp,
    options: {
      id: 'auth.totp.validate',
      tags: ['api', 'auth', 'totp'],
      validate: {
        payload: Joi.object({
          totp: Joi.string().required(),
          password: Joi.string().required()
        })
      },
      response: {
        schema: outputOkSchema(Joi.object()),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/totp/disable',
    handler: auth.disableTotp,
    options: {
      id: 'auth.totp.disable',
      tags: ['api', 'auth', 'totp'],
      validate: {
        payload: Joi.object({
          totp: Joi.string().required(),
          password: Joi.string().required()
        })
      },
      response: {
        schema: outputOkSchema(Joi.object()),
        failAction: 'log'
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/totp/temp',
    handler: auth.getTempTotp,
    options: {
      id: 'auth.totp.getTemp',
      auth: 'jwt-access',
      tags: ['api', 'auth', 'totp'],
      response: {
        schema: outputOkSchema(
          Joi.object({
            token: Joi.string().example('MNFTU6BINV4VI6ST').required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/send-validation',
    handler: auth.sendValidateMessage,
    options: {
      id: 'auth.sendValidateMessage',
      tags: ['api', 'auth'],
      response: {
        schema: outputOkSchema(Joi.object({})),
        failAction: 'log'
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/totp/enabled',
    handler: auth.isTotpEnabled,
    options: {
      id: 'auth.totp.enabled',
      tags: ['api', 'auth', 'totp'],
      response: {
        schema: outputOkSchema(
          Joi.object({
            enabled: Joi.boolean().required()
          })
        ),
        failAction: 'log'
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/restore/send',
    handler: auth.restoreSendCode,
    options: {
      auth: false,
      id: 'auth.restore.send',
      tags: ['api', 'auth', 'restore'],
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required()
        })
      },
      response: {
        schema: outputOkSchema(Joi.object())
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/restore/change',
    handler: auth.restorePassword,
    options: {
      id: 'auth.restore.change',
      tags: ['api', 'auth', 'restore'],
      auth: false,
      validate: {
        payload: Joi.object({
          password: Joi.string().custom(passwordValidJoiHandler).required(),
          email: Joi.string().email().required(),
          restoreCode: Joi.string().required()
        })
      },
      response: {
        schema: outputOkSchema(Joi.object())
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/fast/set-public-key',
    handler: auth.fastSetPublicKey,
    options: {
      id: 'auth.fast.set-public-key',
      tags: ['api', 'auth', 'fast-auth'],
      validate: {
        payload: Joi.object({
          pubKey: Joi.string()
            .required()
            .example(
              '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCtfqPmHQ9Zwn4+jsHQ/afHqYAR\nm6QumQzKKGfqEbV2uhhcjSgegnW4Wl0M9XZWptZLk7YcFA/QeP1mGGQYkfvBmQ4w\nmaTMGAf2xbbMIQ+hIaPwC6cSirq35HW6UHTTedr25194e6aQQHGt/QZN+L7yni49\n3V9c6IouywupkeUa9QIDAQAB\n-----END PUBLIC KEY-----'
            )
        })
      },
      response: {
        schema: outputOkSchema(Joi.object())
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/fast/get-message',
    handler: auth.fastGetMessage,
    options: {
      id: 'auth.fast.get-message',
      tags: ['api', 'auth', 'fast-auth'],
      auth: false,
      validate: {
        query: Joi.object({
          email: Joi.string().email().required().example('email@test.com')
        })
      },
      response: {
        schema: outputOkSchema(
          Joi.object({
            message: Joi.string()
              .required()
              .example('c34f2a924502d3892c829def9bb214774f71e7f68a9c8b59830cb28e6d5d117d')
          })
        )
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/fast/login',
    handler: auth.fastLogin,
    options: {
      id: 'auth.fast.login',
      tags: ['api', 'auth', 'fast-auth'],
      auth: false,
      validate: {
        payload: Joi.object({
          signedMessage: Joi.string()
            .required()
            .example(
              'EbB1XF2XO7WQPfh10eclENWcm0xBkDdCW6t0AhiZkz5gpgXhFI81p7y+ZLoxRVHapjh0rVy1I42JrEPQGpRp/h61+XyCLTVixMrZWcIoNRrnNiWhvNTnbPLgeWLcHz610nKdSkuITr8vKnpvKCr0uvhMTin2JTwbFEb7SCHq/m8='
            ),
          email: Joi.string().email().required().example('email@test.com')
        })
      },
      response: {
        schema: outputOkSchema(
          Joi.object({
            access: Joi.string().required(),
            refresh: Joi.string().required()
          })
        ),
        failAction: 'log'
      }
    }
  }
];
