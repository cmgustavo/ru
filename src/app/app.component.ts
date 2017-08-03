import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Logger } from '@nsalaun/ng-logger';
import { TranslateService } from '@ngx-translate/core';

import { StorageService } from '../providers/storage-service/storage-service';
import { WalletService } from '../providers/wallet-service/wallet-service';
import { BlockchainService } from '../providers/blockchain-service/blockchain-service';
import { ConfigService } from '../providers/config-service/config-service';
import { LanguageService } from '../providers/language-service/language-service';

import * as _ from 'lodash';

import { HomePage } from '../pages/home/home';
import { ExportPage } from '../pages/export/export';
import { ImportPage } from '../pages/import/import';
import { SettingPage } from '../pages/setting/setting';
import { AboutPage } from '../pages/about/about';

@Component({
  templateUrl: 'app.html',
  providers: [WalletService, BlockchainService, StorageService, ConfigService, LanguageService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  activePage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public events: Events,
    private logger: Logger,
    private translate: TranslateService,
    private storage: StorageService,
    private config: ConfigService,
    private language: LanguageService
  ) {

    events.subscribe('config:read', (config) => {
      this.logger.info('Configuration read: ' + JSON.stringify(config));
      this.language.init(config['language']);
      this.setMenu();
      this.initializeApp();
    });

    translate.onLangChange.subscribe((event) => {
      this.logger.info('Setting language changed to: ' + event.lang);
      this.setMenu();
    });

    events.subscribe('address:created', (address) => {
      this.logger.info('Address created: ' + address);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.logger.info('Starting app...');

      if (this.platform.is('cordova')) {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
    });
  }

  setMenu() {
    this.translate.get(['Home', 'Import', 'Export', 'Setting', 'About']).subscribe((res: string) => {
      this.pages = [
        { title: res['Home'], component: HomePage },
        { title: res['Import'], component: ImportPage },
        { title: res['Export'], component: ExportPage },
        { title: res['Setting'], component: SettingPage },
        { title: res['About'], component: AboutPage }
      ];
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
    this.activePage = page.component;
  }

  checkActivePage(page): boolean {
    return page === this.activePage;
  }

}

