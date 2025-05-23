import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity({ name: "image_register" })
export class imaregister {
  @PrimaryGeneratedColumn({ name: "image_register_id", type: "int8" })
  image_register_id!: number;

  @Column({ name: "register_id", type: "int4" })
  register_id!: number;

  @Column({ name: "image", type: "bytea", nullable: true })
  image: Buffer | null = null;

  @Column({ name: "created_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_date!: Date;

  @ManyToOne(() => require("./registerBS").registerB, (register: any) => register.images)
  @JoinColumn({ name: "register_id" })
  register!: any;
}