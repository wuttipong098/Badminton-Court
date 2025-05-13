import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'stadium_rule' })
export class bookingRule {
  @PrimaryGeneratedColumn({ name: 'rule_id', type: 'int8' })
  rule_id!: number;

  @Column({ name: 'stadium_id', type: 'int4' })
  stadiumId!: number;

  @Column({ name: 'user_id', type: 'int4' })
  user_id!: number;

  @Column({ name: 'rule_name', type: 'text' })
  rule_name!: string;
}