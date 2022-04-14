import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TypeLogs } from '../store/constants/admin-types';
import { User } from './User';

@Table({
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  },
})
export class Log extends Model<Log> {
  @ForeignKey(() => User)
  @Column(DataType.STRING)
  userId: string;

  @Column(DataType.STRING)
  usedIP: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column(DataType.STRING)
  type: TypeLogs;

  @Column(DataType.DECIMAL)
  timestamp: string;
}
