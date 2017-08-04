import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WalletService } from '../../providers/wallet-service/wallet-service';

@Component({
  selector: 'page-export',
  templateUrl: 'export.html',
})
export class ExportPage {
  private form: object = {
    wif: null
  };

  constructor(
    private wallet: WalletService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.form['wif'] = this.wallet.get()['wif'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExportPage');
  }

  export() {
    // TODO
  }

}
