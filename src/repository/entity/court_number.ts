import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SlotTime } from '@/repository/entity/slot_time';

@Entity({ name: 'court' })
export class CourtNumber {
  @PrimaryGeneratedColumn({ name: 'court_id', type: 'int8' })
  court_id!: number;

  @Column({ name: 'stadium_id', type: 'int4' })
  stadium_id!: number;

  @Column({ name: 'court_number', type: 'int4' })
  court_number!: number;

  @Column({ name: 'price_hour', type: 'int4' })
  price_hour!: number;

  @Column({ name: 'active', type: 'varchar', length: 50 })
  active!: string;

  @Column({ name: 'created_date', type: 'date' })
  created_date!: Date;

  @OneToMany(() => SlotTime, (slot) => slot.court, { cascade: true })
  slots!: SlotTime[];
}