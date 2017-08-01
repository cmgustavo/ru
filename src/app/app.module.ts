import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NgLoggerModule, Level } from '@nsalaun/ng-logger';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ExportPage } from '../pages/export/export';
import { ImportPage } from '../pages/import/import';
import { SettingPage } from '../pages/setting/setting';
import { AboutPage } from '../pages/about/about';

/* Feature Modules */
import { Toast } from '@ionic-native/toast';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { WalletService } from '../providers/wallet-service/wallet-service';
import { StorageService } from '../providers/storage-service/storage-service';
import { BlockchainService } from '../providers/blockchain-service/blockchain-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ExportPage,
    ImportPage,
    SettingPage,
    AboutPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
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
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Clipboard,
    Toast,
    SocialSharing,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BarcodeScanner,
    WalletService,
    StorageService,
    BlockchainService
  ]
})
export class AppModule {}
