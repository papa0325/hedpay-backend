import {
  Column, DataType, Model, Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';

@Table({ tableName: 'Staking' })
export class Staking extends Model<Staking> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @Column(DataType.DECIMAL) min: number;

    @Column(DataType.DECIMAL) max: number;

    @Column(DataType.DECIMAL) price: number;

    @Column(DataType.DECIMAL) percentage: number;

    static async getPacks() {
      return this.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        raw: true
      });
    }
}
