import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    private readonly STORAGE_KEY = 'notifications';

    constructor(private storage: StorageService) {}
}
