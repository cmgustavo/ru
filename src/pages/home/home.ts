import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import { StorageService } from '../../providers/storage-service/storage-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [WalletService]
})
export class HomePage {
  address: string;

  constructor(
    public navCtrl: NavController,
    private storage: StorageService,
    private wallet: WalletService) {}

  ionViewDidLoad() {
    this.storage.getWif().then((wif) => {
      if (wif) {
        this.wallet.importAddress(wif);
        this.address = this.wallet.address;
      } else {
        this.wallet.createAddress();
        this.address = this.wallet.address;
        this.storage.setData(this.wallet.wif, this.wallet.address);
      }
    });
  }


}
