import { output, error } from '../../utils';
import { Contacts } from '../../models/Contacts';
import { User } from '../../models/User';
import { Wallet } from '../../models/Wallet';

export const myContacts = async (r, h) => {
  const res = await Contacts.findAndCountAll({
    where: {
      userId: r.auth.credentials.id
    },
    limit: r.query.limit,
    offset: r.query.offset,
    order: [['createdAt', 'DESC']]
  });

  const resp = { count: res.count, contacts: [] };

  for (const contact of res.rows) {
    // eslint-disable-next-line no-await-in-loop
    const contactData = await User.findByPk(contact.contactId, {
      attributes: ['firstName', 'lastName', 'avatar', 'id', 'username'],
      include: [
        {
          model: Wallet,
          attributes: ['address', 'currencyId']
        }
      ]
    });
    resp.contacts.push(contactData);
  }

  return output(resp);
};

export const addContact = async (r, h) => {
  const user = r.auth.credentials;
  const { contactId } = r.payload;

  const contactU = await User.findByPk(contactId);

  if (!contactU) {
    return error(404000, 'User is not found', {});
  }

  const contact = await Contacts.findOne({
    where: {
      userId: user.id,
      contactId
    }
  });

  if (contact) {
    return error(400000, 'Contact is already created', {});
  }


  await Contacts.create({
    contactId,
    userId: user.id
  });

  return output({ success: true });
};

export const delContact = async (r, h) => {
  const user = r.auth.credentials;
  const { contactId } = r.payload;

  const contact = await Contacts.findOne({
    where: {
      userId: user.id,
      contactId
    }
  });

  if (!contact) {
    return error(404000, 'Contact is not found', {});
  }

  await contact.destroy();

  return output({ success: true });
};
