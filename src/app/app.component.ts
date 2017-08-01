import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Logger } from '@nsalaun/ng-logger';
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from '../pages/home/home';
import { ExportPage } from '../pages/export/export';
import { ImportPage } from '../pages/import/import';
import { SettingPage } from '../pages/setting/setting';
import { AboutPage } from '../pages/about/about';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private logger: Logger,
    private translate: TranslateService
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Import', component: ImportPage },
      { title: 'Export', component: ExportPage },
      { title: 'Setting', component: SettingPage },
      { title: 'About', component: AboutPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.logger.info('Starting app...');
      this.translate.setDefaultLang('en');
      this.translate.use('en');
      if (this.platform.is('cordova')) {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

}

