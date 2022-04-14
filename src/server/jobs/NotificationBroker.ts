import axios from 'axios';
import { Notification } from '../models/Notification';
import config from '../config/config';
import { NOTIFICATION_TRANSPORT_NOTIFY } from '../store/constants/notifications';

export default async function (p, h) {
  try {
    const { notificationId } = p;
    if (!notificationId) {
      return null;
    }

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return null;
    }

    if (notification.transport === NOTIFICATION_TRANSPORT_NOTIFY) {
      await axios.post(config.notification.pushUrl, {
        userId: notification.userId,
        id: notification.id,
        meta: notification.meta,
        createdAt: notification.createdAt
      });
    }
  }
  catch (e) {
    console.log(e);
  }
}
