import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Logger } from '@nsalaun/ng-logger';

@Injectable()
export class StorageService {

  constructor(private storage: Storage, private logger: Logger) {
    storage.ready().then(() => {
      this.logger.log('Storage is ready and initialized');
    });
  }

  setData(wif: string, address: string) {
    this.logger.log('Address and WIF stored.');
    this.storage.set('ru-wif', wif);
    this.storage.set('ru-address', address);
  }

  getLanguage() {
    return this.storage.get('ru-language');
  }

  setLanguage(lang: string) {
    this.storage.set('ru-language', lang);
  }

  getWif() {
    return this.storage.get('ru-wif');
  }

  getConfig() {
    return this.storage.get('ru-config');
  }

  setConfig(cnf: string) {
    this.storage.set('ru-config', cnf);
  }

  clearData() {
    return this.storage.clear();
  }

  /*
  async getWif() {
    return await this.storage.get('ru-wif');
  }
  */

}
