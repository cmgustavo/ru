import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { HomePage } from '../home/home';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import * as _ from "lodash";

@Component({
  selector: 'page-import',
  templateUrl: 'import.html',
})
export class ImportPage {
  private isCordova: boolean;
  private form: object = {
    wif: null
  };

  constructor(
    private barcodeScanner: BarcodeScanner,
    private wallet: WalletService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public plt: Platform
  ) {
    this.isCordova = this.plt.is('cordova') ? true : false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportPage');
  }

  import() {
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

  scanQR() {
    this.barcodeScanner.scan().then((barcodeData) => {
      this.form['wif'] = barcodeData.text;
    }, (err) => {
      console.log(err);
    });
  }

}
