import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { ErrorHandler, NgModule, APP_INITIALIZER } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NgLoggerModule, Level } from '@nsalaun/ng-logger';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ExportPage } from '../pages/export/export';
import { ImportPage } from '../pages/import/import';
import { SettingPage } from '../pages/setting/setting';
import { AboutPage } from '../pages/about/about';
import { ActionsPage } from '../pages/actions/actions';
import { SendPage } from '../pages/send/send';

/* Feature Modules */
import { Toast } from '@ionic-native/toast';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { StorageService } from '../providers/storage-service/storage-service';
import { ConfigService } from '../providers/config-service/config-service';
import { LanguageService } from '../providers/language-service/language-service';
import { WalletService } from '../providers/wallet-service/wallet-service';
import { BlockchainService } from '../providers/blockchain-service/blockchain-service';
import { AppService } from '../providers/app-service/app-service';

export function createTranslateLoader(http: Http) {
	return new TranslatePoHttpLoader(http, 'assets/i18n', '.po');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ExportPage,
    ImportPage,
    SettingPage,
    AboutPage,
    ActionsPage,
    SendPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [Http]
			}
		}),
    NgxQRCodeModule,
    NgLoggerModule.forRoot(Level.LOG),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ImportPage,
    ExportPage,
    SettingPage,
    AboutPage,
    ActionsPage,
    SendPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Clipboard,
    Toast,
    SocialSharing,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BarcodeScanner,
    StorageService,
    ConfigService,
    LanguageService,
    WalletService,
    BlockchainService,
    {
      provide: APP_INITIALIZER,
      useFactory: (language: LanguageService) => () => language.load(),
      deps: [LanguageService],
      multi: true
    },
    AppService
  ]
})
export class AppModule {}
