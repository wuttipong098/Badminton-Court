import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({ name: 'register' })
export class registerB {
  @PrimaryGeneratedColumn({ name: 'register_id', type: 'int8' })
  register_id!: number;

  @Column({ name: 'first_name', type: 'text' })
  first_name!: string;

  @Column({ name: 'last_name', type: 'text' })
  last_name!: string; 

  @Column({ name: 'phone_number', type: 'text' })
  phone_number!: string;

  @Column({ name: 'location', type: 'text' })
  location!: string;

  @Column({ name: 'role_name', type: 'text' })
  role_name!: string;

  @Column({ name: 'created_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date!: Date;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  user_name!: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password!: string;

  @Column({ name: 'courtlocation', type: 'varchar', length: 100 })
  court_location!: string;

  @Column({ name: 'stadium_name', type: 'varchar', length: 100 })
  stadium_name!: string;
}