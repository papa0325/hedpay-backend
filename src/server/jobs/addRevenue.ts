import { literal, Op, where } from 'sequelize';
import { ActiveStake } from '../models/ActiveStake';

function addRevenue() {
  return ActiveStake.update({
    revenue: literal('"revenue" + "deposit" *  "interest" / 365')
  }, {
    where: {
      status: ActiveStake.STATUS_ACTIVE
    }
  });
}

function checkStatus() {
  return ActiveStake.update({
    status: ActiveStake.STATUS_CLOSED
  }, {

    where: {
      status: ActiveStake.STATUS_ACTIVE,
      endingDate: {
        [Op.lte]: Date.now()
      }


    }
  });
}

export default async function () {
  await addRevenue();
  await checkStatus();
}
