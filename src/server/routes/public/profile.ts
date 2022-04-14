import * as Joi from '@hapi/joi';
import * as profile from '../../api/public/profile';
import { onSubscribe } from '../../api/ws/index';
import {
  outputOkSchema, user, profileMeValidation, profileSchema
} from '../../schemes';
import { passwordValidJoiHandler } from '../../utils';
import config from '../../config/config';

export default [
  {
    method: 'GET',
    path: '/profile/me',
    handler: profile.getMe,
    options: {
      id: 'profile.getMe',
      tags: ['api', 'profile'],
      response: {
        schema: outputOkSchema(user),
        failAction: 'log'
      }
    }
  },
  {
    method: 'PUT',
    path: '/profile/me',
    handler: profile.edit,
    options: {
      id: 'profile.edit',
      tags: ['api', 'profile'],
      validate: {
        payload: profileSchema
      },
      response: {
        schema: outputOkSchema(Joi.object()),
        failAction: 'log'
      }
    }
  },
  {
    method: 'GET',
    path: '/profile/me/fields/{country}',
    handler: profile.kycGetFields,
    options: {
      id: 'profile.verification.fields',
      tags: ['api', 'profile'],
      validate: {
        params: Joi.object({
          country: Joi.string().required()
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
    path: '/profile/me/verify',
    handler: profile.kycVerify,
    options: {
      id: 'profile.verify',
      tags: ['api', 'profile'],
      response: {
        schema: outputOkSchema(Joi.object()),
        failAction: 'log'
      }
    }
  },
  {
    method: 'PUT',
    path: '/profile/me/password',
    handler: profile.changePassword,
    options: {
      id: 'profile.changePassword',
      tags: ['api', 'profile'],
      validate: {
        payload: Joi.object({
          oldPassword: Joi.string().required(),
          newPassword: Joi.string().custom(passwordValidJoiHandler).required()
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
    path: '/profile/me/notify-subscribe',
    handler: onSubscribe,
    options: {
      id: 'profile.event',
      tags: ['api', 'profile']
    }
  },
  {
    method: 'POST',
    path: `/profile/me/documents`,
    handler: profile.uploadDocuments,
    options: {
      id: 'profile.documents.upload',
      tags: ['api', 'profile'],
      payload: {
        output: 'file',
        parse: true,
        maxBytes: 5242880,
        // allow: 'multipart/form-data',
        uploads: config.path.tempFolder
      }
    // validate: {
    //   payload: Joi.object({
    //     files: Joi.array().items(Joi.string())
    //   })
    // }
    }
  },
  {
    method: 'DELETE',
    path: `/profile/me/documents`,
    handler: profile.deleteProfileDocument,
    options: {
      id: 'profile.documents.delete',
      tags: ['api', 'profile'],
      validate: {
        query: Joi.object({
          id: Joi.string()
        })
      }
    }
  },
  {
    method: 'GET',
    path: `/profile/me/documents`,
    handler: profile.getProfileDocumentList,
    options: {
      id: 'profile.documents.list',
      tags: ['api', 'profile']
    }
  },
  {
    method: 'GET',
    path: `${config.path.avatarURL}/{avatar}`,
    handler: profile.getAvatar,
    options: {
      auth: false,
      id: 'profile.avatar',
      tags: ['api', 'profile'],
      validate: {
        params: Joi.object({
          avatar: Joi.string().required()
        })
      }
    }
  }
];
