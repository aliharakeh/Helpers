import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  constructor(private translateService: TranslateService) {}

  setLang(lang: string) {
    this.translateService.use(lang)
  }

  getDir(reverse = false) {
    const isArabic = this.translateService.currentLang === 'ar';
    if (!reverse) return isArabic ? 'rtl' : 'ltr';
    return isArabic ? 'ltr' : 'rtl';
  }

  get(key: string) {
    return this.translateService.instant(key);
  }
}
