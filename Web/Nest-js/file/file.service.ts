import { Injectable } from '@nestjs/common';
import { unlink } from 'fs';

@Injectable()
export class FileService {
  deleteFile(path) {
    return new Promise<boolean>((resolve, reject) => {
      unlink(path, err => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }
}
