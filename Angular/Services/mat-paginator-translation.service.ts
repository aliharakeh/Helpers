import { Injectable } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslatorService } from './translator.service';

@Injectable({
  providedIn: 'root'
})
export class MatPaginatorTranslationService {

  constructor(private translator: TranslatorService) {}

  updateTranslation(paginator: MatPaginator, translationKey: string) {
    // create new paginator labels
    const newPaginatorLabels = new MatPaginatorIntl();

    newPaginatorLabels.getRangeLabel = (page, pageSize, length) => {
      const pageStart = page * pageSize;

      const isLastPage = length - pageStart <= pageSize;
      const pageEnd = isLastPage ? length : pageStart + pageSize;

      const ofTranslation = this.translator.get(`${translationKey}.Of`);

      return pageStart + '-' + pageEnd + ' ' + ofTranslation + ' ' + length;
    };

    newPaginatorLabels.itemsPerPageLabel = this.translator.get(`${translationKey}.ItemsPerPageLabel`);

    newPaginatorLabels.nextPageLabel = this.translator.get(`${translationKey}.NextPageLabel`);

    newPaginatorLabels.previousPageLabel = this.translator.get(`${translationKey}.PreviousPageLabel`);

    newPaginatorLabels.firstPageLabel = this.translator.get(`${translationKey}.FirstPageLabel`);

    newPaginatorLabels.lastPageLabel = this.translator.get(`${translationKey}.LastPageLabel`);

    // update paginator
    paginator._intl = newPaginatorLabels;
  }
}
