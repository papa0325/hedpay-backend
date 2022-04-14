import {
  BelongsTo, Column, DataType, ForeignKey, Model, Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { DistributionSession } from './DistributionSession';
import { Order } from './Order';

@Table({ tableName: 'TokenDistributionSessionsPacks' })
export class DistributionSessionPacks extends Model<DistributionSessionPacks> {
    @Column({ type: DataType.STRING, defaultValue: () => getUUID(), primaryKey: true })
    id!: string;

    @ForeignKey(() => DistributionSession)
    @Column(DataType.STRING) sessionID!: string;

    @Column({
      type: DataType.DECIMAL(40, 20),
      allowNull: true,
      get() {
        return parseFloat(this.getDataValue('min'));
      }
    })
    min: number;

    @Column({
      type: DataType.DECIMAL(40, 20),
      allowNull: true
    })max: number;

    @Column({
      type: DataType.DECIMAL(40, 20),
      allowNull: true
    })price: number;

    @Column({
      type: DataType.DECIMAL(40, 20),
      allowNull: true
    })limit: number;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })currencyID: string;

    @Column({
      type: DataType.DATE,
      allowNull: true
    })lastCounterDropTime: string;

    @Column({
      type: DataType.INTEGER,
      allowNull: true
    })counterInterval: string;


    @BelongsTo(() => DistributionSession, { onDelete: 'CASCADE' })
    session: DistributionSession;

    static async getPacks(withUserDayLimits?: string) {
      let disabled = 1;

      const Session = await DistributionSession.getDistributionSessionWithPacks();
      const boughtAmount = parseFloat(Session.boughtAmount);
      let prevLimitsSum = 0;

      let activePack = null;
      const packs = Session.packs.map((itm) => {
        const limit = parseFloat(itm.limit);
        let inPackLeft = 0;
        let percentage = 100;
        // let amountLeft = 0;

        if ((boughtAmount - prevLimitsSum) < limit) {
          disabled--;
          inPackLeft = limit;
          // amountLeft = 0;
          // console.log(itm);

          if (!disabled && boughtAmount > 0) {
            // amountLeft = todayTransactionSum;
            inPackLeft = limit - (boughtAmount - prevLimitsSum);
            percentage = (inPackLeft / limit) * 100;
          }

          if (!activePack) {
            activePack = itm;
            activePack.inPackLeft = inPackLeft;
          }
        }

        prevLimitsSum += limit;
        return {
          id: itm.id,
          amount: limit,
          price: parseFloat(itm.price),
          price_currency: 'ETH',
          // amountLeft:parseFloat(itm.max) - amountLeft,
          min: parseFloat(itm.min),
          max: parseFloat(itm.max),
          currency: 'HDP',
          packagesQuantity: inPackLeft,
          progressBar: percentage < 0.4 ? 0.4 : percentage.toFixed(6),
          isObtained: false,
          disabled: !!disabled
        };
      });
      return { activePack, packs };
    }
}
