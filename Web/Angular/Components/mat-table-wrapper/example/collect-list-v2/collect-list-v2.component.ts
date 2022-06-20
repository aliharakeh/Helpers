import {Component, OnDestroy, OnInit} from '@angular/core';
import {FilterModel} from '@app/suivi-collectes-module/models/filter.model';
import {DynamicHeader} from '@app/suivi-collectes-module/models/dynamique-header.model';
import {MouvementSurSiteModel} from '@app/suivi-collectes-module/models/mouvement-sur-site.model';
import {BehaviorSubject, combineLatest, of, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CalendarModel} from '@app/shared-module/models/start-end-date.model';
import {CollectStatService} from '@app/suivi-collectes-module/providers/collect-stat.service';
import {Utils} from '@app/shared-module/providers/Utils';
import {ClotureService} from '@app/suivi-collectes-module/providers/cloture.service';
import {ValidateService} from '@app/suivi-collectes-module/providers/validate.service';
import {FilterDataService} from '@app/suivi-collectes-module/providers/filter-data.service';
import {IconsService} from '@app/shared-module/providers/icons.service';
import {CalendarCustomService} from '@app/shared-module/providers/calendar-custom.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {FlyoutService} from '@app/shared-module/providers/flyout.service';
import {SearchBarService} from '@app/shared-module/providers/search-bar.service';
import {AppConfigService} from '@app/app-config.service';
import {AuthenticationService} from '@app/login-module/providers/authentication.service';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationDialogService} from '@app/shared-module/providers/confirmation-dialog.service';
import {SearchService} from '@app/shared-module/providers/searche.service';
import {NotificationService} from '@app/shared-module/providers/notification.service';
import {ActivatedRoute, Router} from '@angular/router';
import {WindowScrollingService} from '@app/shared-module/providers/window-scrolling.service';
import {DatePipe} from '@angular/common';
import {ToggleSidenavService} from '@app/structural-module/providers/toggle-sidenav.service';
import {SelectTypeCollectService} from '@app/shared-module/providers/select-type-collect.service';
import {PreviousRouteService} from '@app/shared-module/providers/previous-route.service';
import {MatDialog} from '@angular/material/dialog';
import {catchError, filter, finalize, mergeMap, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {CollectDetailsComponent} from '@app/suivi-collectes-module/collect-details/collect-details.component';
import {Status, StatusCollectAchievedImpl} from '@app/suivi-collectes-module/collect-list/status-collect-achieved.enum';
import {ProviderType} from '@app/admin-module/models/provider.model';
import {
    TypeHistorique,
    TypeHistoriqueGestionTiers
} from '@app/suivi-collectes-module/models/historique-prestation.model';
import {SendCollectModalComponent} from '@app/suivi-collectes-module/send-collect-modal/send-collect-modal.component';
import {ModifyDateModalComponent} from '@app/suivi-collectes-module/modify-date-modal/modify-date-modal.component';
import {
    ConfirmCollectModalComponent
} from '@app/suivi-collectes-module/confirm-collect-modal/confirm-collect-modal.component';
import {
    ValidateCollectModalComponent
} from '@app/suivi-collectes-module/validate-collect-modal/validate-collect-modal.component';
import {TableOptions} from '@app/suivi-collectes-module/mat-table-wrapper/mat-table-wrapper.component';
import {PreferencesService} from '@app/suivi-collectes-module/providers/preferences.service';
import {CollectService} from '@app/prestation/providers/collect.service';
import {TrinovConfigurationService} from '@app/admin-module/providers/trinov-configuration.service';
import {ValidateCollectsComponent} from '@app/suivi-collectes-module/validate-collects/validate-collects.component';
import {TrackdechetsService} from '@app/admin-module/providers/trackdechets.service';

class RequestModel {
    siteIds: Array<number>;
    query: string;
    etape: string;
    statutEtape: string;
    startDate: Date;
    endDate: Date;
    selectedTypeCollect: string;
    page: number;
    limit: number;
    filterValue: string;
    siteStatus: string;
    dechet: string;
}

@Component({
    selector: 'app-collect-list-v2',
    templateUrl: './collect-list-v2.component.html',
    styleUrls: ['./collect-list-v2.component.scss']
})
export class CollectListV2Component implements OnInit, OnDestroy {

    public collects;
    public isWaitBSD = true;
    public isWaitInfo = true;
    public isInfoReceived = true;
    public configDetails: any = false;
    public filter: FilterModel;
    public dynamicHeaders: Array<DynamicHeader> = [];

    private isDestroyed = false;
    private collectsBrut: Array<MouvementSurSiteModel> = [];
    public cachedData: Array<MouvementSurSiteModel> = [];

    idModal = 'validationModalGrid';
    idSendModal = 'sendModal';
    idConfirmCollectModal = 'confirmCollectModal';
    idModifyDatePrestationModal = 'modifyDatePrestationModal';
    selectedCollecte$: Subject<MouvementSurSiteModel> = new BehaviorSubject(null);

    closedHeaders = [];
    currentPopover = null;

    public step: string;
    public stepStatus: string;
    public isExternalProducer = false;

    icons = {
        WAIT_BSD: this.icon.get('fas', 'download'),
        WAIT_INFO: this.icon.get('fas', 'passeport'),
        check: this.icon.get('fas', 'check'),
        INFO_RECEIVED: this.icon.get('fas', 'filealt')
    };

    adrImgSrcs = ['']; // array of img srcs used to display ADR tags on edit-adr-modal component
    idDechet = 0; // waste id retrived from kit-document-popover component and sent to edit adr
    // modal component used in the request to download ADR tags
    isAdminPage = false;
    filterValue = null;
    showExternalCollects = false;
    showExternalCollectsLabel = 'PRESTATIONS.SUIVI.SHOW_EXTERNAL_COLLECTS';
    isInternal;
    adrForm: FormGroup;
    isAdrRadioActif = false;
    currentPage = 0;
    limit = 25;

    queue$: Subject<boolean> = new BehaviorSubject(true);
    queue: RequestModel[] = [];
    lastQuery: RequestModel = null;

    isRequestDataDone = true;
    startEndDate: CalendarModel;
    isScrolling = false;
    isLoading = false;
    showExternalButton = false;
    calendarIsActive = false;
    isSidenavCollapsed = false;
    selectedTypeProducteur: string = 'INTERN';
    config: any;
    query = null;
    dateParam = null;

    tableOptions: TableOptions;
    userPreferences: any;
    selection: MouvementSurSiteModel[] = [];
    closableCollections: MouvementSurSiteModel[] = [];
    validationCollections: MouvementSurSiteModel[] = [];
    statusColors: any;

    constructor(
        private readonly collectStatService: CollectStatService,
        public readonly utils: Utils,
        private readonly clotureService: ClotureService,
        private readonly validateService: ValidateService,
        private readonly filterService: FilterDataService,
        private readonly icon: IconsService,
        private readonly calendarCustomService: CalendarCustomService,
        private readonly ngxSpinnerService: NgxSpinnerService,
        private readonly flyoutService: FlyoutService,
        private readonly searchBarService: SearchBarService,
        private readonly appConfigService: AppConfigService,
        private readonly authService: AuthenticationService,
        private readonly translator: TranslateService,
        private readonly confirmeService: ConfirmationDialogService,
        private readonly searchService: SearchService,
        private readonly notificationService: NotificationService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly windowScrollingService: WindowScrollingService,
        private readonly fb: FormBuilder,
        private readonly datepipe: DatePipe,
        private readonly sidenavService: ToggleSidenavService,
        private readonly selectTypeCollect: SelectTypeCollectService,
        private readonly previousRouteService: PreviousRouteService,
        public dialog: MatDialog,
        private preferencesService: PreferencesService,
        private collectService: CollectService,
        private trinovConfig: TrinovConfigurationService,
        private trackdechetsService: TrackdechetsService
    ) { }

    ngOnInit(): void {
        this.trackdechetsService.getCountUnlinkTrackdechets(this.authService.getCurrentSiteIds()).pipe(
            filter((res: any) => res && res.success),
            tap((res) => {
                this.trackdechetsService.setBsdCount(res.result?.count);
            })
        ).subscribe();
        const advancedSearchConfig = this.appConfigService.getConfiguration()['advancedSearch'];
        const advancedSearchTab = advancedSearchConfig['tabConfigUrl'][this.router.url.split('/')[this.router.url.split('/').length - 1].split('?')[0]];
        this.searchBarService.showAdvancedSearch(true, advancedSearchTab, advancedSearchConfig);
        this.subscribeQueue();
        this.preferencesService.data$.pipe(
            takeWhile(() => !this.isDestroyed),
            tap(data => {
                this.tableOptions = data?.tableOptions;
                this.userPreferences = data?.userPreferences;
                this.statusColors = data?.statusColors;
            })
        ).subscribe();
        this.inisializeComponentCalendar();
        this.sidenavService.spyOnSidenavCollapse$
            .pipe(
                takeWhile(() => !this.isDestroyed),
                tap((res) => (this.isSidenavCollapsed = res))
            )
            .subscribe();
        this.showExternalButton = this.appConfigService
            .getConfiguration()
            .sitesMenu.displaySitesByStatus.includes('EXTERN');
        this.route.queryParamMap
            .pipe(
                takeWhile(() => !this.isDestroyed),
                filter(
                    (pramasAsMap: any) =>
                        pramasAsMap.params.id &&
                        pramasAsMap.params.step &&
                        pramasAsMap.params.numStep
                ),
                tap(() => this.flyoutService.displayFlyout(CollectDetailsComponent, {}))
            )
            .subscribe();
        this.route.queryParamMap
            .pipe(
                takeWhile(() => !this.isDestroyed),
                tap(
                    (paramsAsMap: any) => {
                        this.calendarIsActive = paramsAsMap.params?.isCalendar;
                        if (paramsAsMap.params?.query) {
                            this.query = paramsAsMap.params?.query;
                        }

                        this.startEndDate = paramsAsMap.params?.date;

                    }
                )
            )
            .subscribe();
        let varQuery = null;
        let varFilterValue = null;
        let varStartEndDate = null;
        let varTypeCollect = null;
        this.route.data
            .pipe(
                takeWhile(() => !this.isDestroyed),
                tap((data: any) => {
                    const step: string = data['step'];
                    const steps = step.split('/');
                    this.step = steps[0];
                    if (steps.length > 1) {
                        this.stepStatus = steps[1];
                    }
                    this.isAdminPage = data['isAdminPage'] ? data['isAdminPage'] : false;
                    this.config = this.appConfigService.getConfiguration();
                    this.dynamicHeaders = this.config[step].tableView;
                    this.filterService.setAvailableFilters(this.config[step].filters);
                    this.configDetails = this.config[step].configDetails;
                }),
                switchMap(() =>
                    combineLatest([
                        this.searchBarService.search$,
                        this.filterService.filter$,
                        this.calendarCustomService.startEndDateObs$,
                        this.selectTypeCollect.typeCollect$
                    ])
                ),
                // filter(() => !this.calendarIsActive),
                takeWhile(() => !this.isDestroyed),
                tap(([query, filterValue, startEndDate]) => {

                    if (query.length === 0) {
                        this.ngxSpinnerService.show();
                        this.windowScrollingService.disable();
                    }
                    if ((this.filterValue !== filterValue ||
                        this.startEndDate !== startEndDate ||
                        query.length > 2 ||
                        query.length === 0) && !this.isScrolling) {
                        this.cachedData = [];
                        this.currentPage = 0;
                    }

                    this.startEndDate = startEndDate;
                    this.filterValue = filterValue;
                    const sitesStatus = this.authService.getCurrentSiteStatus();
                    this.isInternal = false;
                    if (
                        sitesStatus.filter((SiteStatus) => SiteStatus === 'EXTERN')
                            .length !== 0
                    ) {
                        this.isExternalProducer = true;
                    }
                    else if (
                        sitesStatus.filter((SiteStatus) => SiteStatus === 'INTERN')
                            .length !== 0
                    ) {
                        this.isExternalProducer = false;
                        this.isInternal = true;
                    }
                    if (this.isLoading && this.currentPage > 0) {
                        this.currentPage -= 1;
                    }
                    this.isLoading = true;
                }),
                switchMap(
                    ([query, filterValue, startEndDate, typeCollect]: [
                        string,
                        FilterModel,
                        CalendarModel,
                        string
                    ]) => {
                        varQuery = query;
                        varFilterValue = filterValue;
                        varStartEndDate = startEndDate;
                        varTypeCollect = typeCollect;
                        return combineLatest([
                            this.isAdminPage
                                ? this.authService.availableSites$
                                : this.authService.currentSiteId$,
                            this.authService.currentSiteStatus$
                        ]);
                    }
                ),
                filter(([siteIds, siteStatus]: [number[], string[]]) => siteIds != null && siteStatus != null),
                tap(([siteIds, siteStatus]: [number[], string[]]) =>
                    this.push({
                        siteIds,
                        query: varQuery.length === 0 ? '' : varQuery,
                        etape: this.step,
                        statutEtape: this.stepStatus,
                        startDate: varStartEndDate.startDate,
                        endDate: varStartEndDate.endDate,
                        selectedTypeCollect: !this.isInternal ? 'ALL' : varTypeCollect,
                        page: this.currentPage,
                        limit: this.limit,
                        filterValue: varFilterValue.value,
                        siteStatus: siteStatus[0],
                        dechet: null
                    })
                )
            )
            .subscribe();
        this.flyoutService.spyOnCloseEvents$
            .pipe(
                takeWhile(() => !this.isDestroyed),
                tap((event) => {
                    this.router.navigate([this.router.url.split('?')[0]], {
                        relativeTo: this.route,
                        queryParams: {
                            id: null,
                            step: null,
                            numStep: null,
                            stepStatus: null,
                            showErrorOnRequiredField: null
                        },
                        queryParamsHandling: 'merge',
                        state: {
                            data: { collapsedNav: this.isSidenavCollapsed }
                        }
                    });
                    if (event.closeEvent.forceRefresh) {
                        this.refresh();
                    }
                })
            )
            .subscribe();
    }

    ngOnDestroy() {
        this.isDestroyed = true;
    }

    private push(query: RequestModel) {
        this.queue.push(query);
        this.queue$.next(true);
    }

    private pop() {
        if (this.queue.length > 1) {
            this.queue = this.queue.slice(0, 1);
        }
        else {
            this.queue = [];
        }
    }

    private subscribeQueue() {

        this.queue$.pipe(
            takeWhile(() => !this.isDestroyed),
            filter(() => this.queue && this.queue.length > 0),
            mergeMap(() => {
                const query = this.queue[0];
                this.pop();
                if (JSON.stringify(this.lastQuery) !== JSON.stringify(query)) {
                    this.lastQuery = query;
                    return this.searchService.searchPrestationValider(
                        query.siteIds,
                        query.query,
                        query.etape,
                        query.statutEtape,
                        query.startDate,
                        query.endDate,
                        query.selectedTypeCollect,
                        query.page,
                        query.limit,
                        query.filterValue,
                        query.siteStatus
                    );
                }
                else {
                    return of({});
                }
            }),
            tap((res: any) => {
                if (res && !res.success) {
                    this.isLoading = false;
                    this.isScrolling = false;
                    this.ngxSpinnerService.hide();
                    this.windowScrollingService.enable();
                }
            }),
            finalize(() => this.ngxSpinnerService.hide()),
            catchError((res) => {
                this.isLoading = false;
                this.isScrolling = false;
                this.ngxSpinnerService.hide();
                this.windowScrollingService.enable();
                return of({});
            }),
            filter((res) => res && res.success),
            tap((res: any) => {
                this.isRequestDataDone =
                    res.result.length < this.limit ? true : false;
                this.ngxSpinnerService.hide();
                this.windowScrollingService.enable();
                const currentSiteIds = this.authService.getCurrentSiteIds();
                res.result.map((collect) => {
                    collect.isExternal = !currentSiteIds.includes(collect.siteId);
                });
                this.isLoading = false;
                this.isScrolling = false;
                if (res.result.length) {
                    this.fillCollects(res.result);
                    this.cachedData = [...this.cachedData, ...res.result];
                    this.collectsBrut = this.cachedData;
                    this.collects = this.cachedData;
                    // this.collects = this.utils.groupBy(
                    //     this.collectsBrut,
                    //     this.filterValue.value,
                    //     this.filterValue.isDate
                    // );
                }
                else if (res.result.length === 0 && this.cachedData.length === 0) {
                    this.collects = [];
                }
                this.reInitFilterStatus();
            })
        ).subscribe();
    }

    inisializeComponentCalendar() {
        this.route.queryParamMap
            .pipe(
                takeWhile(() => !this.isDestroyed),
                tap(
                    (paramsAsMap: any) => {
                        if (paramsAsMap.params?.date) {
                            this.dateParam = paramsAsMap.params?.date;
                        }
                        else {
                            this.dateParam = null;
                        }

                    }
                )
            )
            .subscribe();

        const url = this.previousRouteService.getPreviousUrl();
        if (!['/suivi/collectes/collectes-en-attente',
            '/suivi/collectes/collectes-cloturees',
            '/suivi/collectes/collectes-realisees',
            '/suivi/collectes/collectes-planifiees',
            '/suivi/collectes/toutes-les-collectes',
            '/gestion-tiers/collectes-to-be-treated',
            '/gestion-tiers/collectes-to-be-confirmed',
            '/gestion-tiers/collectes-planned'].includes(url?.split('?')[0]) && this.route.snapshot.queryParamMap.get('typeCalendar') == null) {
            this.calendarCustomService.initialize(this.dateParam, this.userPreferences.defaultPeriod);
        }
    }

    fillCollects(collects: MouvementSurSiteModel[]) {
        collects.forEach((collect) => {
            collect.site =
                this.appConfigService.getConfiguration().siteName === 'NOM_COURANT'
                    ? collect.siteNomCourant
                    : collect.siteRaisonSocial;
            collect.status = collect.bsdDateRetour
                ? StatusCollectAchievedImpl.getStatus(Status.INFO_RECEIVED).type
                : StatusCollectAchievedImpl.getStatus(Status.WAIT_BSD).type;
            collect.statusText =
                'STATUS_COLLECT.' + ClotureService.getStatusText(collect);
            collect.iconsStatus = collect.bsdDateRetour
                ? StatusCollectAchievedImpl.getStatus(Status.INFO_RECEIVED).icon
                : StatusCollectAchievedImpl.getStatus(Status.WAIT_BSD).icon;
            const transporters = collect.prestataires
                .filter((p) => p.typePrestataire === ProviderType.TRANSPORTER)
                .sort((a, b) => a.ordre - b.ordre);
            const treatmentCenter = collect.prestataires
                .filter((p) => p.typePrestataire === ProviderType.TREATMENT_CENTER)
                .sort((a, b) => a.ordre - b.ordre);
            const generatedDocuments = collect.documentsCollecte?.filter(
                (d) => d.name != null
            );
            if (transporters && transporters.length > 0) {
                collect.transporteur = transporters[0].nom;
            }
            if (treatmentCenter && treatmentCenter.length > 0) {
                collect.centreTraitement = treatmentCenter[0].nom;
            }
            if (generatedDocuments && generatedDocuments.length > 0) {
                collect.generatedDocumentName = generatedDocuments[0].name;
            }
            const historique = collect.historique
                .filter((h) => h.type === TypeHistorique.GESTION_TIERS_CHANGE)
                .sort((a, b) => Number(a.date) - Number(b.date))
                .map((h) => {
                    return {
                        id: h.id,
                        date: h.date,
                        type: h.type,
                        valeur: JSON.parse(h.valeur),
                        idMouvementSurSite: h.idMouvementSurSite
                    };
                })
                .filter((h) => h.valeur != null);
            collect.gestionTiersInfo = {
                dateAsked:
                    historique.length !== 0 ? historique[0].valeur.oldDate : null,
                emailSentDate:
                    historique.findIndex(
                        (h) => h.valeur.type === TypeHistoriqueGestionTiers.SENT
                    ) !== -1
                        ? historique.find(
                            (h) => h.valeur.type === TypeHistoriqueGestionTiers.SENT
                        ).date
                        : null
            };
        });
    }

    openDocumentPopover(popover) {
        this.currentPopover = popover;
        if (this.currentPopover != null) {
            this.currentPopover.open();
            this.windowScrollingService.disable();
        }
    }

    closeDocumentPopover() {
        if (this.currentPopover !== null) {
            this.currentPopover.close();
            this.windowScrollingService.enable();
        }
    }


    send(collect) {
        Utils.openDialog(this.dialog, SendCollectModalComponent, {
            selectedCollecte: collect
        }, () => this.refresh());
    }

    modifyDatePrestation(collect) {
        Utils.openDialog(this.dialog, ModifyDateModalComponent, {
            selectedCollecte: collect
        }, () => this.refresh());
    }

    confirmPlannification(collect) {
        Utils.openDialog(this.dialog, ConfirmCollectModalComponent, {
            selectedCollecte: collect
        }, () => this.refresh());
    }

    confirmeDailogCloturer(collect) {
        if (!this.clotureService.checkIfCollectCanBeConfirmed(collect)) {
            this.openDetails(collect, true);
        }
        else {
            this.confirmeService
                .confirm(
                    this.translator.instant('CONFIRMATIONDIALOG.TITLE_CLOTURER'),
                    this.translator.instant('CONFIRMATIONDIALOG.MESSAGE_CLOTURER'),
                    this.translator.instant('CONFIRMATIONDIALOG.OK'),
                    this.translator.instant('CONFIRMATIONDIALOG.CANCEL'),
                    'sm',
                    'center',
                    'center',
                    'primary'
                )
                .then((confirmed) => {
                    if (confirmed) {
                        this.toCloturer([collect.id]);
                    }
                })
                .catch(() => { });
        }
    }

    toCloturer(idMouvementPrestations: number[]) {
        this.collectStatService
            .setCompleteCollect(idMouvementPrestations)
            .pipe(
                take(1),
                tap(() => {
                    this.notificationService.showNotification({
                        message: 'NOTIFICATION.COLLECT_CLOTUER_ADD_SUCCESS',
                        type: 'success'
                    });
                    this.refresh();
                })
            )
            .subscribe();
    }

    onCheckFilter(nameBoolean: string) {
        this[nameBoolean] = !this[nameBoolean];
    }

    filterBy() {
        const statusFilter = [];
        if (this.isWaitBSD) {
            statusFilter.push(StatusCollectAchievedImpl.getStatus(Status.WAIT_BSD));
        }
        if (this.isWaitInfo) {
            statusFilter.push(StatusCollectAchievedImpl.getStatus(Status.WAIT_INFO));
        }
        if (this.isInfoReceived) {
            statusFilter.push(
                StatusCollectAchievedImpl.getStatus(Status.INFO_RECEIVED)
            );
        }
        const collectsBrutFilter = this.collectsBrut.filter((collect) =>
            statusFilter.map((d) => d.type).includes(collect.status)
        );
        this.collects = this.utils.groupBy(
            collectsBrutFilter,
            this.filter.value,
            this.filter.isDate
        );
    }

    reInitFilterStatus() {
        this.isWaitBSD = this.isWaitInfo = this.isInfoReceived = true;
    }

    onOpenValidationModal(collect: MouvementSurSiteModel) {
        if (!this.validateService.checkIfCollectCanBeValidate(collect)) {
            this.openDetails(collect, true);
        }
        else {
            Utils.openDialog(this.dialog, ValidateCollectModalComponent, {
                selectedCollecte: collect
            }, () => this.refresh());
        }
    }

    refresh(concatenateData = false) {
        if (!concatenateData) {
            this.cachedData = [];
            this.lastQuery = null;
            this.currentPage = 0;
        }
        this.searchBarService.search$
            .pipe(
                take(1),
                tap((search) => this.searchBarService.setSearchQuery(search))
            )
            .subscribe();
    }

    openDetails(prestation, showErrorOnRequiredField = false) {
        let queryParams: any;
        if (this.configDetails.isGenericStep) {
            queryParams = {
                id: prestation.id,
                step: this.step,
                numStep: this.config[prestation.etape].configDetails.numStep
            };
        }
        else {
            queryParams = {
                id: prestation.id,
                step: this.step,
                numStep: this.configDetails.numStep
            };
        }
        if (this.stepStatus != null) {
            queryParams = { ...queryParams, stepStatus: this.stepStatus };
        }
        if (showErrorOnRequiredField) {
            queryParams = { ...queryParams, showErrorOnRequiredField: true };
        }
        this.router.navigate([Utils.getUrlWithoutParams(this.router.url)], {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
            state: {
                data: { collapsedNav: this.isSidenavCollapsed }
            }
        });
    }

    isDisabledButtonCloturer(collect) {
        return (
            !collect.bsdTransportFileName ||
            collect.poidsReel == null ||
            collect.poidsReel === 0 ||
            collect.poidsReel === undefined
        );
    }

    onAdrWaste(srcs) {
        this.adrImgSrcs = srcs;
    }

    onAdrChange(formData) {
        this.adrForm = formData;
    }

    onIdDechet(id) {
        this.idDechet = id;
    }

    onAdrRadioActif(event) {
        this.isAdrRadioActif = event;
    }

    public getValue(obj: any, props: string[]): any {
        return Utils.getValue(obj, props);
    }

    onScroll() {
        if (!this.isRequestDataDone) {
            this.isScrolling = true;
            this.ngxSpinnerService.hide();
            this.currentPage++;
            this.refresh(true);
            this.windowScrollingService.disable();
        }
    }

    getLabel(columnDef: string) {
        return this.tableOptions.columns.find(c => c.columnDef === columnDef).label;
    }

    getWidth(columnDef: string) {
        return this.tableOptions.columns.find(c => c.columnDef === columnDef).width;
    }

    showActionBtn(data) {
        return ['PLANNIFIEE', 'COLLECTE'].includes(data.etape);
    }

    handleActionBtn(collect) {
        switch (collect.etape) {
            case 'PLANNIFIEE':
                this.onOpenValidationModal(collect);
                break;
            case 'COLLECTE':
                this.confirmeDailogCloturer(collect);
                break;
            default:
                break;
        }
    }

    getActionBtnLabel(collect) {
        switch (collect.etape) {
            case 'PLANNIFIEE':
                return 'PRESTATIONS.SUIVI.VALIDATE';
            case 'COLLECTE':
                return 'PRESTATIONS.SUIVI.CLOSE';
            default:
                return '';
        }
    }

    updateWeight(collecte: MouvementSurSiteModel) {
        this.collectService.updatePoidReel(collecte.id, collecte.poidsReel).subscribe();
    }

    getStatusColor(data) {
        return this.userPreferences[data.etape].statusColor;
    }

    onSelectionChange(selection: MouvementSurSiteModel[]) {
        this.selection = selection;
        this.validationCollections = [];
        this.closableCollections = [];
        if (['TOUTES', 'PLANNIFIEE'].includes(this.step)) {
            this.validationCollections = selection.filter(c => c.etape === 'PLANNIFIEE');
        }
        if (['TOUTES', 'COLLECTE'].includes(this.step)) {
            this.closableCollections = selection.filter(c => c.etape === 'COLLECTE');
        }
    }

    validateCollections(quickMode) {
        const validCollections = this.validationCollections.filter(c => this.validateService.checkIfCollectCanBeValidate(c));
        const dialog = this.dialog.open(ValidateCollectsComponent, {
            data: {
                quickMode,
                collections: validCollections,
                nonValidCount: this.validationCollections.length - validCollections.length
            },
            width: '40%'
        });

        dialog.afterClosed().pipe(
            tap(res => {
                if (res) {
                    const ids = this.validationCollections.map(c => c.id);
                    this.selection = this.selection.filter(c => !ids.includes(c.id));
                    this.validationCollections = [];
                    this.refresh();
                }
            })
        ).subscribe();
    }

    closeSelectionCollections() {
        const validCollections = this.closableCollections.filter(c => this.clotureService.checkIfCollectCanBeConfirmed(c));
        this.confirmeService
            .confirm(
                this.translator.instant('CONFIRMATIONDIALOG.TITLE_CLOTURER'),
                `
                <div class="bold">
                    <div>
                        ${this.translator.instant('PRESTATIONS.SUIVI.MULTI_SELECTION.CLOSE_CONFIRM')}
                    </div>
                    <div class="mt-2 text-primary">
                        ${this.translator.instant('PRESTATIONS.SUIVI.MULTI_SELECTION.CLOSE_COUNT', { count: validCollections.length })}
                    </div>
                    <div class="mt-1 text-danger" *ngIf="data.nonValidCount > 0">
                         ${this.translator.instant('PRESTATIONS.SUIVI.MULTI_SELECTION.CLOSE_ERROR_COUNT', { count: this.closableCollections.length - validCollections.length })}
                    </div>
                </div>
                `,
                this.translator.instant('CONFIRMATIONDIALOG.OK'),
                this.translator.instant('CONFIRMATIONDIALOG.CANCEL'),
                'md',
                'center',
                'start',
                'primary'
            )
            .then((confirmed) => {
                if (confirmed && validCollections.length > 0) {
                    const ids = validCollections.map(c => c.id);
                    this.selection = this.selection.filter(c => !ids.includes(c.id));
                    this.closableCollections = [];
                    this.toCloturer(ids);
                    this.refresh();
                }
            })
            .catch(() => { });
    }
}
