const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
admin.initializeApp(functions.config().firebase);


exports.updatedProfile = functions.firestore.document('users/{userId}').onUpdate(event => {
    let user = event.data.data();
    console.log(user.name + " updated their profile");
    return updateStatements(user).then(() => {
        return updateGoals(user);
    });
});

function updateStatements(user) {
    console.log("Updating Statements");
    let fs = admin.firestore();
    let userStatements = fs.collection('statements').where("uid", "==", user.uid);
    return userStatements.get().then((querySnapshot) => {
        return querySnapshot.forEach((doc) => {
            let statement = doc.data();
            let statementPath = "statements/" + statement.id;
            let myStatement = fs.doc(statementPath);
            return myStatement.update({
                face: user.photo,
                name: user.name
            });
        });
    });
}

function updateGoals(user) {
    console.log("Updating Goals");
    let fs = admin.firestore();
    let userGoals = fs.collection('goals').where("uid", "==", user.uid);
    return userGoals.get().then((querySnapshot) => {
        return querySnapshot.forEach((doc) => {
            let goal = doc.data();
            let goalPath = "goals/" + goal.id;
            let myGoal = fs.doc(goalPath);
            return myGoal.update({
                face: user.photo,
                name: user.name
            });
        });
    });
}

exports.newNotification = functions.firestore.document('notifications/{notificationId}').onCreate(event => {
    let notification = event.data.data();
    console.log("New Notification");
    console.log(notification);
    if (notification.receiverUid !== "all") {
        return createNotificationForSingleUser(notification);
    } else {
        if (notification.sendNow) {
            return createNotificationForAllUsers(notification);
        }
    }
});

function createNotificationForSingleUser(notification) {
    console.log("Creating Notification For Single User");
    console.log(notification);
    let pushMessage = notification.name + " " + notification.description;
    if (notification.reminder) pushMessage = "Your " + notification.title + " goal is due soon";
    let payload = {
        notification: {
            body: pushMessage,
        },
        data: {
            id: notification.id,
            uid: notification.uid,
            name: notification.name,
            face: notification.face,
            description: pushMessage,
            read: notification.read.toString(),
            collection: notification.collection,
            docId: notification.docId,
            receiverUid: notification.receiverUid,
            message: notification.message.toString(),
            pinLike: notification.pinLike.toString(),
            statementLike: notification.statementLike.toString(),
            goalLike: notification.goalLike.toString(),
            comment: notification.comment.toString(),
            commentLike: notification.commentLike.toString(),
            reminder: notification.reminder.toString(),
            displayTimestamp: notification.displayTimestamp,
            timestamp: notification.timestamp.toString(),
        }
    };
    return sendNotificationToSingleUser(payload);
}

function sendNotificationToSingleUser(notification) {
    console.log("Sending Notification to Single User");
    console.log(notification);
    let fs = admin.firestore();
    let userPath = "users/" + notification.data.receiverUid;
    let user = fs.doc(userPath);
    return user.get().then((userDoc) => {
        user = userDoc.data();
        console.log("Sending Notification to " + user.fcmToken);
        return admin.messaging().sendToDevice(user.fcmToken, notification);
    });
}

function createNotificationForAllUsers(notification) {
    console.log("Creating Notification For All Users");
    let payload = {
        notification: {
            body: notification.description,
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
            message: notification.message.toString(),
            pinLike: notification.pinLike.toString(),
            statementLike: notification.statementLike.toString(),
            goalLike: notification.goalLike.toString(),
            comment: notification.comment.toString(),
            commentLike: notification.commentLike.toString(),
            reminder: notification.reminder.toString(),
            displayTimestamp: notification.displayTimestamp,
            timestamp: notification.timestamp.toString(),
        }
    };
    return pushPayloadToEachUser(payload);
}

function pushPayloadToEachUser(payload) {
    console.log("Pushing Payload To Each User");
    let fs = admin.firestore();
    let users = fs.collection('users');
    return users.get().then((usersCol) => {
        let promises = [];
        usersCol.forEach((userSnapshot) => {
            let user = userSnapshot.data();
            console.log("Pushing Payload to " + user.fcmToken);
            if (user.fcmToken) {
                let promise = admin.messaging().sendToDevice(user.fcmToken, payload)
                promises.push(promise);
            }
        });
        console.log("Finished Loading Promises");
        console.log(promises);
        return sendMessages(promises);
    });
}

function sendMessages(messages) {
    console.log("Sending Messages");
    console.log(messages);
    return Promise.all(messages).then((res) => {
        console.log("All Promises Resolved");
        console.log(res);
        return true;
    }).catch((error) => {
        console.error("There was an error");
        console.error(error);
        return true;
    });
}

exports.hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
    console.log("Cron Hourly Tick");
    return checkForGoalsDueSoon().then(() => {
        return checkForAffirmations();
    })
});

function checkForGoalsDueSoon() {
    console.log("Checking For Goals Due Soon");
    let currentTime = moment(new Date()).unix();
    let overNextHourTime = currentTime + 3600;
    let fs = admin.firestore();
    let goals = fs.collection('goals').where("dueDate", ">=", currentTime).
    where("dueDate", "<=", overNextHourTime);
    return goals.get().then((pendingReminders) => {
        pendingReminders.forEach((goalDoc) => {
            let goal = goalDoc.data();
            return createGoalReminder(goal);
        });
        return;
    });
}

function createGoalReminder(goal) {
    console.log("Creating Goal Reminder");
    let fs = admin.firestore();
    let id = goal.id + moment(new Date()).unix();
    let displayTimestamp = moment().format('MMM DD YYYY');
    let timestamp = moment().unix();
    let description = "Your " + goal.title + " goal is due soon";
    let notification = {
        id: id,
        uid: goal.uid,
        name: goal.name,
        face: goal.face,
        title: goal.title,
        description: description,
        read: false,
        collection: "reminder",
        docId: goal.id,
        receiverUid: goal.uid,
        message: false,
        pinLike: false,
        statementLike: false,
        goalLike: false,
        commentLike: false,
        comment: false,
        reminder: true,
        displayTimestamp: displayTimestamp,
        timestamp: timestamp
    };
    let goalReminderPath = "notifications/" + id;
    return fs.doc(goalReminderPath).create(notification);
}

function checkForAffirmations(affirmation) {
    console.log("Checking For Affirmations");
    let date = moment(new Date());
    let currentTime = moment(new Date()).unix();
    let overNextHourTime = currentTime + 3600;
    let fs = admin.firestore();
    let affirmations = fs.collection('notifications').
    where("receiverUid", "==", "all").
    where("timestamp", ">=", currentTime).
    where("timestamp", "<=", overNextHourTime);
    return affirmations.get().then((scheduledAffirmations) => {
        return scheduledAffirmations.forEach((affirmationDoc) => {
            let affirmation = affirmationDoc.data();
            return createNotificationForAllUsers(affirmation)
        });
    });
}

