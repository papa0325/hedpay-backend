import auth from './auth';
import profile from './profile';
import ipn from './ipn';
import wallet from './wallet';
import txs from './txs';
import currency from './currency';
import distribution from './distribution';
import notification from './notification';
import staking from './staking';
import ref from './refferal';
import soon from './coming-soon';
import contacts from './contacts';
import chat from './chat';

export const routes = [
  ...auth,
  ...profile,
  ...ipn,
  ...wallet,
  ...txs,
  ...currency,
  ...distribution,
  ...staking,
  ...notification,
  ...ref,
  ...soon,
  ...contacts,
  ...chat,
];
