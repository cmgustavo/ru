import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { LanguageService } from '../../providers/language-service/language-service';
import { ConfigService } from '../../providers/config-service/config-service';
import { WalletService } from '../../providers/wallet-service/wallet-service';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  isLivenet: boolean;
  availableLanguages: Array<Object>;
  currentLanguage: string;
  selectedFeeLevel: string;
  walletName: string;

  constructor(
    public alertCtrl: AlertController,
    private language: LanguageService,
    private config: ConfigService,
    private wallet: WalletService
  ) {
    let cnf = this.config.get();

    this.walletName = this.wallet.get()['name'];
    this.availableLanguages = this.language.availables;
    this.currentLanguage = this.language.current;
    this.selectedFeeLevel = cnf['feeLevel'];
    if (cnf && cnf['network'] == 'livenet') {
      this.isLivenet = true;
    } else {
      this.isLivenet = false;
    }
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

  setWalletName() {
    let alert = this.alertCtrl.create({
      title: 'Wallet name',
      inputs: [
        {
          name: 'name',
          placeholder: 'My saving wallet',
          value: this.walletName,
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: data => {
            if (data && data.name) {
              this.wallet.setWalletName(data.name);
              this.walletName = data.name;
            }
          }
        }
      ]
    });
    alert.present();
  }

}
