import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import {from, of} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private _storage: Storage | null = null;

    constructor(private storage: Storage) {
    }

    public init() {
        return this._toObservable(this.storage.defineDriver(CordovaSQLiteDriver)).pipe(
            switchMap(_ => this._toObservable(this.storage.create())),
            tap((storage) => this._storage = storage)
        );
    }

    public set(key: string, value: any) {
        return this._toObservable(this._storage.set(key, value));
    }

    public get(key: string) {
        return this._toObservable(this._storage.get(key));
    }

    public remove(key: string) {
        return this._toObservable(this._storage.remove(key));
    }

    public length() {
        return this._toObservable(this._storage.length());
    }

    public keys() {
        return this._toObservable(this._storage.keys());
    }

    public forEach(iteratorCallback: (value: any, key: string, iterationNumber: number) => any) {
        return this._toObservable(this._storage.forEach(iteratorCallback));
    }

    public clearAllNotIncluding(text) {
        const keys = [];
        return this.forEach((v, k, index) => {
            if (!k.includes(text)) {
                keys.push(k);
            }
        }).pipe(
            tap(_ => {
                keys.forEach(key => {
                    this.remove(key).subscribe();
                });
            })
        );
    }

    public clearAll() {
        return this._toObservable(this._storage.clear());
    }

    public getKeys(keys: string[]) {
        keys = keys.map(k => k.toLowerCase());
        let data = [];
        return this.forEach((v, k, i) => {
            if (keys.includes(k.toLowerCase())) {
                data.push(v);
            }
        }).pipe(
            map(_ => data)
        );
    }

    private _toObservable(action) {
        return from(action).pipe(
            take(1),
            catchError(_ => of(null))
        );
    }
}
