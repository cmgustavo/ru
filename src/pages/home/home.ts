import { Component } from '@angular/core';
import { Platform, NavController, AlertController, ActionSheetController, PopoverController, LoadingController } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { Clipboard } from '@ionic-native/clipboard';
import { Toast } from '@ionic-native/toast';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';

import { ActionsPage } from '../actions/actions';
import { SendPage } from '../send/send';

import { WalletService } from '../../providers/wallet-service/wallet-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  wif: string;
  address: string;
  walletName: string;
  isCordova: boolean;
  balance: number;
  balanceSat: number;
  updatingBalance: boolean;

  constructor(
    public plt: Platform,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    private logger: Logger,
    private toast: Toast,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private wallet: WalletService
  ) {
    this.isCordova = this.plt.is('cordova') ? true : false;
  }

  ionViewDidLoad() {
    this.wallet.init().then((wallet) => {
      this.address = wallet['address'];
      this.balance = wallet['balance'];
      this.walletName = wallet['name'];
      this.updateBalance();
    });
  }

  updateBalance() {
    this.updatingBalance = true;
    this.wallet.getBalance().then((balance) => {
      this.balance = Number(balance);
      setTimeout(() => {
        this.updatingBalance = false;
      }, 500);
    });
  }

  createWallet() {
    let loading;
    this.translate.get('Creating wallet...').subscribe((res: string) => {
      loading = this.loadingCtrl.create({
        content: res
      });
    });
    loading.present();
    this.wallet.create().then((wallet) => {
      this.address = wallet['address'];
      this.walletName = wallet['name'];
      this.updateBalance();
      setTimeout(() => {
        loading.dismiss();
      }, 500);
    });
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
          this.navCtrl.push(SendPage);
          break;
        }
        default: {
          // Nothing to do
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

}
