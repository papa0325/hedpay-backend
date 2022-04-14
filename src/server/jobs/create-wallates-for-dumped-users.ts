import * as Big from 'big-js';
import { Currency } from '../models/Currency';
import { createAddress } from '../utils/gateway';
import { IWalletSettings, Wallet } from '../models/Wallet';
import { getDate } from '../utils';
import { User } from '../models/User';


export default async () => {
  User.findAll();
};
