import * as speakeasy from 'speakeasy';
import { Op } from 'sequelize';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import {
  error, getDate, getRealIp, output, randomString, totpValidate
} from '../../utils';
import { generateJwt, recaptchaValidate } from '../../utils/auth';
import config from '../../config/config';
import { Referral } from '../../models/Referral';
import { ReferralStat } from '../../models/ReferralStat';
import {
  MAIN_CURRENCY, TOKEN, BTC, USDT
} from '../../store/constants/default-currencies';
import { addJob } from '../../utils/helpers';
import { Log } from '../../models/Log';
import { TypeLogs } from '../../store/constants/admin-types';

const NodeRSA = require('node-rsa');

export const login = async (r) => {
  const user = await User.scope('auth').findOne({ where: { email: r.payload.email } });
  if (!user) {
    return error(401000, 'Incorrect email and password pair', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(401000, 'Incorrect email and password pair', {});
  }

  if (user.settings.totpToken) {
    if (r.payload.totp) {
      if (!totpValidate(r.payload.totp, user.settings.totpToken)) {
        return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
      }
    }
    else {
      return error(400000, 'Totp required', { field: 'totp', reason: 'required' });
    }
  }

  if (!(await recaptchaValidate(r.payload.recaptcha))) {
    return error(400000, 'Recaptcha validation fail', { field: 'recaptcha', reason: 'fail' });
  }

  //
  if (user.banned) {
    return error(403003, 'Your account was deactivated', {
      banReason: user.settings.banReason,
      unbanTimestamp: user.unbanTimestamp
    });
  }

  const session = await Session.create({
    userId: user.id,
    lastUsedDate: new Date(),
    lastUsedIp: getRealIp(r)
  });

  await Log.create({
    userId: user.id,
    type: TypeLogs.AUTH,
    usedIP: r.headers['x-forwarded-for'],
    timestamp: new Date().valueOf()
  });

  return output({ ...generateJwt({ id: session.id }), status: user.status });
};

export const register = async (r) => {
  try {
    const userRegistered = await User.scope('auth').findOne({ where: { email: r.payload.email } });
    if (userRegistered) {
      if (userRegistered.status !== 0) {
        return error(400000, 'Email is already in use', { field: 'email', reason: 'used' });
      }

      await userRegistered.destroy();
    }

    if (await User.findOne({ where: { username: r.payload.username } })) {
      return error(400000, 'Username is already in use', { field: 'username', reason: 'used' });
    }

    if (!(await recaptchaValidate(r.payload.recaptcha))) {
      return error(400000, 'Recaptcha validation fail', { field: 'recaptcha', reason: 'fail' });
    }

    const user = await User.create(r.payload);
    const session = await Session.create({
      userId: user.id,
      lastUsedDate: new Date(),
      lastUsedIp: getRealIp(r)
    });

    const token = randomString(6).toUpperCase();
    const refLink = randomString(16);

    await r.server.app.scheduler.addJob('sendEmail', {
      email: user.email,
      text: `Your HEdpaY verification code is ${token}`,
      subject: 'HEdpaY verification',
      html: `<html xmlns="http://www.w3.org/1999/html">
      <body>
        <p>Your HEdpaY verification code is ${token}</p>
      </body>
    </html>`
    });

    user.set({ 'settings.confirmEmailToken': token, refLink });

    if (r.payload.ref) {
      const rUser = await User.findOne({
        where: { refLink: r.payload.ref }
      });
      if (rUser) {
        await Referral.create({ userId: rUser.id, refId: user.id });
      }
    }

    await user.save();
    return output(generateJwt({ id: session.id }));
  }
  catch (e) {
    console.log(e);
  }
};

export const enableTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);
  if (user.settings.totpToken) {
    return error(400002, 'Totp enabled already', {});
  }

  user.set({
    'settings.totpTempToken': speakeasy.generateSecret({ length: 10, name: 'HEdpaY Platform' })
      .base32
  });
  await user.save();

  return output({ tempTotp: user.settings.totpTempToken });
};

export const validateTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);

  if (user.settings.totpTempToken == null) {
    return error(400001, 'Enable totp first', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(400000, 'Password invalid', { field: 'password', reason: 'invalid' });
  }

  if (totpValidate(r.payload.totp, user.settings.totpTempToken)) {
    user.set({
      'settings.totpToken': user.settings.totpTempToken,
      'settings.totpTempToken': null
    });
    await user.save();
    return output({});
  }

  return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
};

export const disableTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);

  if (user.settings.totpToken == null) {
    return error(400003, 'Totp disabled already', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(400000, 'Password invalid', { field: 'password', reason: 'invalid' });
  }

  if (totpValidate(r.payload.totp, user.settings.totpToken)) {
    user.set({ 'settings.totpToken': null });

    await user.save();
    return output({});
  }

  return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
};

export const sendValidateMessage = async (r) => {
  if (!r.auth.credentials.settings.confirmEmailToken) {
    return error(400005, 'Email is already verified', {});
  }

  await r.server.app.scheduler.addJob('sendEmail', {
    email: r.auth.credentials.email,
    text: `Your HEdpaY verification code is ${r.auth.credentials.settings.confirmEmailToken}`,
    subject: 'HEdpaY verification',
    html: `<p>Your HEdpaY verification code is ${r.auth.credentials.settings.confirmEmailToken}</p>`
  });

  return output({});
};

