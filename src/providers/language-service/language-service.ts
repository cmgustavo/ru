import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from '../../providers/config-service/config-service';

@Injectable()
export class LanguageService {
  public available: Array<Object> = [
    {
      name: 'English',
      isoCode: 'en'
    },
    {
      name: 'Español',
      isoCode: 'es'
    }
  ];
  public current: string;

  constructor(
    private translate: TranslateService,
    private config: ConfigService
  ) {
    console.log('LanguageService initialized.');

    // Default browser language
    let languages: Array<string> = [];
    for (let lang of this.available) {
      languages.push(lang['isoCode']);
    }
    this.translate.addLangs(languages);
  }

  init(lang: string) {
    this.current = lang || this.translate.getBrowserLang();
    this.translate.setDefaultLang(this.current);
  }

  set(lang: string) {
    this.current = lang;
    this.translate.use(lang);
    this.config.set({language: lang});
  }

  get() {
    return this.current;
  }

}
