import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { ConfigService } from '../config-service/config-service';

@Injectable()
export class BlockchainService {
  host: string;

  constructor(
    public http: Http,
    public logger: Logger,
    public events: Events,
    private config: ConfigService
  ) {
    logger.debug('BlockchainService initialized.');

    this.setHost(this.config.get()['network']);

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

  getAddressInfo(address: string) {
    let url = this.host + 'addr/' + address + '?noTxList=1&noCache=1';
    return this.http.get(url);
  }

  getUnspentOutputs(address: string) {
    let url = this.host + 'addr/'  + address + '/utxo';
    return this.http.get(url);
  }

  getEstimateFee() {
    let url = this.host + 'utils/estimatefee';
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
