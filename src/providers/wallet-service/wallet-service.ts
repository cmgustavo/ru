import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';
import * as _ from "lodash";
import * as BitcoinLib from 'bitcoinjs-lib';

@Injectable()
export class WalletService {
  private network: Object;
  public wif: string;
  public address: string;

  constructor(
    private blockchain: BlockchainService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController) {
    this.network = BitcoinLib.networks.testnet;
  }

  importAddress(wif: string) {
    console.log('Importing address from WIF');
    let keyPair = BitcoinLib.ECPair.fromWIF(wif, this.network);
    this.wif = wif;
    this.address = keyPair.getAddress();
    console.log('Done: ' + this.address);
  }

  createAddress() {
    console.log('Creating address');
    let keyPair = BitcoinLib.ECPair.makeRandom({ network: this.network });
    this.wif = keyPair.toWIF();
    this.address = keyPair.getAddress();
    console.log('Done: ' + this.address);
  }

  sendTransaction(wif: string, address: string, amountSat: number) {
    let loading = this.loadingCtrl.create({
      content: 'Sending transaction...'
    });
    loading.present();
    let keyPair = BitcoinLib.ECPair.fromWIF(wif, this.network);
    let tx = new BitcoinLib.TransactionBuilder(this.network);

    this.blockchain.getEstimateFee().map(res => res.json()).subscribe(feeBTC => {
      let feeSat = parseInt((feeBTC['2'] * 100000000).toFixed(0));
      let finalAmountSat = amountSat - feeSat;

      this.blockchain.getUnspentOutputs(this.address).map(res => res.json()).subscribe(inputs => {
        _.forEach(inputs, function(value) {
          tx.addInput(value.txid, value.vout);
        });
        tx.maximumFeeRate = feeSat;
        tx.addOutput(address, finalAmountSat);
        _.forEach(inputs, function(value, i) {
          tx.sign(i, keyPair);
        });
        let rawTx = tx.build().toHex();
        this.blockchain.broadcastTx(rawTx).map(res => res.json()).subscribe(data => {
          let alert = this.alertCtrl.create({
            title: 'Transaction sent!',
            subTitle: address,
            buttons: ['OK']
          });
          setTimeout(() => {
            loading.dismiss();
            alert.present();
          }, 1000);
        });
      });
    });
  }

}
