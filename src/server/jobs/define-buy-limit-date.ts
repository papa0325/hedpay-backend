import { Op } from 'sequelize';
import * as Big from 'big-js';
import { getDate } from '../utils';
import { Wallet } from '../models/Wallet';
import { User } from '../models/User';
import { Currency } from '../models/Currency';
import { createAddress, getBalance, withdraw } from '../utils/gateway';
import { addJob, deleteJob } from '../utils/helpers';
import { DistributionSessionPacks } from '../models/DistributionSessionPacks';

export default async (payload, helpers) => {
  await deleteJob('define-buy-limit-date');
  const { activePack } = await DistributionSessionPacks.getPacks();
  const runAt = new Date();
  const todayStartDate = new Date();
  // todayStartDate.setHours(0,0,0,0);
  // const Interval = activePack.counterInterval || 0;
  const Interval = 5;
  todayStartDate.setMinutes(todayStartDate.getMinutes(), 0, 0);

  runAt.setMinutes(runAt.getMinutes() + 1);
  let nextStepDate = new Date();

  if (activePack.lastCounterDropTime) {
    nextStepDate = new Date(activePack.lastCounterDropTime);
    nextStepDate.setMinutes(nextStepDate.getMinutes() + Interval);
  }

  if (
    (activePack.counterInterval && !activePack.lastCounterDropTime)
        || ((new Date()).getTime() >= nextStepDate.getTime())
  ) {
    activePack.set({ lastCounterDropTime: todayStartDate });
    await activePack.save();
  }

  await addJob('define-buy-limit-date', null, { run_at: runAt });
  return true;
};
