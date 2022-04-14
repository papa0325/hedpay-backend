import { Op } from 'sequelize';
import { Log } from '../models/Log';
import { User } from '../models/User';
import { TypeLogs } from '../store/constants/admin-types';
import { getDate } from '../utils';
import { deleteJob } from '../utils/helpers';

export default async function (p, h) {
  await deleteJob('unbanUsers');

  const timeNow = new Date().valueOf();

  const blockedUsers = await User.findAll({ where: { unbanTimestamp: { [Op.lte]: timeNow } } });

  blockedUsers.map(async (user) => {
    await Log.create({
      userId: user.id,
      type: TypeLogs.UNBAN,
      timestamp: new Date().valueOf(),
    });
  });

  await User.update(
    { banned: false, unbanTimestamp: null },
    { where: { unbanTimestamp: { [Op.lte]: timeNow } } }
  );

  await h.addJob('unbanUsers', {}, { runAt: getDate(new Date(), 60000 * 60 * 12) });

  return true;
}
