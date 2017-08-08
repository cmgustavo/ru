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

import { AppService } from '../providers/app-service/app-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  public rootPage: any;
  public activePage: any = HomePage;

  private appName: string;
  private appVersion: string;

  pages: Array<{title: string, component: any, icon: string}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private logger: Logger,
    private translate: TranslateService,
    private app: AppService
  ) {
    this.initializeApp();
    translate.onLangChange.subscribe((event) => {
      this.logger.info('Setting language changed to: ' + event.lang);
      this.setMenu();
    });
  }

  initializeApp() {
    this.platform.ready().then((readySource) => {
      this.logger.info('Plarform ready: ' + readySource);
      this.rootPage = HomePage;
      this.setMenu();
      this.setAppName();

      if (this.platform.is('cordova')) {
        this.statusBar.styleLightContent();
        this.splashScreen.hide();
      }
    });
  }

  setMenu() {
    this.translate.get(['Home', 'Import', 'Export', 'Setting', 'About']).subscribe((res: string) => {
      this.pages = [
        { title: res['Home'], component: HomePage, icon: 'home' },
        { title: res['Import'], component: ImportPage, icon: 'download' },
        { title: res['Export'], component: ExportPage, icon: 'share-alt' },
        { title: res['Setting'], component: SettingPage, icon: 'settings' },
        { title: res['About'], component: AboutPage, icon: 'person' }
      ];
    });
  }

  setAppName() {
    this.app.get().subscribe((app) => {
      this.appName = app['name'];
      this.appVersion = app['version'];
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

