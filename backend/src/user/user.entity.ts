import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column({ unique: true }) // Ensure emails are unique
    email!: string; // New email field

    // Add other fields as necessary
}