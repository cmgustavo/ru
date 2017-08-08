import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { StorageService } from '../storage-service/storage-service';

import * as _ from "lodash";

@Injectable()
export class ConfigService {
  private configCache: object;
  private default: object = {
    language: 'en',
    network: 'testnet',
    feeLevel: 'normal'
  };

  constructor(
    private events: Events,
    private logger: Logger,
    private storage: StorageService
  ) {
    this.logger.debug('ConfigService initialized.');
  }

  public load() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.getConfig().then((localConfig) => {
          if (localConfig) {
            this.configCache = JSON.parse(localConfig);

            if (_.isEmpty(this.configCache['language'])) {
              this.configCache['language'] = this.default['language'];
            }

            if (_.isEmpty(this.configCache['network'])) {
              this.configCache['network'] = this.default['network'];
            }

            if (_.isEmpty(this.configCache['feeLevel'])) {
              this.configCache['feeLevel'] = this.default['feeLevel'];
            }
          } else {
            this.configCache = _.clone(this.default);
          }
          resolve(this.configCache);
        });
      });
    });
  }

  set(newOpts: object) {
    let config = _.cloneDeep(this.default);
    this.storage.getConfig().then((oldOpts) => {
      oldOpts = oldOpts || {};
      if (_.isString(oldOpts)) {
        oldOpts = JSON.parse(oldOpts);
      }
      if (_.isString(config)) {
        config = JSON.parse(config);
      }
      if (_.isString(newOpts)) {
        newOpts = JSON.parse(newOpts);
      }

      _.merge(config, oldOpts, newOpts);
      this.configCache = config;

      this.storage.setConfig(JSON.stringify(this.configCache));
      this.events.publish('config:updated', this.configCache);
    });
  }

  get() {
    return this.configCache;
  }

}
