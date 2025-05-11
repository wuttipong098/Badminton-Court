import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'payments' })
export class payments {
    @PrimaryGeneratedColumn({ name: 'payment_id', type: 'int8' })
    payment_id!: number;

    @Column({ name: 'booking_id', type: 'int4' })
    booking_id!: number;
    
    @Column({ name: 'total_price', type: 'int4' })
    total_price!: number;

    @Column({ name: 'payment_status', type: 'varchar', length: 50 })
    payment_status!: string;

    @Column({ name: 'image_slip', type: 'bytea', nullable: true })
    image_slip: Buffer | null = null;

    @Column({ name: 'payment_date', type: 'date' })
    payment_date!: Date;

}