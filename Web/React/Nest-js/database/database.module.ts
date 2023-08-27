import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note/Note';
import { Novel } from './novel/Novel';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Novel, Note])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
