import {Injectable} from '@angular/core';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {LocationAccuracy} from '@ionic-native/location-accuracy/ngx';
import {Geolocation, GeolocationOptions} from '@ionic-native/geolocation/ngx';
import {from, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {

    constructor(
        private androidPermissions: AndroidPermissions,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy
    ) {}

    checkGPSPermission() {
        return from(this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION))
            .pipe(
                switchMap((result: any) => {
                    if (result.hasPermission) {
                        return this.askToTurnOnGPS();
                    }
                    else {
                        return this.requestGPSPermission();
                    }
                })
            );
    }

    requestGPSPermission() {
        return from(this.locationAccuracy.canRequest()).pipe(
            switchMap((canRequest: boolean) => {
                if (canRequest) {
                    return of(canRequest);
                }
                else {
                    return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
                }
            }),
            switchMap(_ => {
                return this.askToTurnOnGPS();
            })
        );
    }

    askToTurnOnGPS() {
        return from(this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY));
    }

    getCurrentLocation(options?: GeolocationOptions) {
        return from(this.geolocation.getCurrentPosition(options));
    }
}
