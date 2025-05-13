import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import { Status } from './status';

@Entity({ name: 'Court' })
export class Court {
  @PrimaryGeneratedColumn({ name: 'court_id', type: 'int8' })
  id!: number;

  @Column({ name: 'stadiumId', type: 'int4' })
  stadiumId!: number;

  @Column({ name: 'court_number', type: 'int4' })
  courtId!: number; 

  @Column({ name: 'time', type: 'text' })
  time!: string;

  @Column({ name: 'price', type: 'text' })
  price!: string;

  @Column({ name: 'paymentTime', type: 'text' })
  paymentTime!: string;

  @Column({ name: 'user_id', type: 'int4' })
  userId!: number; 

  @Column({ name: 'isBooked', type: 'int4'})
  isBooked!: number;

  @Column({ name: 'active', type: 'bool' })
  active!: boolean;

  @ManyToOne(() => Status, status => status.status_id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'isBooked', referencedColumnName: 'status_id' })
  status!: any;
}