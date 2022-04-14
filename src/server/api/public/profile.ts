/*eslint-disable*/
import * as fs from 'fs';
import * as Path from 'path';
import { unlinkSync } from 'fs';
import axios from 'axios';
import { User } from '../../models/User';
import {
  convertFromBase64, error, getUUID, output, randomString, unlinkFiles, signature
} from '../../utils';
import config from '../../config/config';
import { Wallet } from '../../models/Wallet';
import { Currency } from '../../models/Currency';
import { UserStaking } from '../../models/UserStaking';
import { list } from '../../store/documents-mime-types';

import countries from '../../config/countries';

export const getMe = async (r) => {
  let user = await User.findByPk(r.auth.credentials.id, {
    include: [{
      model: Wallet
    },
    {
      model: UserStaking
    }
    ],
    attributes: { include: ['settings'] }
  });

  // if (user.status !== 2) {
  //   const wallets = JSON.parse(JSON.stringify(user.dataValues.wallets));
  //   user.dataValues.wallets = wallets.map((item) => ({ ...item, address: '' }));
  // }

  if (user.avatar) {
    user.avatar = `${config.path.serverURL}${config.path.avatarURL}/${user.avatar}`;
  }

  let profileIdentifyData = {};

  if (user.settings.profileIdentifyData) {
    profileIdentifyData = user.settings.profileIdentifyData;
  }

  delete user.dataValues.settings;
  user = { ...user.dataValues, profileIdentityVerification: profileIdentifyData };

  return output({ ...user, availableCountries: countries });
};

export const edit = async (r) => {
  const user = await User.findByPk(r.auth.credentials.id, { attributes: { include: ['settings'] } });
  const data = { ...r.payload };

  if (r.payload.username) {
    if (await User.findOne({ where: { username: r.payload.username } })) {
      return error(400000, 'Username is already in use', { field: 'username', reason: 'used' });
    }
  }

  user.set({
    'settings.profileIdentifyData': r.payload.profileIdentityVerification,
    status: 1
  });
  await user.save();

  if (r.payload.avatar) {
    const filename = `${randomString(30)}.jpg`;
    if (user.avatar && await fs.existsSync(`${config.path.avatarFolder}/${user.avatar}`)) {
      await fs.unlinkSync(`${config.path.avatarFolder}/${user.avatar}`);
    }

    fs.writeFileSync(`${config.path.avatarFolder}/${filename}`, r.payload.avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), {
      encoding: 'base64',
      mode: 0o777
    });
    data.avatar = filename;
  }

  await user.update(data);
  return output({});
};

export const kycGetFields = async (r) => {
  try {
    const { country } = r.params;

    const isAvailable = !!(config.kyc.w2.countries.split(',').find((c) => c === country));

    if (!isAvailable) {
      return error(404000, 'The country is not available', { param: 'country' });
    }

    const fieldsResp = await axios.get(`${config.kyc.url}/w2/fields/GLOBAL_MULTI`);
    return output(fieldsResp.data.result);
  }
  catch (e) {
    return error(500000, 'Internal server error', {});
  }
};

export const kycVerify = async (r) => {
  try {
    const _user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });

    const kycResp = await axios.post(`${config.kyc.url}/w2/global/global_multi`, { ..._user.settings.profileIdentifyData });

    if (kycResp.data.ok) {
      _user.set({ status: 2 });
      await _user.save();
    }

    return kycResp.data;
  }
  catch (e) {
    console.log(e);
    if (e.response && e.response.status === 400) {
      return error(400000, 'The profile is not fully filled in', {});
    }

    return error(500000, 'Internal server error', {});
  }
};

export const changePassword = async (r) => {
  const user = await User.findByPk(r.auth.credentials.id);

  if (!await user.passwordCompare(r.payload.oldPassword)) {
    return error(400000, 'Old password is invalid', { field: 'old_password', reason: 'invalid' });
  }

  user.set({ password: r.payload.newPassword });
  await user.save();
  return output({});
};

