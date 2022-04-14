import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/contacts';

export default [
  {
    method: 'GET',
    path: '/contacts',
    handler: handlers.myContacts,
    options: {
      id: 'contacts.list',
      tags: ['api', 'contacts'],
      description: 'Get contacts list',
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
    method: 'POST',
    path: '/contacts/add',
    handler: handlers.addContact,
    options: {
      id: 'contacts.add',
      tags: ['api', 'contacts'],
      description: 'Add contact',
      validate: {
        payload: Joi.object({
          contactId: Joi.string().uuid().required()
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/contacts/remove',
    handler: handlers.delContact,
    options: {
      id: 'contacts.remove',
      tags: ['api', 'contacts'],
      description: 'Remove contact',
      validate: {
        payload: Joi.object({
          contactId: Joi.string().uuid().required()
        })
      }
    }
  }
];
