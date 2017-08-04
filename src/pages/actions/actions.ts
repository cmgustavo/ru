import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-actions',
  templateUrl: 'actions.html',
})
export class ActionsPage {

  constructor(
    public viewCtrl: ViewController
  ) {
  }

  close(action) {
    this.viewCtrl.dismiss(action);
  }

}
