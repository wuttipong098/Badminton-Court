import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'users' })
export class user {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int8' })
  user_id!: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  user_name!: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 100 })
  phone_number!: string;

  @Column({ name: 'profile', type: 'bytea', nullable: true })
  profile: Buffer | null = null;

  @Column({ name: 'role_name', type: 'varchar', length: 255 })
  role_name: string = '';

  @OneToMany(() => require('./stadium').stadium, (stadium: any) => stadium.user)
  stadiums!: any[];
}