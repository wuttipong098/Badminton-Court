import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity({ name: "register" })
export class registerB {
  @PrimaryGeneratedColumn({ name: "register_id", type: "int8" })
  register_id!: number;

  @Column({ name: "first_name", type: "varchar", length: 100 })
  first_name!: string;

  @Column({ name: "last_name", type: "varchar", length: 100 })
  last_name!: string;

  @Column({ name: "phone_number", type: "varchar", length: 100 })
  phone_number!: string;

  @Column({ name: "location", type: "varchar", length: 100 })
  location!: string;

  @Column({ name: "role_name", type: "varchar", length: 100 })
  role_name!: string;

  @Column({ name: "created_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_date!: Date;

  @Column({ name: "user_name", type: "varchar", length: 100 })
  user_name!: string;

  @Column({ name: "password", type: "varchar", length: 100 })
  password!: string;

  @Column({ name: "stadium_name", type: "varchar", length: 100 })
  stadium_name!: string;

  @OneToMany(() => require("./imaregister").imaregister, (image: any) => image.register)
  images!: any[];
}