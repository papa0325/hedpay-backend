import { Session } from '../models/Session';

interface IUpdateSession {
  id: string;
  ip: string;
  date: Date;
}

export default async (payload: IUpdateSession) => {
  const session = await Session.findByPk(payload.id);
  session.lastUsedIp = payload.ip;
  session.lastUsedDate = payload.date;
  await session.save();
};
