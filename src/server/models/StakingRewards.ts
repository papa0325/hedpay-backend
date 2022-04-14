import {
  BelongsTo, Column, DataType, Model, Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { UserStaking } from './UserStaking';

@Table({ tableName: 'StakingRewards' })
export class StakingRewards extends Model<StakingRewards> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @Column(DataType.DECIMAL) amount: string;

    @Column(DataType.DECIMAL) userId: string;

    @Column(DataType.DECIMAL) stakeId: string;

    @BelongsTo(() => UserStaking, 'stakeId') userStake:UserStaking[];
}
