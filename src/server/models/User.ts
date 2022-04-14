import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Scopes,
  Table
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { getUUID } from '../utils';
import config from '../config/config';
import { Wallet } from './Wallet';
import { Session } from './Session';
import { Transaction } from './Transaction';
import { Notification } from './Notification';
import { UserStaking } from './UserStaking';
import { Referral } from './Referral';
import { ActiveStake } from './ActiveStake';

interface ISettings {
  confirmEmailToken: string;
  tmpPhoneNumber: string;
  confirmPhoneToken: string;

  totpToken: string;
  totpTempToken: string;

  restorePasswordToken: string;
  restorePasswordExpire: Date;

  banReason: string;
}

@Scopes(() => ({
  auth: {
    attributes: {
      include: ['settings', 'password']
    }
  }
}))
@Table({
  defaultScope: {
    attributes: {
      exclude: ['settings', 'password', 'createdAt', 'updatedAt']
    }
  }
})
export class User extends Model<User> {
  @ForeignKey(() => Referral)
  @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() })
  id!: string;

  @Column({ type: DataType.STRING, unique: true }) email: string;

  @Column({
    type: DataType.STRING,
    set(value: string) {
      const salt = bcrypt.genSaltSync(config.secure.saltRounds);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue('password', hash);
    },
    get() {
      return this.getDataValue('password');
    }
  })
  password: string;

  @Column(DataType.TEXT) avatar: string;

  @Column(DataType.STRING) firstName: string;

  @Column(DataType.STRING) lastName: string;

  @Column(DataType.STRING) username: string;

  @Column(DataType.STRING) phone: string;

  @Column(DataType.BOOLEAN) banned: boolean;

  @Column({ type: DataType.JSONB, defaultValue: {} }) settings: ISettings;

  @Column({ type: DataType.INTEGER, defaultValue: 0 }) status: number; // 0 - created, 1 - email verified, 2 - full verified profile

  @Column({ type: DataType.STRING, unique: true }) refLink: string;

  @Column(DataType.DOUBLE) unbanTimestamp: string;

  @Column(DataType.STRING) depositDex: string;

  async passwordCompare(pwd: string) {
    // Тут проблема с возвратом пароля, если его нет в defaultScope
    // @ts-ignore
    return bcrypt.compareSync(
      pwd,
      // prettier-ignore
      (
        // @ts-ignore
        await this._modelOptions.sequelize.models.User.findByPk(this.id, {
          attributes: ['password']
        })
      ).password
    );
  }

  @HasMany(() => Wallet) wallets: Wallet[];

  @HasMany(() => Session, { onDelete: 'CASCADE' }) sessions: Session[];

  @HasMany(() => Transaction) txs: Transaction[];

  @HasMany(() => Notification, { onDelete: 'CASCADE' }) notifications: Notification[];

  @HasMany(() => UserStaking, { onDelete: 'CASCADE' }) staking: UserStaking[];

  @HasMany(() => ActiveStake, { onDelete: 'CASCADE' }) stakes: ActiveStake[];

  @BelongsToMany(() => User, () => Referral, 'userId', 'refId') referrals: Referral[];
}
