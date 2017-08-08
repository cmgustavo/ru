import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import * as _ from 'lodash';

import { ConfigService } from '../config-service/config-service';

@Injectable()
export class BlockchainService {
  host: string;
  feeLevel: string = 'normal';

  constructor(
    public http: Http,
    public logger: Logger,
    public events: Events,
    private config: ConfigService
  ) {
    this.logger.debug('BlockchainService initialized.');

    this.setHost(this.config.get()['network']);
    this.setFeeLevel(this.config.get()['feeLevel']);

    this.events.subscribe('config:updated', (config) => {
      this.setHost(config['network']);
    });
  }

  setHost(network: string) {
    if (network == 'livenet') {
      this.host = 'https://insight.bitpay.com/api/';
    } else {
      this.host = 'https://test-insight.bitpay.com/api/';
    }
  }

  setFeeLevel(level: string) {
    this.feeLevel = level;
  }

  getBalance(addresses: string[]) {
    let balance = 0
    let unconfirmedBalance = 0;
    let addressFunctions = [];
    let self = this;
    _.forEach(addresses, function(addr) {
      addressFunctions.push(self.getAddressPromise(addr));
    });
    return Promise.all(addressFunctions).then(addr => {
      _.forEach(addr, function(data) {
        balance = balance + data.balance;
        unconfirmedBalance = unconfirmedBalance + data.unconfirmedBalance;
      });
      return balance + unconfirmedBalance;
    });
  }

  getAddressPromise(address: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.getAddressInfo(address).map((res) => res.json()).subscribe((data) => {
        resolve(data);
      });
    });
  }

  getAddressInfo(address: string) {
    let url = this.host + 'addr/' + address + '?noTxList=1&noCache=1';
    return this.http.get(url);
  }

  getUnspentOutputs(address: string) {
    let url = this.host + 'addr/'  + address + '/utxo';
    return this.http.get(url);
  }

  getEstimateFee() {
    let blocks;
    switch(this.feeLevel) {
      case 'priority': blocks = 2;
        break;
      case 'normal': blocks = 6;
        break;
      case 'economy': blocks = 24;
        break;
      default: blocks = 6;
        break;
    }
    let url = this.host + 'utils/estimatefee?nbBlocks=' + blocks;
    return this.http.get(url);
  }

  broadcastTx(rawTx: string) {
    let url = this.host + 'tx/send';
    let params = { rawtx: rawTx };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(url, params, options);
  }

}
