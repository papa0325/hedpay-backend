import { createDepositAddress } from '../utils/gateway';
import { User } from '../models/User';
import { addJob } from '../utils/helpers';
import { getDate } from '../utils';

export default async (userId) : Promise<void> => {
  const user = await User.findByPk(userId);

  if (!user) {
    console.log(`[create deposit dex] User ${userId} is not found`);
    return;
  }

  if (user.depositDex) {
    console.log(`[create deposit dex] User ${userId} already has deposit address`);
    return;
  }

  try {
    const address = await createDepositAddress(userId);
    await user.update({ depositDex: address });

    console.log(`[create deposit dex] ${userId} : ${address}`);
  }
  catch (e) {
    addJob('createDepositDex', userId, { run_at: getDate(new Date(), 1000 * 3600) }); // 1h
  }
};
