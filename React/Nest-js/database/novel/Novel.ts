import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../note/Note';

@Entity()
export class Novel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  last_chapter: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  origin: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updated: string;

  @OneToMany(() => Note, (note) => note.novel)
  notes: Note[];

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
