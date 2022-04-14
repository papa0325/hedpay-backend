import {
  BelongsTo, Column, DataType, ForeignKey, Model, Table
} from 'sequelize-typescript';
import * as Big from 'big-js';
import { literal, Op, Sequelize } from 'sequelize';
import { getUUID } from '../utils';
import { User } from './User';
import { Staking } from './Staking';
import { Currency } from './Currency';
import { calcOffset } from '../utils/helpers';

@Table({ tableName: 'UserStaking' })
export class UserStaking extends Model<UserStaking> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @Column(DataType.DECIMAL) amount: number;

    @Column(DataType.DATE) unlockDate: string;

    @ForeignKey(() => User) @Column(DataType.STRING) userId: string;

    @ForeignKey(() => Staking) @Column(DataType.STRING) stakeId: string;

    @Column(DataType.INTEGER) rewardCount: number;

    @Column({ type: DataType.DECIMAL(40, 20), defaultValue: 0 }) totalRewardAmount: number | string;


    @BelongsTo(() => User, { foreignKey: 'userId', targetKey: 'id', onDelete: 'CASCADE' }) user: User;

    @BelongsTo(() => Staking, { foreignKey: 'stakeId', targetKey: 'id', onDelete: 'CASCADE' }) stake: Staking;

    static async getPacks(userId:string, offset?:number, limit?:number) {
      const options: any = {
        attributes: { exclude: ['updatedAt', 'rewardCount'] },
        include: [{
          model: Staking,
          required: true
        }]
      };
      const count = await this.count({ where: { userId } });

      // let offset = calcOffset(count,page,onPage);
      // console.log(offset)
      options.where = { userId };
      options.offset = offset;
      options.limit = limit;
      options.order = [['createdAt', 'DESC']];

      const packs = await this.findAll(options);

      return { count, packs };
    }

    static async getTotalRewards(userId) {
      return this.findAll({
        where: {
          userId
        },
        attributes: [
          [Sequelize.fn('sum', Sequelize.col('totalRewardAmount')), 'total_reward_amount']
          // [Sequelize.fn('sum', Sequelize.col('totalRewardAmount')), 'total_reward_amount']
        ]
      });
    }

    static async getStakesSum(userId) {
      return this.findAll({
        where: {
          userId
        },
        attributes: [
          [Sequelize.fn('sum', Sequelize.col('amount')), 'total_amount'],
          [Sequelize.fn('max', Sequelize.col('unlockDate')), 'all_stakes_unlock_date']
          // [Sequelize.fn('sum', Sequelize.col('totalRewardAmount')), 'total_reward_amount']
        ]
      });
    }

    static async getWithdrawable(userId) {
      return this.findAll({
        where: {
          userId,
          unlockDate: {
            [Op.lte]: new Date()
          }
        },
        attributes: ['id', 'amount', 'totalRewardAmount', 'unlockDate']
      });
    }
}
