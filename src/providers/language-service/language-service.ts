import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from '../../providers/config-service/config-service';

@Injectable()
export class LanguageService {
  public availables: Array<Object> = [
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
    private logger: Logger,
    private events: Events,
    private translate: TranslateService,
    private config: ConfigService
  ) {
    console.log('LanguageService initialized.');
  }

  load() {
    return new Promise((resolve, reject) => {
      // Default browser language
      let languages: Array<string> = [];
      for (let lang of this.availables) {
        languages.push(lang['isoCode']);
      }
      this.translate.addLangs(languages);
      this.current = this.translate.getBrowserLang();
      this.config.load().then((config) => {
        this.current = config['language'] || this.current;
        this.translate.setDefaultLang(this.current);
        resolve(true);
      });
    });
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
