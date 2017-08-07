import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { Clipboard } from '@ionic-native/clipboard';
import { Toast } from '@ionic-native/toast';
import { LoadingController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { TranslateService } from '@ngx-translate/core';
import { ActionsPage } from '../actions/actions';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
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
    public events: Events,
    public popoverCtrl: PopoverController,
    private logger: Logger,
    private barcodeScanner: BarcodeScanner,
    private toast: Toast,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private wallet: WalletService,
    private blockchain: BlockchainService,
  ) {
    this.isCordova = this.plt.is('cordova') ? true : false;
    this.events.subscribe('wallet:updated', () => {
      // TODO
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.wallet.init().then((wallet) => {
      this.address = wallet['address'];
      this.updateBalance();
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
      this.balance = data.balance + data.unconfirmedBalance;
      this.balanceSat = data.balanceSat + data.unconfirmedBalanceSat;
      setTimeout(() => {
        this.updatingBalance = false;
        loading.dismiss();
      }, 1000);
    });
  }

  createWallet() {
    this.wallet.createWallet();
    this.address = this.wallet.get()['address'];
    this.updateBalance();
  }

  copyToClipboard(data: string) {
    if (this.isCordova) {
      this.clipboard.copy(data);
      this.toast.show("Copied to clipboard", 'short', 'bottom').subscribe(
        toast => {
          this.logger.log('Success', toast);
        },
        error => {
          this.logger.log('Error', error);
        },
        () => {
          this.logger.log('Completed');
        }
      );
    }
  }

  shareAddress(data: string) {
    if (this.plt.is('cordova')) {
      this.socialSharing.share('My bitcoin address is: ' + data, 'My bitcoin address').then(() => {
        this.logger.log('Success!');
      }).catch(() => {
        this.logger.log('Error');
      });
    }
  }

  confirmNewWallet() {
    let confirm = this.alertCtrl.create({
      title: 'Create new wallet',
      message: 'Are you sure you want to remove this wallet and create a new one?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.createWallet();
          }
        }
      ]
    });
    confirm.present();
  }

  confirmSendAll() {
    let confirm = this.alertCtrl.create({
      title: 'Send all funds',
      message: 'Are you sure you want to send all your funds from this wallet?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.sendAll();
          }
        }
      ]
    });
    confirm.present();
  }

  showWalletActions(myEvent) {
    let popover = this.popoverCtrl.create(ActionsPage);
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss((data, role) => {
      switch(data) {
        case 'new': {
          this.confirmNewWallet();
          break;
        }
        case 'send': {
          this.confirmSendAll();
          break;
        }
        default: {
          // Nothing
          break;
        }
      }
    });
  }

  showAddressActions(data: string) {
    let buttons = [];
    buttons.push(
      {
        text: 'Cancel',
        role: 'cancel'
      }
    );
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
      title: 'Bitcoin address',
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
