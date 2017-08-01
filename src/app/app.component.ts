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

  language: string;
  rootPage: any = HomePage;
  activePage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private logger: Logger,
    private translate: TranslateService
  ) {
    this.initializeApp();

    translate.onLangChange.subscribe((event) => {
      this.logger.info('Setting language changed to: ' + event.lang);
      this.setMenu();
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.logger.info('Starting app...');
      this.language = this.translate.getBrowserLang();
      this.translate.setDefaultLang('en');

      // Set current language
      this.translate.use(this.language);

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

