import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

  constructor(private storage: Storage) {
    storage.ready().then(() => {
      console.log('Storage is ready.');
    });
  }

  setData(wif: string, address: string) {
    console.log('Address and WIF stored.');
    this.storage.set('ru-wif', wif);
    this.storage.set('ru-address', address);
  }

  getWif() {
    return this.storage.get('ru-wif');
  }

  /*
  async getWif() {
    return await this.storage.get('ru-wif');
  }
  */

}
