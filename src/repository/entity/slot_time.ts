import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'slot_time' })
export class SlotTime {
  @PrimaryGeneratedColumn({ name: 'slot_time_id', type: 'bigint' })
  slot_time_id!: number;

  @Column({ name: 'court_id', type: 'integer' })
  court_id!: number;

  @Column({ name: 'booking_date', type: 'date' })
  booking_date!: Date;

  @Column({ name: 'start_time', type: 'time' })
  start_time!: string;

  @Column({ name: 'end_time', type: 'time' })
  end_time!: string;

  @Column({ name: 'status_id', type: 'integer' })
  status_id!: number;

  @Column({ name: 'created_date', type: 'date' })
  created_date!: Date;

  @Column({ name: 'update_date', type: 'date', nullable: true })
  update_date!: Date | null;

  @ManyToOne(
    () => require('./court_number').CourtNumber,
    (court: any) => court.slots,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'court_id', referencedColumnName: 'court_id' })
  court!: any;

  @ManyToOne(
    () => require('./status').Status,
    (status: any) => status.slots,
    { onDelete: 'SET NULL' }
  )
  @JoinColumn({ name: 'status_id', referencedColumnName: 'status_id' })
  status!: any;
}