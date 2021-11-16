import {Component, Input, OnInit} from '@angular/core';
import {finalize, switchMap, take, tap} from 'rxjs/operators';
import {
    CollectionDetailsData,
    MouvementSurSiteModel,
    TypeHistorique
} from '@app/pages/collections-details/models/collection-details.models';
import {CollectionsDetailsService} from '@app/pages/collections-details/providers/collections-details.service';
import {NativeCapabilitiesService} from '../../providers/native/native-capabilities.service';
import {DocumentsService} from '../../providers/collections/documents.service';
import {UtilsService} from '../../providers/utils/utils.service';
import {CameraPhoto, CameraResultType} from '@capacitor/core';
import {environment} from '@environments/environment';
import {CollectionValidationService} from '../../providers/collections/collection-validation.service';
import {HomeService} from '@app/pages/main/tabs/home/providers/home.service';
import {ModalController} from '@ionic/angular';
import {CollectionValidation} from '@app/shared/models/collection-validation.model';
import {of} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-collection-validation',
    templateUrl: './collection-validation.component.html',
    styleUrls: ['./collection-validation.component.scss']
})
export class CollectionValidationComponent implements OnInit {
    public readonly CameraPhotoConfig = environment.COLLECTION_VALIDATION;
    public loading = false;
    public validating = false;
    public images: CameraPhoto[] = [];
    public collectionsToValidate: {
        selected: boolean;
        waste: string;
        material: string;
        validationData: CollectionValidation
    }[] = [];
    public addComment = false;
    public addAnomaly = false;
    public comment: any;
    public anomaly: any;
    public anomalyType: string;

    @Input() collectionId: number;
    public collectionDate: Date;
    public realizedDate: Date = new Date();

    constructor(
        private collectionDetailsService: CollectionsDetailsService,
        private collectionValidationService: CollectionValidationService,
        private documentsService: DocumentsService,
        private homeService: HomeService,
        private nativeCapabilities: NativeCapabilitiesService,
        private modalCtrl: ModalController,
        public utils: UtilsService,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.loading = true;
        this.collectionDetailsService.getCollectionDetails(this.collectionId, false).pipe(
            take(1),
            switchMap((collectionDetailsData: CollectionDetailsData) => {
                const details = collectionDetailsData.collectionDetails;
                this.collectionDate = new Date(details.datePrestation);
                this.collectionsToValidate.push({
                    selected: true,
                    waste: details.dechet,
                    material: details.materiel,
                    validationData: {
                        id: details.id,
                        quantite: details.nombreColis,
                        poids: details.poidsEstime,
                        date: null,
                        materielStockId: details.materielStockIds,
                        prestationReferenceId: details.prestationReferenceId,
                        siteId: details.siteId
                    }
                });
                if (details.mutualisationId) {
                    return this.collectionValidationService.getMutualCollections(details.mutualisationId, details.id);
                }
                return of([]);
            }),
            tap((mutualCollections: MouvementSurSiteModel[]) => {
                mutualCollections.forEach(details => {
                    this.collectionsToValidate.push({
                        selected: true,
                        waste: details.dechet,
                        material: details.materiel,
                        validationData: {
                            id: details.id,
                            quantite: details.nombreColis,
                            poids: details.poidsEstime,
                            date: null,
                            materielStockId: details.materielStockIds,
                            prestationReferenceId: details.prestationReferenceId,
                            siteId: details.siteId
                        }
                    });
                });
            }),
            finalize(() => this.loading = false)
        ).subscribe();
    }

    getTodayDate() {
        return new Date();
    }

    takeOrGetAPhoto() {
        this.nativeCapabilities.getPhoto({
            quality: this.CameraPhotoConfig.QUALITY,
            width: this.CameraPhotoConfig.WIDTH,
            height: this.CameraPhotoConfig.HEIGHT,
            resultType: CameraResultType.Base64,
            promptLabelPhoto: this.translate.instant('CAMERA.PHOTO'),
            promptLabelPicture: this.translate.instant('CAMERA.PICTURE')
        }).pipe(
            take(1),
            tap(image => {
                this.images.push(image);
            })
        ).subscribe();
    }

    removeImage(imageIndex) {
        this.images = this.images.filter((_, index) => index !== imageIndex);
    }

    uploadImage(id, image: CameraPhoto, fileName: string) {
        fileName = fileName + '.' + image.format;
        return this.documentsService.uploadDocument(
            new File([this.utils.base64ToBlob(image.base64String, 'image/' + image.format)], fileName),
            id,
            'COLLECT-' + id + '/PHOTOS',
            fileName,
            'TfMouvementSurSite',
            ['photosPathJson']
        );
    }

    cantValidate() {
        return this.collectionsToValidate.filter(c => c.selected).length === 0;
    }

    validateCollection() {
        this.validating = true;
        const collections = this.collectionsToValidate.filter(c => c.selected).map(c => {
            return {
                id: c.validationData.id,
                quantite: c.validationData.quantite,
                poids: c.validationData.poids,
                date: this.realizedDate.getTime(),
                materielStockId: c.validationData.materielStockId,
                prestationReferenceId: c.validationData.prestationReferenceId,
                siteId: c.validationData.siteId
            };
        });
        this.collectionValidationService.validateCollection(collections).pipe(
            tap(_ => {
                collections.forEach(c => {
                    if (!!this.comment) {
                        this.collectionDetailsService.addLog(c.id, TypeHistorique.COMMENT, this.comment).subscribe();
                    }

                    if (!!this.anomalyType && !!this.anomaly) {
                        this.collectionDetailsService.addLog(c.id, TypeHistorique.ANOMALIE, JSON.stringify({
                            comment: this.anomaly,
                            type: this.anomalyType
                        })).subscribe();
                    }

                    this.images.forEach((image, index) => {
                        this.uploadImage(c.id, image, 'collection_photo_' + index).subscribe();
                    });
                });
            }),
            switchMap(_ => {
                return this.homeService.reloadCollections();
            }),
            tap(_ => {
                this.validating = false;
                this.modalCtrl.dismiss(true);
            })
        ).subscribe();
    }
}
