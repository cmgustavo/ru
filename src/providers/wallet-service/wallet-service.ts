import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';
import { ConfigService } from '../../providers/config-service/config-service';
import { StorageService } from '../storage-service/storage-service';
import * as _ from "lodash";
import * as BitcoinLib from 'bitcoinjs-lib';

@Injectable()
export class WalletService {
  private network: Object;
  private networkName: string;

  private walletCache: Object = {
    wif: null,
    address: null,
    name: 'My simple wallet',
    balance: 0
  };

  constructor(
    private storage: StorageService,
    private config: ConfigService,
    private blockchain: BlockchainService,
    private logger: Logger,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {
    this.logger.debug('WalletService initialized.');
  }

  init() {
    return new Promise((resolve, reject) => {

      if (!_.isEmpty(this.walletCache['address'])) {
        resolve(this.walletCache);
        return;
      }

      let cnf = this.config.get();
      if (_.isNull(cnf)) {
        resolve();
        return;
      }
      this.networkName = cnf['network'];

      if (this.networkName == 'livenet') {
        this.network = BitcoinLib.networks.bitcoin;
      } else {
        this.network = BitcoinLib.networks.testnet;
      }

      this.storage.getWallet(this.networkName).then((localWallet) => {
        if (localWallet) {
          this.walletCache = JSON.parse(localWallet);
        } else {
          // Create a new wallet
          this.createWallet();
        }
        resolve(this.walletCache);
      });
    });
  }

  save(newOpts?: object) {
    let wallet = _.cloneDeep(this.walletCache);
    this.storage.getWallet(this.networkName).then((oldWallet) => {
      oldWallet = oldWallet || {};
      if (_.isString(oldWallet)) {
        oldWallet = JSON.parse(oldWallet);
      }
      if (_.isString(wallet)) {
        wallet = JSON.parse(wallet);
      }
      if (_.isString(newOpts)) {
        newOpts = JSON.parse(newOpts);
      }

      _.merge(wallet, oldWallet, newOpts);
      this.walletCache = wallet;

      this.storage.setWallet(JSON.stringify(this.walletCache), this.networkName);
    });
  }

  get() {
    return this.walletCache;
  }

  importWallet(wif: string) {
    this.logger.info('Importing wallet from WIF...');
    let keyPair = BitcoinLib.ECPair.fromWIF(wif, this.network);
    this.walletCache = {
      wif: wif,
      address: keyPair.getAddress()
    };
    this.save(this.walletCache);
  }

  createWallet() {
    this.logger.info('Creating wallet...');
    let keyPair = BitcoinLib.ECPair.makeRandom({ network: this.network });
    this.walletCache = {
      wif: keyPair.toWIF(),
      address: keyPair.getAddress()
    };
    this.save(this.walletCache);
  }

  sendTransaction(wif: string, address: string, amountSat: number) {}

    /*
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
     */

}
