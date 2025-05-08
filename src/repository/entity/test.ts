import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'image_owner' })
export class image_owner {
  @PrimaryGeneratedColumn({ name: 'imowner_id', type: 'int8' })
  imowner_id!: number;

  @Column({ name: 'user_id', type: 'int4'})
  user_id!: number;

  @Column({ name: 'stadium_id', type: 'int4'})
  stadium_id!: number;

  @Column({ name: "image_stadium", type: "bytea", nullable: true})
  image_stadium: Buffer | null = null;

}