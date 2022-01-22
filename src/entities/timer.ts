import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
import { instanceToPlain, plainToInstance } from "class-transformer";

@Entity()
export class Timer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  executeAt: number;

  @Column()
  url: string;

  serialize(): string {
    return JSON.stringify(instanceToPlain(this));
  }
  
  static deserialize(json: string): Timer {
    return plainToInstance(Timer, JSON.parse(json));
  }
}
