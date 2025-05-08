import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'stadium' })
export class stadium {
  @PrimaryGeneratedColumn({ name: 'stadium_id', type: 'int8' })
  stadium_id!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @Column({ name: 'stadium_name', type: 'varchar', length: 100 })
  stadium_name: string = '';

  @Column({ name: 'court_all', type: 'int4' })
  court_all: number = 0;

  @Column({ name: 'location', type: 'varchar', length: 100 })
  location: string = '';

  @OneToMany(() => require('./imageow').imageow, (image: any) => image.stadium, { cascade: true })
  images!: any[];

  @OneToMany(() => require('./favorite').favorite, (favorite: any) => favorite.stadium, { cascade: true })
  favorites!: any[];
}