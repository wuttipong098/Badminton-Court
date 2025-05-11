import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SlotTime } from '@/repository/entity/slot_time';

@Entity({ name: 'status_court' })
export class Status {
  @PrimaryGeneratedColumn({ name: 'status_id', type: 'int8' })
  status_id!: number;

  @Column({ name: 'status_name', type: 'varchar', length: 50 })
  status_name!: string;

  @Column({ name: 'created_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date!: Date;

  @OneToMany(() => SlotTime, (slot) => slot.status, { cascade: true })
  slots!: SlotTime[];
}