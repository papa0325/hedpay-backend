import { output, error } from '../../utils';
import { User } from '../../models/User';

export const handle = async (r) => {
  r.server.log('IPN', r.payload);
  await r.server.app.scheduler.addJob('ipnHandler', r.payload);
  return output({});
};

export const getWalletsByEmail = async (r, h) => {
  const { email } = r.query;

  const user = await User.findOne({ where: { email }, include: ['wallets'] });

  if (!user) {
    // return error(404000, 'User is not found', {});
    return output({ wallets: [] });
  }

  return output({ wallets: user.wallets });
};
