import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Novel } from '../novel/Novel';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updated: string;

  @ManyToOne(() => Novel, (novel) => novel.notes)
  novel: Novel;

  @BeforeInsert()
  initDates() {
    const date = new Date().toISOString();
    this.created = date;
    this.updated = date;
  }

  @BeforeUpdate()
  updateDates() {
    this.updated = new Date().toISOString();
  }
}
