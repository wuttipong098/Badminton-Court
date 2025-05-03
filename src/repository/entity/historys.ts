import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'history' })
export class history {
  @PrimaryGeneratedColumn({ name: 'history_id', type: 'int8' })
  history_id!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @Column({ name: 'booking_date', type: 'date' })
  booking_date!: Date; 

  @Column({ name: 'start_time', type: 'time' })
  start_time!: string;

  @Column({ name: 'end_time', type: 'time' })
  end_time!: string;

  @Column({ name: 'stadium_name', type: 'varchar', length: 100 })
  stadium_name!: string;

  @Column({ name: 'court_number', type: 'int4' })
  court_number!: number;
}