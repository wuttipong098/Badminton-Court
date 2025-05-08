// src/repository/entity/imageow.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'image_owner' })
export class imageow {
  @PrimaryGeneratedColumn({ name: 'imowner_id', type: 'int8' })
  imowner_id!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @Column({ name: 'stadium_id', type: 'int4' })
  stadium_id!: number;

  @Column({ name: 'image_stadium', type: 'bytea', nullable: true })
  image_stadium: Buffer | null = null;

  @Column({ name: 'created_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date!: Date;

  @ManyToOne(() => require('./stadium').stadium, (stadium: any) => stadium.images)
  @JoinColumn({ name: 'stadium_id' })
  stadium!: any;
}