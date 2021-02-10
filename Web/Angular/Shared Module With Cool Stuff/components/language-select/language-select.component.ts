import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-select',
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.scss']
})
export class LanguageSelectComponent {

  public lang = 'ar';

  constructor(private translateService: TranslateService) { }

  updateSiteLanguage(lang) {
    this.lang = lang;
    this.translateService.use(lang);
  }

}
