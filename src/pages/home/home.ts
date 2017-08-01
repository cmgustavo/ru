import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Toast } from '@ionic-native/toast';
import { LoadingController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';
import { StorageService } from '../../providers/storage-service/storage-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [WalletService, BlockchainService, StorageService]
})
export class HomePage {
  wif: string;
  address: string;
  isCordova: boolean;
  balance: number;
  balanceSat: number;
  updatingBalance: boolean;

  constructor(
    public navCtrl: NavController,
    public plt: Platform,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private barcodeScanner: BarcodeScanner,
    private toast: Toast,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private storage: StorageService,
    private wallet: WalletService,
    private blockchain: BlockchainService
  ) {
    this.isCordova = this.plt.is('cordova') ? true : false;
  }

  ionViewDidLoad() {
    this.storage.getWif().then((wif) => {
      if (wif) {
        this.wif = wif;
        this.wallet.importAddress(wif);
        this.address = this.wallet.address;
      } else {
        this.wallet.createAddress();
        this.address = this.wallet.address;
        this.wif = this.wallet.wif;
        this.storage.setData(this.wallet.wif, this.wallet.address);
      }
      setTimeout(() => {
        this.updateBalance();
      }, 500);
    });
  }

  updateBalance() {
    let loading;
    this.translate.get('Please wait...').subscribe((res: string) => {
      loading = this.loadingCtrl.create({
        content: res
      });
    });
    this.updatingBalance = true;
    loading.present();
    this.blockchain.getAddressInfo(this.address).map(res => res.json()).subscribe(data => {
      this.updatingBalance = false;
      this.balance = data.balance + data.unconfirmedBalance;
      this.balanceSat = data.balanceSat + data.unconfirmedBalanceSat;
      setTimeout(() => {
        loading.dismiss();
      }, 1000);
    });
  }

  reCreateAddress() {
    console.log('Deleting address...');
    this.storage.clearData().then(() => {
      this.wallet.createAddress();
      this.address = this.wallet.address;
      this.wif = this.wallet.wif;
      this.storage.setData(this.wallet.wif, this.wallet.address);
    });
  }

  copyToClipboard(data: string) {
    if (this.isCordova) {
      this.clipboard.copy(data);
      this.toast.show("Copied to clipboard", 'short', 'bottom').subscribe(
        toast => {
          console.log('Success', toast);
        },
        error => {
          console.log('Error', error);
        },
        () => {
          console.log('Completed');
        }
      );
    }
  }

  shareAddress(data: string) {
    if (this.plt.is('cordova')) {
      this.socialSharing.share('My bitcoin address is: ' + data, 'My bitcoin address').then(() => {
        console.log('Success!');
      }).catch(() => {
        console.log('Error');
      });
    }
  }

  newAddress() {
    let confirm = this.alertCtrl.create({
      title: 'Create new address',
      message: 'Are you sure you want to remove current address?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.reCreateAddress();
          }
        }
      ]
    });
    confirm.present();
  }

  showOptions(data: string) {
    let buttons = [];
    buttons.push(
      {
        text: 'New address',
        role: 'destructive',
        handler: () => {
          this.newAddress();
        }
      }, {
        text: 'Cancel',
        role: 'cancel'
      }
    );
    if (this.balanceSat > 0) {
      buttons.push(
        {
          text: 'Send all',
          handler: () => {
            this.sendAll();
          }
        }
      );
    }
    if (this.isCordova) {
      buttons.push(
        {
          text: 'Copy',
          handler: () => {
            this.copyToClipboard(data);
          }
        }, {
          text: 'Share...',
          handler: () => {
            this.shareAddress(data);
          }
        }
      );
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Options',
      buttons: buttons
    });
    actionSheet.present();
  }

  sendAll() {

    if (this.isCordova) {
      this.barcodeScanner.scan().then((barcodeData) => {
        this.wallet.sendTransaction(this.wif, barcodeData.text, this.balanceSat);
      }, (err) => {
        console.log(err);
      });
    } else {
      let prompt = this.alertCtrl.create({
        title: 'Send to',
        inputs: [
          {
            name: 'address',
            placeholder: 'Bitcoin address'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'OK',
            handler: data => {
              this.wallet.sendTransaction(this.wif, data.address, this.balanceSat);
            }
          }
        ]
      });
      prompt.present();
    }
  }


}
