import { Component } from '@angular/core';

import { IonicPage, NavController, AlertController, Events, ActionSheetController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import moment from 'moment';

import { HomePage } from '../home/home';
 
import { FirebaseProvider } from '../../providers/firebase/firebase';

import { Pin } from '../../../test-data/pins/model';

@IonicPage()
@Component({
  selector: 'page-pin-creator',
  templateUrl: 'pin-creator.html',
})
export class PinCreatorPage {
 createPinForm: {
    title?: string;
    description?: string, 
  } = {};  
  pinId: string;
  pinImageUrl: string; 
  pinName: string;
  imageRetrievalMethod: string; 
  timestamp: number;
  displayTimestamp: string;
  submitted = false;
  loadingImage = false;
  imageReady = false;

  constructor(
    private navCtrl: NavController, 
    private alertCtrl: AlertController,
    private events: Events,
    private actionSheetCtrl: ActionSheetController,
    private firebase: FirebaseProvider
    ) {
  }

  ionViewDidLoad() {
    let timestampString = moment().format('YYYYMMDDhhmmss');
    this.timestamp = parseInt(timestampString);
    this.displayTimestamp = moment().format('L');
    this.listenForCanceledUpload();
  }

  loadImage() {
    this.askForImageRetrievalMethod();
  }

  askForImageRetrievalMethod() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            console.log("Chose Camera");
            this.imageRetrievalMethod = "camera";
            this.loadingImage = true;
          }
        },
        {
          text: 'Library',
          handler: () => {
            console.log("Chose Library");
            this.imageRetrievalMethod = "library";
            this.loadingImage = true;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Canceled asking for image retrieval method");
          }
        }
      ]
    });
    actionSheet.present();
  }

  setImage(image) {
    this.pinImageUrl = image.url;
    this.pinName = image.name;
    this.loadingImage = false;
    this.imageReady = true;
  }

  submit(form) {
    this.submitted = true;
    if (!this.imageReady) this.displayNotReadyAlert();
    else {
      if (form.valid) {
        this.buildPin(form).subscribe((pin) => {
          this.createPin(pin).then(() => {
            this.navCtrl.setRoot(HomePage);
          });
        });
      }
    }
  }

  buildPin(form) {
    return Observable.create((observer) => {
      this.pinId = this.firebase.afs.createId();
      const pin: Pin = {
        id: this.pinId,
        title: form.title,
        description: form.description,
        commentCount: 0,
        likeCount: 0,
        url: this.pinImageUrl,
        link: "",
        day: "",
        filename: this.pinName,
        displayAffirmationDate: "",
        affirmationDate: 0,
        displayTimestamp: this.displayTimestamp,
        timestamp: this.timestamp,
        user: {
          uid: this.firebase.user.uid,
          name: this.firebase.user.name,
          photo: this.firebase.user.photo
        }
      }
      observer.next(pin);
    });
  }

  createPin(pin) {
    let pinPath = "/pins/" + this.pinId;
    return this.firebase.afs.doc(pinPath).set(pin);
  }

  displayNotReadyAlert() {
    let alertMessage = "Please Add Image to Pin";
    let alert = this.alertCtrl.create({
      title: 'Almost There!',
      subTitle: alertMessage,
      buttons: ['OK']
    });
    alert.present();
  }

  listenForCanceledUpload() {
    this.events.subscribe('getImageCanceled', () => {
      this.pinImageUrl = null;
      this.imageReady = false;
      this.loadingImage = false;
    });
  }

  listenForUploadTimeout() {
    this.events.subscribe('timeout', () => {
      this.pinImageUrl = null;
      this.imageReady = false;
      this.loadingImage = false;
      let alert = this.alertCtrl.create({
        title: 'Upload Timeout',
        subTitle: 'Please Try Again',
        buttons: ['OK']
      });
      alert.present();    
    });
  }
}