import {Injectable} from '@angular/core';
import {CameraOptions, CameraPhoto, CameraResultType, Plugins} from '@capacitor/core';
import {from, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NativeCapabilitiesService {

    constructor() { }

    getPhoto(cameraOptions: CameraOptions): Observable<CameraPhoto> {
        return from(Plugins.Camera.getPhoto(cameraOptions)).pipe(
            take(1),
            map(image => {
                let webPath = image.webPath;
                if (!webPath) {
                    switch (cameraOptions.resultType) {
                        case CameraResultType.Base64:
                            webPath = `data:image/${image.format};base64,` + image.base64String;
                            break;
                        case CameraResultType.DataUrl:
                            webPath = image.dataUrl;
                            break;
                        case CameraResultType.Uri:
                            webPath = image.path;
                            break;
                    }
                }
                return {
                    ...image,
                    webPath: webPath
                };
            })
        );
    }
}
