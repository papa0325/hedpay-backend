/*eslint-disable*/
import * as uuid from 'uuid/v4';
import { Boom } from '@hapi/boom';
import * as speakeasy from 'speakeasy';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as crypto from 'crypto';
import config from '../config/config';

const WAValidator = require('multicoin-address-validator');

export const getUUID = () => uuid();

export const getRealIp = (request) => (request.headers['cf-connecting-ip']
  ? request.headers['cf-connecting-ip']
  : request.info.remoteAddress);

export const randomString = (len: number): string => randomBytes(len).toString('hex').slice(0, len);

export const output = (res: object) => ({
  ok: true,
  result: res
});

export const error = (code: number, msg: string, data: object) => new Boom(msg, {
  data: {
    code,
    data,
    custom: true
  },

  statusCode: Math.floor(code / 1000)
});

export const totpValidate = (totp: string, secret: string): boolean => speakeasy.totp.verify({
  secret,
  encoding: 'base32',
  token: Number(totp)
});

export const convertFromBase64 = (str: string) => // Определиться что будем передавать, base64 или base64url
  Buffer.from(str, 'base64');
export const round = (num: number, decimals: number): number => Math.floor(num * 10 ** decimals) / 10 ** decimals;

export const getDate = (startDate: Date = new Date(), offset: number) => new Date(startDate.getTime() + offset);

export function validateAddress(address: string, type: string): boolean {
  return WAValidator.validate(address, type.toLowerCase(), config.networkType);
}

export function passwordValid(password: string): boolean {
  const
    space = /[\s]/.test(password);
  const checkSpecial = /[!@#$%^&*`()\[\]\{\}\\\|\/?<>:;.\-+='"~_]+/.test(password);
  const checkUpper = /[A-Z]+/.test(password);
  const checkLower = /[a-z]+/.test(password);
  return checkLower && checkUpper && checkSpecial && !space;
}

export function passwordValidJoiHandler(value, helpers) {
  if (!(passwordValid(value))) {
    return helpers.error('any.invalid');
  }

  return value;
}

export const checkOrCreateStorageFolders = async () => {
  const foldersArray = [config.path.avatarFolder, config.path.documentsFolder, config.path.tempFolder];
  for (const i in foldersArray) {
    if (!await fs.existsSync(foldersArray[i])) {
      await fs.mkdirSync(foldersArray[i]);
      await fs.chmodSync(foldersArray[i], 0o777);
    }
  }
};

export const unlinkFiles = async (files) => {
  if (!Array.isArray(files)) {
    files = [files];
  }

  for (const i in files) {
    await fs.unlinkSync(files[i].path);
  }
};

export const signature = (secret: string, algorithm: string, additionalString?: string) => {
  const crypt = crypto.createHmac(algorithm.toLocaleLowerCase(), secret);
  if (additionalString) {
    crypt.update(additionalString);
  }

  return crypt.digest('hex');
};
