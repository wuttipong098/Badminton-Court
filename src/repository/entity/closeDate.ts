import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({ name: 'stadium_closedate' })
export class closeDate {
  @PrimaryGeneratedColumn({ name: 'closedate_id', type: 'int8' })
  closedate_id!: number;

  @Column({ name: 'stadium_id', type: 'int8' })
  stadium_id!: number;

  @Column({ name: 'closeDate', type: 'text' }) // เก็บ JSON string
  closeDates!: string | null;
}