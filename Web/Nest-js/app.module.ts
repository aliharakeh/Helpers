import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelModule } from './novel/novel.module';
import { NoteModule } from './note/note.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FileModule } from './file/file.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'src/database/novels.sql',
      logger: 'advanced-console',
      logging: 'all',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      exclude: ['/api*'],
    }),
    DatabaseModule,
    FileModule,
    NovelModule,
    NoteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
