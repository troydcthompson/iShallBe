const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
admin.initializeApp(functions.config().firebase);

exports.updateProfilePosts = functions.firestore.document('users/{userId}').onUpdate(event => {
    console.log("Updating Profile Posts");
    console.log(event);
    let user = event.data.data();
    console.log(user);
    return updateStatements(user).then(() => {
        return updateGoals(user);
    });
});

function updateStatements(user) {
    console.log("Updating Statements");
    console.log(user);
    console.log("User uid is " + user.uid);
    let fireData = admin.firestore();
    let userStatements = fireData.collection('statements').where("uid", "==", user.uid);
    return userStatements.get().then((querySnapshot) => {
        return querySnapshot.forEach((doc) => {
            let statement = doc.data();
            let statementPath = "statements/" + statement.id;
            console.log("Statement path is " + statementPath);
            let myStatement = fireData.doc(statementPath);
            return myStatement.update({
                face: user.photo,
                name: user.name
            });
        });
    });
}

function updateGoals(user) {
    console.log("Updating Goals");
    console.log(user);
    console.log("User uid is " + user.uid);
    let fireData = admin.firestore();
    let userGoals = fireData.collection('goals').where("uid", "==", user.uid);
    return userGoals.get().then((querySnapshot) => {
        return querySnapshot.forEach((doc) => {
            let goal = doc.data();
            let goalPath = "goals/" + goal.id;
            console.log("Goal path is " + goalPath);
            let myGoal = fireData.doc(goalPath);
            return myGoal.update({
                face: user.photo,
                name: user.name
            });
        });
    });
}

exports.createNotification = functions.firestore.document('notifications/{notificationId}').onCreate(event => {
    console.log("Creating Notification");
    let notification = event.data.data();
    console.log("Notification is ");
    console.log(notification);
    let message = notification.description;
    if (!notification.reminder) message = notification.name + " " + notification.description;
    console.log(message);
    let payload = {
        notification: {
            body: message,
        },
        data: {
            id: notification.id,
            uid: notification.uid,
            name: notification.name,
            face: notification.face,
            description: notification.description,
            read: notification.read.toString(),
            collection: notification.collection,
            docId: notification.docId,
            receiverUid: notification.receiverUid,
            notification: message.toString(),
            pinLike: notification.pinLike.toString(),
            statementLike: notification.statementLike.toString(),
            goalLike: notification.goalLike.toString(),
            comment: notification.comment.toString(),
            commentLike: notification.commentLike.toString(),
            reminder: notification.reminder.toString(),
            displayTimestamp: notification.displayTimestamp,
            timestamp: notification.timestamp.toString(),
        }
    }
    console.log("Built Notification Payload");
    console.log(payload);
    let fireData = admin.firestore();
    let userPath = "users/" + notification.receiverUid;
    let user = fireData.doc(userPath);
    return user.get().then((user) => {
        console.log("Sending Notification to User");
        contributor = user.data();
        console.log(contributor);
        admin.messaging().sendToDevice(contributor.fcmToken, payload);
        return true;
    });
});

exports.hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
    console.log("Cron Hourly Tick");
    var wrapped = moment(new Date()); 
    console.log("Moment Date is ");
    console.log(wrapped); 
    let currentTime = moment(new Date()).unix();
    console.log("Current time in unix is " + currentTime);
    let overNextHourTime = currentTime + 3600;
    console.log("Over Next Hour Time in unix is " + overNextHourTime);
    let fireData = admin.firestore();
    let goals = fireData.collection('goals').where("dueDate", ">=", currentTime).
    where("dueDate", "<=", overNextHourTime);
    return goals.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let goal = doc.data()
            console.log("Got goal");
            console.log(goal);
            console.log("Goal due date in unix is " + goal.dueDate);
            createGoalReminder(goal);
        });
        return;
    });
});

function createGoalReminder(goal) {
    console.log("Creating Goal Reminder");
    console.log(goal);
    let fireData = admin.firestore();
    let displayTimestamp = moment().format('MMM DD YYYY');
    let timestamp = moment().unix();
    let id = goal.id + moment(new Date()).unix();
    let description = "your " + goal.title + " goal is due soon";
    console.log("Description is " + description);
    let notification = {
      id: id,
      uid: goal.uid,
      name: goal.name,
      face: goal.face,
      title: goal.title,
      description: description,
      read: false,
      collection: "goals",
      docId: goal.id,
      receiverUid: goal.uid,
      notification: false,
      pinLike: false,
      statementLike: false,
      goalLike: false,
      commentLike: false,
      comment: false,
      reminder: true,
      displayTimestamp: displayTimestamp,
      timestamp: timestamp
    }
    console.log("Notification Built");
    console.log(notification);
    let goalReminderPath = "notifications/" + id;
    console.log("Goal reminder path is " + goalReminderPath);
    return fireData.doc(goalReminderPath).create(notification);
}