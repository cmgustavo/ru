import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import * as _ from "lodash";

@Component({
  selector: 'page-import',
  templateUrl: 'import.html',
})
export class ImportPage {
  private form: object = {
    wif: null
  };

  constructor(
    private wallet: WalletService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportPage');
  }

  import() {
    console.log(this.form);
    if (_.isEmpty(this.form)) return;
    this.wallet.importWallet(this.form['wif']);
    this.form['wif'] = null;
    let alert = this.alertCtrl.create({
      title: 'Import successful',
      subTitle: 'Your wallet has been imported correctly',
      buttons: [{
          text: 'OK',
          handler: () => {
            alert.dismiss().then(() => {
              this.navCtrl.setRoot(HomePage);
            });
            return false;
          }
        }]
    });
    alert.present();
  }

}
