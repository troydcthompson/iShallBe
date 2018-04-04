import { Notification } from './model';
export const message = {
  id: "1",
  uid: "1",
  name: "TDCT, LLC",
  face: "assets/img/tdct.png",
  description: "TDCT, LLC sent a message",
  read: false,
  collection: "users",
  docId: "2",
  receiverUid: "2",
  token: "23",
  message: true,
  pinLike: false,
  pinComment: false,
  pinCommentLike: false,
  statementLike: false,
  statementComment: false,
  statementCommentLike: false,
  goalLike: false,
  goalComment: false,
  goalCommentLike: false,
  reminder: false,
  displayTimestamp: "APR 4 2018",
  timestamp: 14323535,
}
export const mockNotifications: Notification[] = [message];       