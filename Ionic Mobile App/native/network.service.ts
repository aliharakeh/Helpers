import {Injectable} from '@angular/core';
import {Network} from '@ionic-native/network/ngx';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ToastController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    public isNetworkOn = true;
    public isOnlineTranslation = 'En ligne!';
    public isOfflineTranslation = 'Hors ligne!';
    public serviceUnavailable = 'Service non disponible hors connexion!';
    private disconnectionSub: Subscription;
    private connectionSub: Subscription;

    constructor(
        private network: Network,
        private toastCtrl: ToastController
    ) {}

    monitorNetworkStatus() {
        // watch network for a disconnection
        this.disconnectionSub = this.network.onDisconnect().pipe(
            tap(_ => {
                this.isNetworkOn = false;
                this.showNetworkNotification(this.isOfflineTranslation);
            })
        ).subscribe();

        // watch network for a connection
        this.connectionSub = this.network.onConnect().pipe(
            tap(_ => {
                this.isNetworkOn = true;
                this.showNetworkNotification(this.isOnlineTranslation);
            })
        ).subscribe();
    }

    showNetworkNotification(text) {
        this.toastCtrl.create({
            message: text,
            duration: 2000,
            cssClass: 'toastCss'
        }).then(t => t.present());
    }

    stopNetworkMonitoring() {
        if (this.disconnectionSub) {
            this.disconnectionSub.unsubscribe();
        }
        if (this.connectionSub) {
            this.connectionSub.unsubscribe();
        }
    }
}
