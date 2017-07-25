import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class BlockchainService {
  host: string;

  constructor(public http: Http) {
    this.host = 'https://test-insight.bitpay.com/api/';
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
