import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'stadiumBS' })
export class stadiumBS {
  @PrimaryGeneratedColumn({ name: 'stadium_id', type: 'int8' })
  stadiumId!: number;

  @Column({ name: 'stadium_name', type: 'text' })
  stadium_name!: string; 

  @Column({ name: 'location', type: 'text' })
  location!: string;

  @Column({ name: 'user_id', type: 'int4' })
  userId!: number; 
}