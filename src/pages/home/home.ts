import { Component, ViewChild } from '@angular/core';

import { IonicPage, NavController, AlertController, Platform, Slides } from 'ionic-angular';
import { FCM } from '@ionic-native/fcm';

import { NotificationsPage } from '../notifications/notifications';
import { StatementCreatorPage } from '../statement-creator/statement-creator';
import { GoalCreatorPage } from '../goal-creator/goal-creator';
import { ProfileUpdatePage } from '../profile-update/profile-update';

import { Observable } from 'rxjs';
import moment from 'moment';

import { Notification } from '../../../test-data/notifications/model';
import { Statement } from '../../../test-data/statements/model';
import { Goal } from '../../../test-data/goals/model';
import { Pin } from '../../../test-data/pins/model';

import { AngularFirestoreCollection } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slider: Slides;

  notificationsCollection: AngularFirestoreCollection<Notification[]>;
  pinsCollection: AngularFirestoreCollection<Pin[]>;
  statementsCollection: AngularFirestoreCollection<Statement[]>;
  goalsCollection: AngularFirestoreCollection<Goal[]>;
  statements: any[] = [];
  pins: any[] = [];
  goals: any[] = [];
  lastStatementTimestamp: number;
  lastGoalDueDate: number;
  postStartDate: number;
  postEndDate: number;
  dayNumber: number;
  timestamp: number;
  dayOfWeek: string;
  pinsLoaded = false;
  newNotifications = false;
  noMoreStatements = false;
  noMoreGoals = false;
  postSegment = 'statements';

  constructor(
    private alert: AlertController,
    private navCtrl: NavController,
    private platform: Platform,
    private fcm: FCM,
    private firebase: FirebaseProvider
  ) {
  }


  ionViewDidEnter() {
    this.timestampPage();
    this.checkForUnnamedUser();
    this.checkForNewNotifications();
    this.loadPosts();
    if (this.platform.is('cordova')) {
      this.listenToFCMPushNotifications();
    }
  }

  checkForUnnamedUser() {
    if (!this.firebase.incompleteProfileResolved) {
      if (!this.firebase.user.name || !this.firebase.user.photo ) {
        setTimeout(() => {
          this.displayUnnamedUserAlert();
        }, 3000);
      } else {
        this.firebase.incompleteProfileResolved = true;
      }
    }
  }

  displayUnnamedUserAlert() {
    this.firebase.incompleteProfileResolved = true;
    let alert = this.alert.create({
      title: "Build Your Profile",
      buttons: [ {
        text: 'Later',
        role: 'cancel',
        handler: () => {
        }
      }, {
        text: 'Update',
        handler: () => {
          this.navCtrl.push(ProfileUpdatePage);
        }
      }]
    });
    alert.present();
  }

  checkForNewNotifications() {
    this.notificationsCollection = this.firebase.afs.collection('notifications', ref =>
      ref.where("receiverUid", "==", this.firebase.user.uid).
        where("read", "==", false).
        where("message", "==", false));
    this.notificationsCollection.valueChanges().take(1).subscribe((myNewNotifications) => {
      if (myNewNotifications.length > 0) this.newNotifications = true;
      else this.newNotifications = false;
    });
  }

  timestampPage() {
    this.timestamp = moment().unix();
    this.dayNumber = moment().isoWeekday();
    this.dayOfWeek = moment().format('dddd');
    this.postEndDate = parseInt(moment().format('YYYYMMDD'));
    this.postStartDate = parseInt(moment().subtract(this.dayNumber, 'days').format('YYYYMMDD'));
  }

  listenToFCMPushNotifications() {
    this.fcm.getToken().then(token => {
      this.firebase.fcmToken = token
      this.firebase.syncFcmToken();
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      this.firebase.fcmToken = token;
      this.firebase.syncFcmToken();
    });
  }

  loadPosts() {
    this.loadPins();
    this.loadStatements();
    this.loadGoals();
  }

  loadPins() {
    let pins = this.firebase.afs.collection('pins', ref =>
      ref.orderBy('postDate').
        startAt(this.postStartDate).
        endAt(this.postEndDate));
    pins.valueChanges().take(1).subscribe((pins) => {
      if (!this.pinsLoaded) {
        this.setPins(pins).subscribe(() => {
          this.pinsLoaded = true;
          this.setSlider();
        });
      }
    });
  }

  setPins(pins) {
    return Observable.create((observer) => {
      pins.forEach((pin) => {
        this.pins.push(pin);
      });
      observer.next();
    });
  }

  setSlider() {
    setTimeout(() => {
      this.slider.slideTo(this.dayNumber);
    }, 500);
  }

  loadStatements() {
    this.statementsCollection = this.firebase.afs.collection('statements', ref =>
      ref.where('private', '==', false).
        where('reported', '==', false)
        .orderBy('timestamp', 'desc').
        limit(5));
    this.statementsCollection.valueChanges().take(1).subscribe((statements) => {
      if (statements.length > 0) this.setStatements(statements);
      else this.noMoreStatements = true;
    });
  }

  setStatements(statements) {
    if (statements.length < 5 ) this.noMoreStatements = true;
    statements.forEach((statement) => {
      let date = moment.unix(statement.timestamp);
      statement.displayTimestamp = moment(date).fromNow();
      this.statements.push(statement);
    });
    let lastStatement = statements.pop();
    this.lastStatementTimestamp = lastStatement.timestamp;
  }

  loadGoals() {
    this.goalsCollection = this.firebase.afs.collection('goals', ref =>
      ref.where('private', '==', false).
        where('reported', '==', false).
        where('complete', '==', false).
        where('dueDate', '>', this.timestamp).
        orderBy('dueDate', 'asc').
        limit(5));
    this.goalsCollection.valueChanges().take(1).subscribe((goals) => {
      if (goals.length > 0) this.setGoals(goals);
      else this.noMoreGoals = true;
    });
  }

  setGoals(goals) {
    if (goals.length < 5 ) this.noMoreGoals = true;
    goals.forEach((goal) => {
      let dueDate = moment.unix(goal.dueDate);
      goal.displayDueDate = moment(dueDate).fromNow();
      let timestamp = moment.unix(goal.timestamp);
      goal.displayTimestamp = moment(timestamp).fromNow();
      this.goals.push(goal);
    });
    let lastGoal = goals.pop();
    this.lastGoalDueDate = lastGoal.dueDate;
  }

  loadMoreStatements(event) {
    return new Promise((resolve) => {
      this.statementsCollection = this.firebase.afs.collection('statements', ref =>
        ref.where('private', '==', false).
          where('reported', '==', false).
          orderBy('timestamp', 'desc').
          limit(5).
          startAfter(this.lastStatementTimestamp));
      return this.statementsCollection.valueChanges().take(1).subscribe((statements) => {
        if (statements.length > 0 ) this.setStatements(statements);
        resolve();
      });
    });
  }

  loadMoreGoals(event) {
    return new Promise((resolve) => {
      this.statementsCollection = this.firebase.afs.collection('goals', ref =>
        ref.where('private', '==', false).
          where('reported', '==', false)
          .orderBy('timestamp', 'desc').
          limit(5).
          startAfter(this.lastGoalDueDate));
      return this.goalsCollection.valueChanges().take(1).subscribe((goals) => {
        if (goals.length > 0 ) this.setGoals(goals);
        resolve();
      });
    });
  }

  showNotifications() {
    this.navCtrl.push(NotificationsPage);
  }

  refreshPage(refresh) {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  setRootStatementCreatorPage() {
    this.navCtrl.setRoot(StatementCreatorPage);
  }

  setRootGoalCreatorPage() {
    this.navCtrl.setRoot(GoalCreatorPage);
  }
}