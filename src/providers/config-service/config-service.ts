import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Logger } from '@nsalaun/ng-logger';
import { StorageService } from '../storage-service/storage-service';

import * as _ from "lodash";

@Injectable()
export class ConfigService {
  private configCache: object;
  private default: object = {
    language: 'en'
  };

  constructor(
    private events: Events,
    private logger: Logger,
    private storage: StorageService
  ) {
    this.logger.debug('ConfigService initialized.');

    this.storage.getConfig().then((localConfig) => {
      if (localConfig) {
        this.configCache = JSON.parse(localConfig);
      } else {
        this.configCache = _.clone(this.default);
      }
      this.events.publish('config:read', this.configCache);
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
