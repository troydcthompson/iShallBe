import { Component } from '@angular/core';

import { IonicPage, NavController } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';

import { HomePage } from '../home/home';
import { ProfileUpdatePage } from '../profile-update/profile-update';
import { MessagesPage } from '../messages/messages';

import { FirebaseProvider } from '../../providers/firebase/firebase';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  user: any;
  mine = false;
  loaded = false;
  myAffirmations = true;
  postType = "statements";

  constructor(
    private navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    private firebase: FirebaseProvider
  ) {
  }

  ionViewDidLoad() {
    this.user = this.firebase.user;
    this.mine = true;
    this.loaded = true;
    this.loadUser();
  }

  loadUser() {
    let path = "users/" + this.firebase.uid;
    this.user = this.firebase.afs.doc(path);
    this.user.valueChanges().subscribe((user) => {
      this.user = user;
      this.loaded = true;
    });
  }

  openLink(link) {
    let hyperlink = "https://" + link;
    this.inAppBrowser.create(hyperlink, '_system');
  }

  refreshPage(refresh) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  pushProfileUpdatePage() {
    this.navCtrl.push(ProfileUpdatePage);
  }

  pushMessagesPage() {
    this.navCtrl.push(MessagesPage);
  }

  setRootHomePage() {
    this.navCtrl.setRoot(HomePage);
  }

}
