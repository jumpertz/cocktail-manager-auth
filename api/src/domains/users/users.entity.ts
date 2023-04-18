import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Exclude()
  role: string;

  /*@Column({ default: false })
  isAdmin: boolean;*/

  @Column()
  @Exclude()
  createdAt: Date;

  @Column()
  @Exclude()
  updatedAt: Date;

  @Column()
  @Exclude()
  deletedAt: Date;
}
