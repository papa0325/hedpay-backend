import { User } from '../models/User';
import { addJob } from '../utils/helpers';

export default async () : Promise<void> => {
  const users = await User.findAll({
    where: {
      depositDex: null
    }
  });

  for (const user of users) {
    addJob('createDepositDex', user.id);
  }
};
