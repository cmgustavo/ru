import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Logger } from '@nsalaun/ng-logger';

@Injectable()
export class StorageService {

  constructor(
    private storage: Storage,
    private logger: Logger
  ) {
    this.logger.log('StorageService initialized.');
  }

  ready() {
    return this.storage.ready();
  }

  setData(wif: string, address: string) {
    this.logger.log('Address and WIF stored.');
    this.storage.set('ru-wif', wif);
    this.storage.set('ru-address', address);
  }

  getWif() {
    return this.storage.get('ru-wif');
  }

  getWallet(network: string) {
    return this.storage.get('ru-wallet-' + network);
  }

  setWallet(data: string, network: string) {
    this.storage.set('ru-wallet-' + network, data).then(() => {
      this.logger.info('Wallet saved.');
    });
  }

  removeWallet(network: string) {
    this.storage.remove('ru-wallet-' + network).then(() => {
      this.logger.warn('Wallet removed.');
    });
  }

  getConfig() {
    return this.storage.get('ru-config');
  }

  setConfig(cnf: string) {
    this.storage.set('ru-config', cnf).then(() => {
      this.logger.info('Config saved.');
    });
  }

  removeConfig() {
    this.storage.remove('ru-config').then(() => {
      this.logger.warn('Config removed.');
    });
  }

  clearData() {
    this.storage.clear().then(() => {
      this.logger.warn('All data removed.');
    });
  }

  /*
  async getWif() {
    return await this.storage.get('ru-wif');
  }
  */

}
