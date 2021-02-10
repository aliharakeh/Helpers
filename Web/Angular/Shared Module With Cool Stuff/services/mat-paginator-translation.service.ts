import {Injectable} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MatPaginatorTranslationService {

  constructor(private translateService: TranslateService) {}

  updateTranslation(paginator: MatPaginator, translationKey: string) {
    paginator._intl.getRangeLabel = (page, pageSize, length) => {
      const pageStart = page * pageSize;
      const pageEnd = pageStart + pageSize;
      const ofTranslation = this.translateService.instant(`${translationKey}.Of`);
      return pageStart + '-' + pageEnd + ' ' + ofTranslation + ' ' + length;
    };
    paginator._intl.itemsPerPageLabel = this.translateService.instant(`${translationKey}.ItemsPerPageLabel`);
    paginator._intl.nextPageLabel = this.translateService.instant(`${translationKey}.NextPageLabel`);
    paginator._intl.previousPageLabel = this.translateService.instant(`${translationKey}.PreviousPageLabel`);
    paginator._intl.firstPageLabel = this.translateService.instant(`${translationKey}.FirstPageLabel`);
    paginator._intl.lastPageLabel = this.translateService.instant(`${translationKey}.LastPageLabel`);
  }
}
