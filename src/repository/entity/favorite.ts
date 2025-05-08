// src/repository/entity/favorite.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'favorite' })
export class favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id', type: 'int8' })
  favorite_id!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @Column({ name: 'stadium_id', type: 'int4' })
  stadium_id!: number;

  @ManyToOne(() => require('./stadium').stadium, (stadium: any) => stadium.favorites)
  @JoinColumn({ name: 'stadium_id' })
  stadium!: any;
}