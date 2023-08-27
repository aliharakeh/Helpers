import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { getFileName, validateUploadedFileType } from './file-upload-config';

@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: 'static/images',
        filename: getFileName,
      }),
      fileFilter: validateUploadedFileType,
    }),
  ],
  providers: [FileService],
  exports: [MulterModule, FileService],
})
export class FileModule {}
