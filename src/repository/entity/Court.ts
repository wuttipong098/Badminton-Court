import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import { Status } from './status';

@Entity({ name: 'court' })
export class Court {
  @PrimaryGeneratedColumn({ name: 'court_id', type: 'int8' })
  id!: number;

  @Column({ name: 'stadiumId', type: 'int4' })
  stadiumId!: number;

  @Column({ name: 'court_number', type: 'int4' })
  courtId!: number; 

  @Column({ name: 'time', type: 'text' })
  time!: string;

  @Column({ name: 'price_hour', type: 'text' })
  price!: string;

  @Column({ name: 'user_id', type: 'int4' })
  userId!: number; 

  @Column({ name: 'isBooked', type: 'int4'})
  isBooked!: number;

  @Column({ name: 'active', type: 'bool' })
  active!: boolean;

  @Column({ name: 'start_time', type: 'time' })
  start_time!: string;

  @Column({ name: 'end_time', type: 'time' })
  end_time!: string;

  @ManyToOne(() => Status, status => status.status_id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'isBooked', referencedColumnName: 'status_id' })
  status!: any;
}