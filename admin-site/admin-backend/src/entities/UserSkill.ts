import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Skill } from "./Skill";

@Entity()
export class UserSkill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.userSkills, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Skill, (skill) => skill.userSkills, {
    eager: true,
    onDelete: "CASCADE",
  })
  skill!: Skill;
}
