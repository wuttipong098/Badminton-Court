import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { user } from './login';

@Entity({ name: 'stadium' })
export class stadium {
  @PrimaryGeneratedColumn({ name: 'stadium_id', type: 'int8' })
  stadium_id!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @ManyToOne(() => user, (user) => user.stadiums)
  @JoinColumn({ name: 'user_id' })
  user!: user;

  @Column({ name: 'stadium_name', type: 'varchar', length: 100 })
  stadium_name: string = '';

  @Column({ name: 'court_all', type: 'int4' })
  court_all: number = 0;

  @Column({ name: 'location', type: 'varchar', length: 100 })
  location: string = '';

  @Column({ name: 'image_slip', type: 'bytea', nullable: true })
  image_slip: Buffer | null = null;

  @Column({ name: 'price', type: 'text' })
  price!: string;

  @Column({ name: 'paymenttime', type: 'text' })
  paymentTime!: string;

  @Column({ name: 'closedates', type: 'text' }) // เก็บ JSON string
  closeDates!: string | null;

  @OneToMany(() => require('./imageow').imageow, (image: any) => image.stadium, { cascade: true })
  images!: any[];

  @OneToMany(() => require('./favorite').favorite, (favorite: any) => favorite.stadium, { cascade: true })
  favorites!: any[];
}