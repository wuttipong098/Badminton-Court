import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'bookings' })
export class bookings {
    @PrimaryGeneratedColumn({ name: 'booking_id', type: 'int8' })
    booking_id!: number;

    @Column({ name: 'user_id', type: 'int4' })
    user_id!: number;

    @Column({ name: 'court_id', type: 'int4' })
    court_id!: number;

    @Column({ name: 'start_time', type: 'time' })
    start_time!: string;

    @Column({ name: 'end_time', type: 'time' })
    end_time!: string;

    @Column({ name: 'total_price', type: 'int4' })
    total_price!: number;

    @Column({ name: 'status_id', type: 'int4' })
    status_id!: number;

    @Column({ name: 'booking_date', type: 'date' })
    booking_date!: string;

    @Column({ name: 'created_date', type: 'date' })
    created_date!: Date;

    @Column({ name: 'update_date', type: 'date', nullable: true })
    update_date!: Date | null;
}