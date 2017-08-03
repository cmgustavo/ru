import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { LanguageService } from '../../providers/language-service/language-service';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  currentLanguage: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private language: LanguageService
  ) {
    this.currentLanguage = this.language.current;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  translateTo(lang: string) {
    this.currentLanguage = lang;
    this.language.set(lang);
  }

}
