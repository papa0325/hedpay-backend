import axios from 'axios';
import * as Speakeasy from 'speakeasy';
import config from '../config/config';

const base64data = Buffer.from(`${config.gateway.username}:${config.gateway.password}`).toString('base64');

interface ICreateAddress {
  currency: string;
}

export const createAddress = async (data: ICreateAddress) => {
  const res = await axios.get(`${config.gateway.url}/address?currency=${data.currency}`, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Basic ${base64data}`
    }
  });
  return res.data;
};

interface IGetBalance {
  address: string;
  currency: string;
}

export const getBalance = async (data: IGetBalance) => {
  console.log(`${config.gateway.url}/address-info?currency=${data.currency}&address=${data.address}`);
  const res = await axios.get(`${config.gateway.url}/address-info?currency=${data.currency}&address=${data.address}`, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Basic ${base64data}`
    }
  });
  if (!res.data) {
    return 0;
  }

  return res.data.balance;
};

export async function withdraw(
  from: string,
  to: string,
  amount: string,
  currency: string,
  id: string,
  tokenTransfer: boolean,
  symbol: string
) {
  const otp = Speakeasy.totp({
    secret: config.gateway.otp,
    encoding: 'base32'
  });
  let str = `/withdraw?to=${to}&amount=${amount}&currency=${encodeURI(currency)}&id=${id}&isTokenTransferTx=${tokenTransfer}`;
  if (tokenTransfer) {
    str += `&symbol=${encodeURI(symbol)}`;
  }

  console.log('withdraw string:', JSON.stringify(config.gateway.url + str));
  const res = await axios.get(config.gateway.url + str,
    {
      headers: {
        Authorization: `Basic ${base64data}`,
        otp
      }
    });
  return res.data;
}

export const createDepositAddress = async (userId: string) => {
  const res = await axios.get(`${config.dex.url}/address?userid=${userId}`, {
    headers: {
      'content-type': 'application/json'
    },
    auth: {
      username: config.dex.serverId,
      password: config.dex.serverPassword
    }
  });
  return res.data;
};
