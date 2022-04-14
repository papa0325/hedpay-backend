import {
  Column, DataType, Model, Table
} from 'sequelize-typescript';

@Table({ tableName: 'StakingPackages' })
export class StakingPackage extends Model<StakingPackage> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true }) id!: number;

    @Column(DataType.DECIMAL(40, 20)) minValue: number;

    @Column(DataType.DECIMAL(40, 20)) interest: number;

    @Column(DataType.DECIMAL(40, 20)) fee: number;
}
