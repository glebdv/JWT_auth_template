import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

//BaseEntity allows to use commands on the declared class (such as findOne, remove, etc)

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int) //annotates type for UserResolver when importing User
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  // @Column({ unique: true, nullable: false })
  @Column({ unique: true })
  email: string;

  @Column()
  // @Column("text", { nullable: false, select: false })
  password: string;

  @Field()
  @Column("int", { default: 0 })
  tokenVersion: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: false })
  isActive: boolean;
}
