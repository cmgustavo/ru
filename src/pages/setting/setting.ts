import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { LanguageService } from '../../providers/language-service/language-service';
import { ConfigService } from '../../providers/config-service/config-service';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  isLivenet: boolean;
  availableLanguages: Array<Object>;
  currentLanguage: string;
  selectedFeeLevel: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private language: LanguageService,
    private config: ConfigService
  ) {
    let cnf = this.config.get();

    this.availableLanguages = this.language.availables;
    this.currentLanguage = this.language.current;
    this.selectedFeeLevel = cnf['feeLevel'];
    console.log('[setting.ts:27]',this.selectedFeeLevel); //TODO
    if (cnf && cnf['network'] == 'livenet') {
      this.isLivenet = true;
    } else {
      this.isLivenet = false;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  translateTo(lang: string) {
    this.currentLanguage = lang;
    this.language.set(lang);
  }

  toggleNetwork() {
    let currentNetwork = this.isLivenet ? 'livenet' : 'testnet';
    this.config.set({ network: currentNetwork });
  }

  setFeeLevel() {
    this.config.set({ feeLevel: this.selectedFeeLevel });
  }

}
