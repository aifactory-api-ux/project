import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductDispatchDto } from '../dto/dispatch.dto';

@Entity('dispatches')
export class DispatchEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  plantId: string;

  @Column('uuid')
  distributionCenterId: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date | null;

  @Column('uuid')
  vehicleId: string;

  @Column('uuid')
  driverId: string;

  @Column('jsonb')
  products: ProductDispatchDto[];
}