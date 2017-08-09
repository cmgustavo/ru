import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { Logger } from '@nsalaun/ng-logger';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../providers/wallet-service/wallet-service';
import { ConfigService } from '../../providers/config-service/config-service';

@Component({
  selector: 'page-send',
  templateUrl: 'send.html',
})
export class SendPage {
  private toAddress: string;
  private toAmount: number;
  private toFee: number;
  private returnAmount: number;
  private feeLevel: string;
  private isSendAll: boolean = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private logger: Logger,
    private wallet: WalletService,
    private config: ConfigService,
    private translate: TranslateService,
    public loadingCtrl: LoadingController,
    public plt: Platform,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.feeLevel = this.config.get()['feeLevel'];
  }

  ionViewDidLoad() {
  }

  scanQrCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData && barcodeData.text) {
        this.toAddress = barcodeData.text;
      }
      }, (err) => {
        this.logger.error(err);
      });
  }

  confirm() {
    let alert = this.alertCtrl.create({
      title: 'Confirm send',
      message: 'Sending ' + this.toAmount + ' BTC + ' + this.toFee + ' BTC for fee to: ' + this.toAddress,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: () => {
            this.send();
          }
        }
      ]
    });
    alert.present();
  }

  send() {
    let loading;
    this.translate.get('Sending bitcoin...').subscribe((res: string) => {
      loading = this.loadingCtrl.create({
        content: res
      });
    });
    loading.present();
    let amountSat = parseInt((this.toAmount * 100000000).toFixed(0));
    let feeSat = parseInt((this.toFee * 100000000).toFixed(0));
    let returnAmount = parseInt((this.returnAmount * 100000000).toFixed(0));
    this.wallet.getRawTx(this.toAddress, amountSat, feeSat, returnAmount).then(
      (rawTx: string) => {
        this.logger.debug('RawTx: ', rawTx);
        this.wallet.sendTx(rawTx).then((data) => {
          let txId = data['txid'];
          this.logger.info('txId: ' + txId);
          loading.dismiss();
          this.showSuccess(txId);
        }).catch((err) => {
          loading.dismiss();
          this.logger.error(err);
          this.showError(err);
        });
      },
      (err: string) => {
        loading.dismiss();
        this.logger.error(err);
        this.showError(err);
      });
  }

  prepareSend() {
    if (this.isSendAll) return this.confirm();

    let loading;
    this.translate.get('Creating transaction...').subscribe((res: string) => {
      loading = this.loadingCtrl.create({
        content: res
      });
    });
    loading.present();
    this.toAmount = Number(this.toAmount);
    this.wallet.prepareTx(this.toAmount).then(
      (data: string) => {
        this.logger.debug('Sending: ', data);
        this.toAmount = data['amount'];
        this.toFee = data['fee'];
        this.returnAmount = data['returnAmount'];
        loading.dismiss();
        this.confirm();
      },
      (err: string) => {
        loading.dismiss();
        this.logger.error(err);
        this.showError(err);
      });
  }

  sendAll() {
    if (!this.isSendAll) {
      this.toAmount = null;
      return;
    }
    let loading;
    this.translate.get('Please wait...').subscribe((res: string) => {
      loading = this.loadingCtrl.create({
        content: res
      });
    });
    loading.present();
    this.wallet.getSendMaxInfo().then((data) => {
      this.toAmount = data['amount'];
      this.toFee = data['fee'];
      this.returnAmount = data['returnAmount'];
      loading.dismiss();
    }).catch((err) => {
      loading.dismiss();
      this.logger.error(err);
      this.showError(err);
    });
  }

  showSuccess(msg: string) {
    let alert = this.alertCtrl.create({
      title: 'Transaction sent!',
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }

  showError(msg: string) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.isSendAll = false;
          }
        }
      ]
    });
    alert.present();
  }

}

