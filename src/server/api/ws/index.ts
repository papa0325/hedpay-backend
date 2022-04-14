import { ActiveConnections } from '../../models/ActiveConnections';
import { Notification } from '../../models/Notification';

export async function onSubscribe(r, h) {
  await ActiveConnections.create({
    userId: r.auth.credentials.id,
    connectionTime: new Date()
  });
  return { id: r.auth.credentials.id };
}

export async function push(r, h) {
  const {
    userId, meta, id, createdAt
  } = r.payload;
  await r.server.publish(`/notifications/${userId}`, { id, meta, createdAt });
  return { result: 'ok' };
}

export async function getList(r, h) {
  const notifications = await Notification.findAll({
    where: {
      userId: r.auth.credentials.id,
      seen: false
    },
    attributes: ['id', 'createdAt', 'meta'],
    order: [['createdAt', 'DESC']]
  });


  return { result: notifications };
}
