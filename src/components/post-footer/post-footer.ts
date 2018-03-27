import { Component, Input } from '@angular/core';

import moment from 'moment';
import { Observable } from 'rxjs';

import { FirebaseProvider } from '../../providers/firebase/firebase';

import { Like } from '../../../test-data/likes/model';

@Component({
  selector: 'post-footer',
  templateUrl: 'post-footer.html'
})
export class PostFooterComponent {
  @Input('postDoc') postDoc;
  post: any;
  liked = false;
  loaded = false;

  constructor(
    private firebase: FirebaseProvider
  ) { }

  ngAfterViewInit() {
    if (!this.loaded) {
      this.checkUserPostLike().subscribe((liked) => {
        if (liked) this.liked = true;
        this.post = this.postDoc;
      });
  
    }
  }

  checkUserPostLike() {
    return Observable.create((observer) => {
      let postLikePath = this.postDoc.collection + "/" + this.postDoc.id + "/likes/" + this.firebase.user.uid;
      let postLike = this.firebase.afs.doc(postLikePath).valueChanges();
      postLike.subscribe((like) => {
        if (like) observer.next(true);
        else observer.next(false);
      });
    });
  }

  addLike() {
    this.liked = true;
    ++this.post.likeCount;
    let type = this.setPostType();
    let postLike = {
      postId: this.post.id,
      pin: type.pin,
      statement: type.statement,
      goal: type.goal
    }
    this.addPostLike(postLike).subscribe(() => {
      this.updatePost();
    });
  }

  setPostType() {
    let type = {
      pin: false,
      statement: false,
      goal: false
    }
    switch (this.post.collection) {
      case 'pins': type.pin = true;
        break;
      case 'statements': type.statement = true;
        break;
      case 'goals': type.goal = true;
    }
    return type;
  }

  addPostLike(postLike) {
    return Observable.create((observer) => {
      return this.buildPostLike(postLike).subscribe((like) => {
        let postLikePath = this.post.collection + "/" + this.post.id + "/likes/" + this.firebase.user.uid;
        this.firebase.afs.doc(postLikePath).set(like).then(() => {
          observer.next();
        });
      });
    });
  }

  buildPostLike(postLike) {
    return Observable.create((observer) => {
      let displayTimestamp = moment().format('MMM D YYYY h:mmA');
      let timestamp = moment().unix();
      let id = this.firebase.afs.createId();
      let like: Like = {
        id: id,
        postId: postLike.postId,
        pin: postLike.pin,
        statement: postLike.statement,
        goal: postLike.goal,
        displayTimestamp: displayTimestamp,
        timestamp: timestamp,
        uid: this.firebase.uid,
        name: this.firebase.user.name,
        face: this.firebase.user.photo
      }
      observer.next(like);
    });
  }

  updatePost() {
    let likePath = this.post.collection + '/' + this.post.id;
    this.firebase.afs.doc(likePath).update({
      likeCount: this.post.likeCount
    });
  }

  removeLike() {
    this.liked = false;
    --this.post.likeCount;
    this.removePostLike().subscribe(() => {
      this.updatePost();
    })
  }

  removePostLike() {
    return Observable.create((observer) => {
      let postLikePath = this.post.collection + "/" + this.post.id + "/likes/" + this.firebase.user.uid;
      return this.firebase.afs.doc(postLikePath).delete().then(() => {
        observer.next();
      })
    });
  }
}
