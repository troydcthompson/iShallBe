import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import moment from 'moment';
import { Observable } from 'rxjs';

import { FirebaseProvider } from '../../providers/firebase/firebase';

import { Comment } from '../../../test-data/comments/model';
import { Like } from '../../../test-data/likes/model';
import { Notification } from '../../../test-data/notifications/model';

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  id: string;
  collection: string;
  postPath: string;
  postDoc: any;
  commentsCol: any;
  comments: any;
  post: any;
  video: any;
  notificationRef: any;
  postManagerMenu = false;
  mine = false;
  audio = false;
  reported = false;
  private = false;
  loaded = false;
  commentsLoaded = false;
  editor = false;
  deleting = false;
  commented = false;
  likedComment = false;
  commentForm: {
    description?: string
  } = {};

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private firebase: FirebaseProvider
  ) {
  }

  ionViewDidLoad() {
    console.log("Opening Post");
    this.id = this.navParams.get("id");
    console.log("Post ID is " + this.id);
    this.collection = this.navParams.get("type");
    this.loadPost();
    this.loadComments();
  }

  loadPost() {
    console.log("Loading Post");
    this.postPath = this.collection + '/' + this.id;
    console.log("postPath is " + this.postPath);
    this.postDoc = this.firebase.afs.doc(this.postPath);
    this.postDoc.valueChanges().subscribe((post) => {
      console.log("Got post");
      console.log(post);
      let date = moment.unix(post.timestamp);
      post.displayTimestamp = moment(date).fromNow();
      if (post.uid == this.firebase.afa.auth.currentUser.uid) this.mine = true;
      if (post.day == 'Monday') this.video = post.link;
      if (this.collection == 'goals' && post.url) this.audio = true;
      this.editor = this.firebase.user.editor;
      this.private = post.private;
      this.reported = post.reported;
      this.post = post;
      this.loaded = true;
    });
  }

  loadComments() {
    this.comments = [];
    let commentsPath = this.postPath + '/comments';
    this.commentsCol = this.firebase.afs.collection(commentsPath, ref => ref.
      orderBy('timestamp', 'asc'));
    this.commentsCol.valueChanges().subscribe((comments) => {
      this.comments = [];
      this.setComments(comments);
    });
  }

  setComments(comments) {
    this.comments = [];
    comments.forEach((comment) => {
      this.checkUserCommentLike(comment).subscribe((liked) => {
        if (liked) comment.liked = true;
        let date = moment.unix(comment.timestamp);
        comment.displayTimestamp = moment(date).fromNow();
        if (comment.uid == this.firebase.user.uid) comment.mine = true;
        this.comments.push(comment);
      })
    });
    this.commentsLoaded = true;
  }

  checkUserCommentLike(comment) {
    return Observable.create((observer) => {
      let commentLikePath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id + "/likes/" + this.firebase.user.uid;
      let commentLike = this.firebase.afs.doc(commentLikePath).valueChanges();
      commentLike.subscribe((like) => {
        if (like) observer.next(true);
        else observer.next(false);
      });
    });
  }

  togglePostManagerMenu() {
    this.postManagerMenu = !this.postManagerMenu;
  }

  toggleReported() {
    let action = 'report';
    if (this.reported) action = 'unreport';
    this.confirm(action).subscribe((confirmed) => {
      if (confirmed) {
        this.reported = !this.reported;
        this.firebase.afs.doc(this.postPath).update({ reported: this.reported });
      }
    });
  }

  togglePrivacy() {
    this.private = !this.private;
    this.firebase.afs.doc(this.postPath).update({ private: this.private }).then(() => {
      this.navCtrl.pop();
    });
  }

  deletePost() {
    this.deleting = true;
    this.confirm('delete').subscribe((confirmed) => {
      if (confirmed) {
        this.firebase.afs.doc(this.postPath).delete().then(() => {
          this.navCtrl.pop();
        });
      }
    });
  }

  confirm(action) {
    return Observable.create((observer: any) => {
      let message = "Are you sure you want to " + action + " this post?";
      let alert = this.alertCtrl.create({
        title: 'Hold It!',
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              observer.next(false);
            }
          },
          {
            text: 'Confirm',
            handler: () => {
              observer.next(true);
            }
          }
        ]
      });
      alert.present();
    });
  }

  submit(commentForm) {
    this.commented = true;
    this.buildComment(commentForm).subscribe((comment) => {
      commentForm.description = "";
      this.setComment(comment);
      if (this.post.uid !== this.firebase.user.uid)
        this.sendNotification();
    });
  }

  buildComment(commentForm) {
    return Observable.create((observer) => {
      let commentId = this.firebase.afs.createId();
      let pin = false;
      let goal = false;
      let statement = false;
      if (this.collection == 'pins') pin = true;
      if (this.collection == 'goals') goal = true;
      if (this.collection == 'statements') statement = true;
      let displayTimestamp = moment().format('MMM D YYYY');
      let timestamp = moment().unix();
      const comment: Comment = {
        id: commentId,
        pin: pin,
        goal: goal,
        statement: statement,
        collectionId: this.post.id,
        description: commentForm.description,
        liked: false,
        likeCount: 0,
        displayTimestamp: displayTimestamp,
        timestamp: timestamp,
        uid: this.firebase.user.uid,
        name: this.firebase.user.name,
        face: this.firebase.user.photo
      }
      observer.next(comment);
    });
  }

  setComment(comment) {
    let newCommentPath = this.post.collection + '/' + this.post.id + '/comments/' + comment.id;
    this.firebase.afs.doc(newCommentPath).set(comment);
    this.addToCommentCount();
  }

  addToCommentCount() {
    let commentCount = ++this.post.commentCount;
    this.firebase.afs.doc(this.postPath).update({ commentCount: commentCount });
  }

  deleteComment(comment) {
    this.commented = true;
    let commentPath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id;
    this.firebase.afs.doc(commentPath).delete();
    this.subtractFromCommentCount();
  }

  subtractFromCommentCount() {
    let commentCount = --this.post.commentCount;
    this.firebase.afs.doc(this.postPath).update({ commentCount: commentCount });
  }

  addCommentLike(comment) {
    comment.liked = true;
    this.likedComment = true;
    let commentLikePath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id + "/likes/" + this.firebase.user.uid;
    this.buildCommentLike().subscribe((like) => {
      this.firebase.afs.doc(commentLikePath).set(like);
      this.addToCommentLikeCount(comment);
      if (comment.uid !== this.firebase.user.uid)
        this.sendNotification();
    });
  }

  buildCommentLike() {
    return Observable.create((observer) => {
      let displayTimestamp = moment().format('MMM D YYYY h:mmA');
      let timestamp = moment().unix();
      let id = this.firebase.afs.createId();
      let like: Like = {
        id: id,
        postId: this.post.id,
        pin: false,
        statement: false,
        goal: false,
        comment: true,
        displayTimestamp: displayTimestamp,
        timestamp: timestamp,
        uid: this.firebase.user.uid,
        name: this.firebase.user.name,
        face: this.firebase.user.photo
      }
      observer.next(like);
    });
  }

  removeCommentLike(comment) {
    comment.liked = false;
    this.likedComment = true;
    let commentLikePath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id + "/likes/" + this.firebase.user.uid;
    this.firebase.afs.doc(commentLikePath).delete();
    this.subtractFromCommentLikeCount(comment);
  }

  addToCommentLikeCount(comment) {
    let commentLikeCountPath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id;
    let commentLikeCount = ++comment.likeCount;
    this.firebase.afs.doc(commentLikeCountPath).update({ likeCount: commentLikeCount });
  }

  subtractFromCommentLikeCount(comment) {
    let commentLikeCountPath = this.post.collection + "/" + this.post.id + "/comments/" + comment.id;
    let commentLikeCount = --comment.likeCount;
    this.firebase.afs.doc(commentLikeCountPath).update({ likeCount: commentLikeCount });
  }

  sendNotification() {
    let description = "";
    if (this.commented) description = "commented on your post";
    if (this.likedComment) description = "liked your comment";
    this.buildNotification(description).subscribe((notification) => {
      let notificationPath = "notifications/" + notification.id;
      this.firebase.afs.doc(notificationPath).set(notification);
      this.commented = false;
      this.likedComment = false;
    });
  }

  buildNotification(description) {
    return Observable.create((observer) => {
      let id = this.firebase.afs.createId();
      let displayTimestamp = moment().format('MMM DD YYYY');
      let timestamp = moment().unix();
      let notification: Notification = {
        id: id,
        uid: this.firebase.user.uid,
        name: this.firebase.user.name,
        face: this.firebase.user.photo,
        description: description,
        read: false,
        collection: this.post.collection,
        docId: this.post.id,
        receiverUid: this.post.uid,
        message: false,
        pinLike: false,
        statementLike: false,
        goalLike: false,
        commentLike: this.likedComment,
        comment: this.commented,
        reminder: false,
        displayTimestamp: displayTimestamp,
        timestamp: timestamp
      }
      observer.next(notification);
    });
  }

  removeNotification() {
    let type = {
      comment: this.commented,
      likedComment: this.likedComment
    }
    this.notificationRef = this.firebase.afs.collection("notifications", ref => ref.
      where("docId", "==", this.post.id).
      where("comment", "==", type.comment).
      where("likedComment", "==", type.likedComment));
    this.notificationRef.valueChanges().subscribe((notifications) => {
      if (notifications.length > 0) {
        let notificationPath = "notifications/" + notifications[0].id;
        this.firebase.afs.doc(notificationPath).delete();
        this.commented = false;
        this.likedComment = false;
      }
    });
  }
}