import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Court' })
export class Court {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int8' })
  id!: number;

  @Column({ name: 'stadiumId', type: 'int4' })
  stadiumId!: number;

  @Column({ name: 'courtId', type: 'int4' })
  courtId!: number; 

  @Column({ name: 'time', type: 'text' })
  start_time!: string;

  @Column({ name: 'price', type: 'text' })
  price!: string;

  @Column({ name: 'paymentTime', type: 'text' })
  paymentTime!: string;

  @Column({ name: 'isBooked', type: 'bool'})
  isBooked!: boolean;

  @Column({ name: 'active', type: 'bool' })
  active!: boolean;
}