/* eslint-disable no-await-in-loop */
import { Transaction } from '../../models/Transaction';
import { User } from '../../models/User';
import { output, error } from '../../utils';

export async function list(r) {
  const res = await Transaction.findAndCountAll({
    where: {
      userId: r.auth.credentials.id
    },
    limit: r.query.limit,
    offset: r.query.offset,
    order: [['createdAt', 'DESC']]
  });

  const resp = { count: res.count, txs: [] };

  for (const tx of res.rows) {
    if (tx.description === 'Internal send') {
      if (tx.meta.recipientId || tx.meta.senderId) {
        const contact = await User.findByPk(tx.meta.recipientId ? tx.meta.recipientId : tx.meta.senderId, {
          attributes: ['firstName', 'lastName', 'avatar', 'id', 'username']
        });

        resp.txs.push({ ...tx.dataValues, contact });
      }
      else {
        resp.txs.push(tx);
      }
    }
    else if (tx.description === 'Referral reward' && tx.meta.initiator) {
      const contact = await User.findOne({
        where: {
          username: tx.meta.initiator
        },
        attributes: ['firstName', 'lastName', 'avatar', 'id', 'username']
      });

      if (contact) {
        resp.txs.push({ ...tx.dataValues, contact });
      }
      else {
        resp.txs.push(tx);
      }
    }
    else {
      resp.txs.push(tx);
    }
  }

  return output(resp);
}

export async function refList(r) {
  try {
    const res = await Transaction.findAndCountAll({
      where: {
        userId: r.auth.credentials.id,
        description: 'Referral reward'
      },
      limit: r.query.limit,
      offset: r.query.offset,
      order: [['createdAt', 'DESC']]
    });


    return output({ count: res.count, txs: res.rows });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
}
