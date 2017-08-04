import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppService } from '../../providers/app-service/app-service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  private appInfo: object;

  constructor(
    private app: AppService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.app.get().subscribe((app) => {
      this.appInfo = app;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
