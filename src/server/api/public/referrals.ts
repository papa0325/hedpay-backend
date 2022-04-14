import * as Big from 'big-js';
import { Staking } from '../../models/Staking';
import { output, randomString, error } from '../../utils';
import { User } from '../../models/User';
import { ReferralStat } from '../../models/ReferralStat';
import { Rewards } from '../../models/Rewards';
import { Currency } from '../../models/Currency';
import { DECIMALED } from '../../utils/NumConverter/actions';
import config from '../../config/config';
import { addJob } from '../../utils/helpers';
import { user } from '../../schemes';

export const getRefInfo = async (r, h) => {
  try {
    const user = await User.findOne({
      where: { id: r.auth.credentials.id }
    });
    const userRefStat = await ReferralStat.findByPk(r.auth.credentials.id);
    const amount = new Big(userRefStat.bonusAmount)
      .times(new Big(10).pow(-userRefStat.currency.decimals))
      .toFixed();

    return output({
      currency: userRefStat.currencyId,
      amount,
      refLink: user.refLink,
      usersCount: userRefStat.refCount,
      invitationCount: userRefStat.invitationCount
    });
  }
  catch (e) {
    return error(500000, 'Internal server error', {});
  }
};

export const sendRefInvitation = async (r, h) => {
  try {
    const user = await User.findByPk(r.auth.credentials.id);
    const userRefStat = await ReferralStat.findByPk(r.auth.credentials.id);

    let text = `${r.payload.text}\n` || `You have been invited to HEdpAY by ${user.email}\n`;
    text += `Follow the link: ${r.payload.refLink}`;
    await addJob('sendEmail', {
      text,
      email: r.payload.email,
      subject: 'HEdpAY | Invitation'
      // html: ``
    });

    userRefStat.set({ invitationCount: userRefStat.invitationCount + 1 });
    await userRefStat.save();

    return output({ success: true });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
};
