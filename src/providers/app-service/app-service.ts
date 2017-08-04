import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Logger } from '@nsalaun/ng-logger';
import 'rxjs/add/operator/map';

@Injectable()
export class AppService {
  private jsonPath: string = '../assets/appConfig.json';

  constructor(
    public http: Http,
    public logger: Logger
  ) {
    logger.debug('AppService initialized.');
  }

  getName() {
    return this.http.get(this.jsonPath)
      .map((res:Response) => res.json().name);
  }

  getDescription() {
    return this.http.get(this.jsonPath)
      .map((res:Response) => res.json().description);
  }

  getVersion() {
    return this.http.get(this.jsonPath)
      .map((res:Response) => res.json().version);
  }

}
