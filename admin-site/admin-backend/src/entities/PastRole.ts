import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PastRole {
  @PrimaryColumn("char", { "length": 36 })
  past_role_ID!: string;

  @Column({ "length": 255 })
  role_name!: string;

  @Column({ "length": 255 })
  company!: string;

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @ManyToOne(() => User, user => user.pastRoles)
  @JoinColumn({ "name": "user_ID" })
  user!: User;
} 
