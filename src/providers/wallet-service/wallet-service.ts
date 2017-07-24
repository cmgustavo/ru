import { Injectable } from '@angular/core';
import * as BitcoinLib from 'bitcoinjs-lib';

@Injectable()
export class WalletService {
  private network: Object;
  public wif: string;
  public address: string;

  constructor() {
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

}
