import { Sequelize } from 'sequelize-typescript';
import { Currency } from './Currency';
import { Notification } from './Notification';
import { Package } from './Package';
import { RatesHistory } from './RatesHistory';
import { Referral } from './Referral';
import { Transaction } from './Transaction';
import { User } from './User';
import { UserPackage } from './UserPackage';
import { Wallet } from './Wallet';
import { Session } from './Session';
import { DistributionSession } from './DistributionSession';
import { DistributionSessionPacks } from './DistributionSessionPacks';
import { Order } from './Order';
import { Staking } from './Staking';
import { UserStaking } from './UserStaking';
import { ActiveConnections } from './ActiveConnections';
import { Rewards } from './Rewards';
import { StakingRewards } from './StakingRewards';
import { ComingSoonSubscribers } from './ComingSoonSubscribers';
import { ReferralStat } from './ReferralStat';
import { Contacts } from './Contacts';

import config from '../config/config';
import { Chat } from './Chat';
import { ChatLine } from './ChatLine';
import { ChatLineAttachment } from './ChatLineAttachment';
import { Admin } from './Admin';
import { AdminSession } from './AdminSession';
import { Log } from './Log';
import { ActiveStake } from './ActiveStake';
import { StakingPackage } from './StakingPackage';

const sequelize = new Sequelize(config.db.link, {
  dialect: 'postgres',
  models: [
    Currency,
    Notification,
    Package,
    RatesHistory,
    Referral,
    Session,
    Transaction,
    User,
    UserPackage,
    Wallet,
    DistributionSession,
    DistributionSessionPacks,
    Order,
    UserStaking,
    ActiveStake,
    StakingPackage,
    Staking,
    ActiveConnections,
    Rewards,
    StakingRewards,
    ComingSoonSubscribers,
    ReferralStat,
    Contacts,
    Chat,
    ChatLine,
    ChatLineAttachment,
    Admin,
    AdminSession,
    Log
  ],
  logging: false
});

sequelize.authenticate();

export default sequelize;
