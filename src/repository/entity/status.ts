import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'status_court' })
export class Status {
  @PrimaryGeneratedColumn({ name: 'status_id', type: 'int8' })
  status_id!: number;

  @Column({ name: 'status_name', type: 'varchar', length: 50 })
  status_name!: string;

  @Column({ name: 'created_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date!: Date;

  @OneToMany(
    () => require('./slot_time').SlotTime,
    (slot: any) => slot.status,
    { cascade: ['insert', 'update'], onDelete: 'SET NULL' }
  )
  // Cascade insert/update for slots, set status_id to null when status is deleted
  slots!: any[];
}