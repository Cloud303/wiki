/* eslint-disable @typescript-eslint/ban-types */
import {
  CreatedAt,
  UpdatedAt,
  Column,
  PrimaryKey,
  IsUUID,
  DataType,
  Default,
} from "sequelize-typescript";
import Model from "./Model";

class IdModel<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModelAttributes extends {} = any,
  TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  resolvedAt: Date;
}

export default IdModel;
