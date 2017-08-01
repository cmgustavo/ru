import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  language: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private translate: TranslateService
  ) {
    this.language = translate.currentLang;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  translateTo(language: string) {
    this.translate.use(language);
  }

}
