import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service/app-service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  private appInfo: object;

  constructor(
    private app: AppService
  ) {
    this.app.get().subscribe((app) => {
      this.appInfo = app;
    });
  }

}
