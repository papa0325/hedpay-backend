import {
  Model, Column, Table, DataType, ForeignKey, HasMany
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as Big from 'big-js';
import { getUUID } from '../utils';
import { User } from './User';
import { Transaction } from './Transaction';

interface ITransactionSumParams{
    userId: string, period?: {from: Date, to: Date}
}

@Table({ tableName: 'Orders' })
export class Order extends Model<Order> {
    @Column({ type: DataType.STRING, defaultValue: () => getUUID(), primaryKey: true }) id!: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: false }) userId: string;

    @Column(DataType.STRING) pairName: string;

    @Column(DataType.INTEGER) side: number; // 0 = buy, 1 = sell, 2 = stacking

    @Column(DataType.DECIMAL(40, 20)) amount: number;

    @Column(DataType.DECIMAL(40, 20)) unitPrice: number;

    @Column(DataType.INTEGER) status: number;// 0 = new, 1 = success, -1 = canceled, -2 = failed

    @Column({ type: DataType.STRING, allowNull: true }) leftSideSymbolId: string;

    @Column({ type: DataType.STRING, allowNull: true }) rightSideSymbolId: string;

    @Column({ type: DataType.STRING, allowNull: true }) productId: string;

    @HasMany(() => Transaction, 'orderId')
    transactions: Transaction[];

    static async getHDPBoughtTransactionSumByUserId(params:ITransactionSumParams) {
      const where: any = { userId: params.userId, side: 0, leftSideSymbolId: 'hdp.ф' };
      if (params.period) {
        where.createdAt = { [Op.between]: [params.period.from, params.period.to] };
      }

      const transactions = await this.findAll({ where });

      return transactions.reduce((acc, itm) => Big(acc).plus(Big(itm.amount)).toString(), 0);
    }
}