export const uploadDocuments = async (r, h) => {
  const files: any = Object.values(r.payload);
  try {
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    let toSaveDocs = [];
    if (user.settings.profileIdentifyDocuments) {
      const dCount = user.settings.profileIdentifyDocuments.length;
      if (dCount === 2) {
        await unlinkFiles(files);
        return error(400000, 'you got 2 documents uploaded', {});
      }

      if ((2 - dCount) < Object.keys(r.payload).length) {
        await unlinkFiles(files);
        return error(400000, `you can upload only ${2 - dCount} more document`, {});
      }

      toSaveDocs = user.settings.profileIdentifyDocuments;
    }

    const userPath = Path.join(config.path.documentsFolder, user.id);
    if (!await fs.existsSync(userPath)) {
      await fs.mkdirSync(userPath, { mode: 0o777 });
    }

    const resp = [];

    for (const i in files) {
      if (list.indexOf(files[i].headers['content-type']) === -1) {
        await unlinkFiles(files);
        return error(400000, `document type not allowed`, {});
      }
    }

    for (const i in files) {
      const file = files[i];

      const fileObj = {
        fileName: getUUID(),
        fileOriginName: file.filename,
        type: file.headers['content-type'],
        bytes: file.bytes
      };
      await fs.writeFileSync(Path.join(userPath, fileObj.fileName), fs.readFileSync(file.path));
      resp.push({
        docId: fileObj.fileName,
        originalName: fileObj.fileOriginName,
        type: file.headers['content-type']
      });
      await unlinkSync(file.path);
      toSaveDocs.push(fileObj);
    }

    // user.set({'settings.profileIdentifyDocuments': toSaveDocs});
    await User.update({ 'settings.profileIdentifyDocuments': toSaveDocs }, { where: { id: r.auth.credentials.id } });

    return output(resp);
  }
  catch (e) {
    await unlinkSync(files);
    console.log(e);
  }
};

export const getProfileDocumentList = async (r, h) => {
  try {
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings.profileIdentifyDocuments) {
      return output([]);
    }

    const respArray = [];
    for (const i in user.settings.profileIdentifyDocuments) {
      const resObj = {
        docId: user.settings.profileIdentifyDocuments[i].fileName,
        originalName: user.settings.profileIdentifyDocuments[i].fileOriginName,
        type: user.settings.profileIdentifyDocuments[i].type
      };
      respArray.push(resObj);
    }

    return output(respArray);
  }
  catch (e) {
    console.log(e);
  }
};

export const deleteProfileDocument = async (r, h) => {
  try {
    const file = r.query.id;
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings.profileIdentifyDocuments) {
      return error(400000, `you have no documents yet`, {});
    }

    const userDocPath = Path.join(config.path.documentsFolder, r.auth.credentials.id);
    for (const i in user.settings.profileIdentifyDocuments) {
      const { settings } = user;
      const d = user.settings.profileIdentifyDocuments[i];
      const filePath = Path.join(userDocPath, file);
      if (d.fileName === file) {
        if (await fs.existsSync(userDocPath) && await fs.existsSync(filePath)) {
          await fs.unlinkSync(filePath);
        }

        settings.profileIdentifyDocuments.splice(parseInt(i), 1);
        user.set({ 'settings.profileIdentifyDocuments': settings.profileIdentifyDocuments });

        await User.update({ 'settings.profileIdentifyDocuments': settings.profileIdentifyDocuments },
          { where: { id: r.auth.credentials.id } });

        return output({ success: true });
      }
    }

    return error(400000, `document not found`, {});
  }
  catch (e) {
    console.log(e);
  }
};

export const getAvatar = async (r, h) => {
  try {
    if (!await fs.existsSync(`${config.path.avatarFolder}/${r.params.avatar}`)) {
      return error(400004, 'avatar not found', {});
    }

    return await h.file(`${config.path.avatarFolder}/${r.params.avatar}`);
  }
  catch (e) {
    console.log(e);
  }
};
