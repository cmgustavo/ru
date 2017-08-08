import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';

import { BlockchainService } from '../../providers/blockchain-service/blockchain-service';
import { ConfigService } from '../../providers/config-service/config-service';
import { StorageService } from '../storage-service/storage-service';

import * as _ from "lodash";
import * as BitcoinLib from 'bitcoinjs-lib';
import * as Bip39 from 'bip39';

@Injectable()
export class WalletService {
  private MAX_ADDRESSES = 10;
  private network: Object;
  private networkName: string;

  private walletCache: Wallet;

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

      if (!_.isEmpty(this.walletCache)) {
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
          resolve(this.walletCache);
        } else {
          this.create().then((wallet) => {
            resolve(wallet);
          });
        }
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

  getBalance() {
    return new Promise((resolve, reject) => {
      this.blockchain.getBalance([this.walletCache['address']]).then((data) => {
        this.walletCache['balance'] = data;
        resolve(data);
      });
    });
  }

  importWalletBip39(code: string) {
    let addresses = [];
    if (!Bip39.validateMnemonic(code)) return;

    let net = this.networkName == 'testnet' ? '1' : '0';
    let seed = Bip39.mnemonicToSeed(code);
    let root = BitcoinLib.HDNode.fromSeedBuffer(seed, this.network);
    for (let i = 0; i < this.MAX_ADDRESSES; i++) {
      let path = "m\/" + net  + "\'/0/" + i;
      let addr = root.derivePath(path).getAddress();
      addresses.push(addr);
    }
    // TODO: save all addresses
  }

  importWallet(wif: string, name?: string) {
    this.logger.info('Importing wallet from WIF...');
    let keyPair = BitcoinLib.ECPair.fromWIF(wif, this.network);
    this.walletCache = {
      wif: wif,
      address: keyPair.getAddress(),
      name: name ? name : 'My bitcoin wallet'
    };
    this.save(this.walletCache);
  }

  create(name?: string) {
    this.logger.info('Creating wallet...');
    return new Promise((resolve, reject) => {
      try {
        let keyPair = BitcoinLib.ECPair.makeRandom({ network: this.network });
        this.walletCache = {
          wif: keyPair.toWIF(),
          address: keyPair.getAddress(),
          name: name ? name : 'My bitcoin wallet'
        };
        this.save(this.walletCache);
        resolve(this.walletCache);
      } catch(err) {
        this.logger.error(err);
        reject(err);
      };
    });
  }

  prepareTx(toAmountBTC: number) {
    return new Promise((resolve, reject) => {
      if (toAmountBTC >= this.walletCache.balance) return reject('Insufficient funds');
      this.blockchain.getEstimateFee().then((feeBTC: number) => {
        if (feeBTC >= this.walletCache.balance) {
          return reject('Insufficient funds for fee');
        }
        let finalAmountBTC = Number((toAmountBTC + feeBTC).toFixed(8));
        let returnAmount = Number((this.walletCache.balance - finalAmountBTC).toFixed(8));
        if (finalAmountBTC > this.walletCache.balance) return reject('Insufficient funds');
        resolve({
          amount: toAmountBTC,
          fee: feeBTC,
          returnAmount: returnAmount
        });
      });
    });
  }

  getSendMaxInfo() {
    let balanceBTC = this.walletCache.balance;
    return new Promise((resolve, reject) => {
      this.blockchain.getEstimateFee().then((feeBTC: number) => {
        if (feeBTC >= balanceBTC) {
          return reject('Insufficient funds for fee');
        }
        let finalAmountBTC = Number((balanceBTC - feeBTC).toFixed(8));
        resolve({
          amount: finalAmountBTC,
          fee: feeBTC,
          returnAmount: 0 // Should be always zero
        });
      });
    });
  }

  getRawTx(toAddress: string, toAmount: number, toFee: number, returnAmount?: number) {
    return new Promise((resolve, reject) => {
      let keyPair = BitcoinLib.ECPair.fromWIF(this.walletCache.wif, this.network);
      let tx = new BitcoinLib.TransactionBuilder(this.network);

      this.blockchain.getUnspentOutputs(this.walletCache.address).map(res => res.json()).subscribe(inputs => {
        _.forEach(inputs, function(value) {
          tx.addInput(value.txid, value.vout);
        });
        tx.maximumFeeRate = toFee;
        tx.addOutput(toAddress, toAmount);
        if (returnAmount) {
          tx.addOutput(this.walletCache.address, returnAmount);
        }
        _.forEach(inputs, function(value, i) {
          tx.sign(i, keyPair);
        });
        let rawTx = tx.build().toHex();
        resolve(rawTx);
      });
    });
  }

  sendTx(rawTx: string) {
    return new Promise((resolve, reject) => {
      this.blockchain.broadcastTx(rawTx).map(res => res.json()).subscribe(data => {
        resolve(data);
      }, (err) => {
        reject(err['_body'] || err);
      });
    });
  }

  setWalletName(name: string) {
    this.walletCache.name = name;
    this.save(this.walletCache);
  }

}

interface Wallet {
  wif: string;
  address: string;
  name?: string;
  balance?: number;
}
