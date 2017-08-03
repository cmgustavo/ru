import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';
import { ConfigService } from '../../providers/config-service/config-service';
import { StorageService } from '../storage-service/storage-service';
import * as _ from "lodash";
import * as BitcoinLib from 'bitcoinjs-lib';

@Injectable()
export class WalletService {
  private network: Object;
  public wif: string;
  public address: string;

  private walletCache: Object = {
    wif: null,
    address: null
  };

  constructor(
    private events: Events,
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
      let cnf = this.config.get();
      console.log('[wallet-service.ts:32]',cnf); //TODO

      if (cnf && cnf['network'] == 'livenet') {
        this.network = BitcoinLib.networks.livenet;
      } else {
        this.network = BitcoinLib.networks.testnet;
      }

      this.storage.getWallet(cnf['network']).then((localWallet) => {
        if (localWallet) {
          this.walletCache = JSON.parse(localWallet);
          console.log('[wallet-service.ts:47]',this.walletCache); //TODO
        } else {
          // Create a new wallet
          console.log('[wallet-service.ts:50] ####### create a new wallet'); //TODO
          this.createAddress();
        }
        resolve(this.walletCache);
      });
    });
  }

  set(newOpts: object) {
    let cnf = this.config.get();
    let wallet = _.cloneDeep(this.walletCache);
    this.storage.getWallet(cnf['network']).then((oldWallet) => {
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

      this.storage.setWallet(JSON.stringify(this.walletCache), cnf['network']);
    });
  }

  get() {
    return this.walletCache;
  }

  importAddress(wif: string) {
    console.log('Importing address from WIF');
    let keyPair = BitcoinLib.ECPair.fromWIF(wif, this.network);
    this.wif = wif;
    this.address = keyPair.getAddress();
    this.walletCache['wif'] = this.wif;
    this.walletCache['address'] = this.address;
    this.set(this.walletCache);
    console.log('Done: ' + this.address);
  }

  createAddress() {
    console.log('Creating address');
    let keyPair = BitcoinLib.ECPair.makeRandom({ network: this.network });
    this.wif = keyPair.toWIF();
    this.address = keyPair.getAddress();
    this.walletCache['wif'] = this.wif;
    this.walletCache['address'] = this.address;
    this.set(this.walletCache);
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
