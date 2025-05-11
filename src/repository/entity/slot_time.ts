import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CourtNumber } from '@/repository/entity/court_number';
import { Status } from '@/repository/entity/status';

@Entity({ name: 'slot_time' })
export class SlotTime {
  @PrimaryGeneratedColumn({ name: 'slot_time_id', type: 'int8' })
  slot_time_id!: number;

  @Column({ name: 'court_id', type: 'int4' })
  court_id!: number;

  @Column({ name: 'booking_date', type: 'date' })
  booking_date!: Date;

  @Column({ name: 'start_time', type: 'time' })
  start_time!: string;

  @Column({ name: 'end_time', type: 'time' })
  end_time!: string;

  @Column({ name: 'status_id', type: 'int4' })
  status_id!: number;

  @Column({ name: 'created_date', type: 'date' })
  created_date!: Date;

  @Column({ name: 'update_date', type: 'date', nullable: true })
  update_date!: Date;

  @ManyToOne(() => CourtNumber, (court) => court.slots)
  @JoinColumn({ name: 'court_id' })
  court!: CourtNumber;

  @ManyToOne(() => Status, (status) => status.slots)
  @JoinColumn({ name: 'status_id' })
  status!: Status;
}