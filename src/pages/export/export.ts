import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Logger } from '@nsalaun/ng-logger';
import * as _ from "lodash";

@Component({
  selector: 'page-export',
  templateUrl: 'export.html',
})
export class ExportPage {
  private form: object = {
    wif: null
  };

  constructor(
    private socialSharing: SocialSharing,
    private wallet: WalletService,
    private logger: Logger,
    public plt: Platform,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.form['wif'] = this.wallet.get()['wif'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExportPage');
  }

  export() {
    if (_.isEmpty(this.form['wif'])) return;
    if (this.plt.is('cordova')) {
      this.socialSharing.share(this.form['wif']).then(() => {
        this.logger.log('Success!');
      }).catch(() => {
        this.logger.log('Error');
      });
    }
  }

}