export const validateEmail = async (r) => {
  try {
    const user = await User.scope('auth').findByPk(r.auth.credentials.id);

    if (user.settings.confirmEmailToken !== r.payload.code) {
      return error(400000, 'Code invalid', { field: 'code', reason: 'invalid' });
    }

    user.set({ 'settings.confirmEmailToken': null });
    user.status = 1;

    await Referral.approveReferral(user.id);
    await ReferralStat.create({ userId: user.id });

    await user.save();
    for (const curr of [MAIN_CURRENCY, TOKEN, BTC, USDT]) {
      // eslint-disable-next-line no-await-in-loop
      await r.server.app.scheduler.addJob('createWallet', { userId: user.id, currency: curr });
    }

    await r.server.app.scheduler.addJob('createDepositDex', user.id);

    return output({});
  }
  catch (e) {
    console.log(e);
  }
};

export const getTempTotp = async (r) => output({ token: r.auth.credentials.settings ? r.auth.credentials.settings.totpTempToken : null });

export const isTotpEnabled = async (r) => output({ enabled: !!r.auth.credentials.settings.totpToken });

export const refreshToken = async (r) => output(generateJwt({ id: r.auth.artifacts.session }));

export const restoreSendCode = async (r) => {
  const user = await User.findOne({
    where: { email: r.payload.email },
    attributes: { include: ['settings'] }
  });
  if (!user) {
    return error(404000, 'User not found', { field: 'email', type: 'invalid' });
  }

  user.set({
    'settings.restorePasswordToken': randomString(10).toUpperCase(),
    'settings.restorePasswordExpire': getDate(new Date(), 60000 * config.expire.restorePassword)
  });
  await user.save();
  await r.server.app.scheduler.addJob('sendEmail', {
    text: `Your HEdpAY restoration code is ${user.settings.restorePasswordToken}`,
    email: user.email,
    subject: 'HEdpAY | Restoration code',
    html: `<html xmlns="http://www.w3.org/1999/html">
      <body>
        <a href="${`${config.path.appURL}/reset?email=${encodeURIComponent(user.email)}&code=${
    user.settings.restorePasswordToken
  }`}">
          Click here to restore your password
        </a>
        <b>Your code:</b> ${user.settings.restorePasswordToken}
        </br>
        Code will expire in ${config.expire.restorePassword} minutes
      </body>
    </html>`
  });
  return output({});
};

export async function restorePassword(r) {
  const user = await User.findOne({
    where: { email: r.payload.email },
    attributes: { include: ['settings'] }
  });
  if (!user) {
    return error(404000, 'User not found', { field: 'email', reason: 'invalid' });
  }

  if (user.settings.restorePasswordToken !== r.payload.restoreCode) {
    return error(404000, 'Invalid restoration code', { field: 'restoreCode', reason: 'invalid' });
  }

  if (new Date(user.settings.restorePasswordExpire) < new Date()) {
    return error(400000, 'Restoration code expired. Please request new.', {
      field: 'restoreCode',
      reason: 'expired'
    });
  }

  user.set({ 'settings.restorePasswordToken': null, 'settings.restorePasswordExpire': null });
  user.password = r.payload.password;

  if (user.status === -1) {
    // imported users
    for (const curr of [MAIN_CURRENCY, TOKEN]) {
      await r.server.app.scheduler.addJob('createWallet', { userId: user.id, currency: curr });
    }
  }

  user.status = 1;
  await user.save();

  return output({});
}

export const fastSetPublicKey = async (r) => {
  try {
    const user = await User.scope('auth').findByPk(r.auth.credentials.id);
    const { pubKey } = r.payload;

    try {
      const key = new NodeRSA(pubKey);
      if (!key.isPublic(true)) {
        throw new Error();
      }
    }
    catch (e) {
      return error(400000, 'Invalid public key', {});
    }

    user.set({ 'settings.pubKey': pubKey });
    await user.save();

    return output({ success: true });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
};

export const fastGetMessage = async (r) => {
  try {
    const user = await User.scope('auth').findOne({ where: { email: r.query.email } });
    const message = randomString(64);

    if (user) {
      user.set({ 'settings.message': message });
      await user.save();
    }

    return output({ message });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
};

export const fastLogin = async (r) => {
  try {
    const user = await User.scope('auth').findOne({ where: { email: r.payload.email } });

    if (!user) {
      return error(404000, 'User is not found', {});
    }

    const { signedMessage } = r.payload;
    const { message, pubKey } = user.settings;

    if (!message || !pubKey) {
      return error(403000, 'Access denied', {});
    }

    const key = new NodeRSA(pubKey);
    const signature = Buffer.from(signedMessage, 'base64');
    const messageBuffer = Buffer.from(message);
    const isValid = key.verify(messageBuffer, signature);

    if (!isValid) {
      return error(403000, 'Signature is invalid', {});
    }

    const session = await Session.create({
      userId: user.id,
      lastUsedDate: new Date(),
      lastUsedIp: getRealIp(r)
    });

    user.set({ 'settings.message': null });
    user.save();

    return output({ ...generateJwt({ id: session.id }) });
  }
  catch (e) {
    console.log(e);
    return error(500000, 'Internal server error', {});
  }
};

export const sendAdminInvite = async (r) => {
  try {
    await addJob('sendEmail', {
      email: r.payload.to,
      subject: 'HEdpAY | Register your admin account',
      html: `<html xmlns="http://www.w3.org/1999/html">
        <body>
        <p>Dear Mr. ${r.payload.lastName}, you have been intived to be an admin at
        <a href="https://hedpay.com" target="_blank">
          www.hedpay.com
        </a>
        . Please, verify your email address using following auth-code: <b>${r.payload.code}</b></p>
        </body>
      </html>`
    });

    return output({ sent: true });
  }
  catch (err) {
    console.log(err);
    return error(500000, 'Failed to send an invite email', null);
  }
};
