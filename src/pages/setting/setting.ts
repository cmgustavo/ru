import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { StorageService } from '../../providers/storage-service/storage-service';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  language: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private translate: TranslateService,
    private storage: StorageService
  ) {
    this.language = translate.currentLang;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  translateTo(lang: string) {
    this.language = lang;
    this.translate.use(lang);
    this.storage.setLanguage(lang);
  }

}
