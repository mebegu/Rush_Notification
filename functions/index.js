const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Triggers when a user gets a new follower and sends a notification.
 *
 * Followers add a flag to `/followers/{followedUid}/{followerUid}`.
 * Users save their device notification tokens to `/users/{followedUid}/notificationTokens/{notificationToken}`.
 */
exports.sendNotification = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  console.log("Body: "+ req.body);
  const receiver = req.body.receiver;
  const sub = req.body.sub;
  const text = req.body.text;
  const act = req.body.act;

  // Get the list of device notification tokens.
  const getDeviceTokensPromise = admin.database().ref(`devices`).child(receiver).once('value').then(result => {
    const tokensSnapshot = result;

    // Check if there are any device tokens.
    if (!tokensSnapshot) {
      return console.log('There are no notification tokens to send to.');
    }
    console.log('There is', tokensSnapshot, 'tokens to send notifications to.');

    // Notification details.
    const payload = {
      notification: {
        title: sub,
        body: text,
        activity: act
      }
    };

    // Listing all tokens.
    const token = tokensSnapshot.val();
    console.log("token : "+token);

    // Send notifications to all tokens.
    return admin.messaging().sendToDevice(token, payload).then(response => {
      return res.send("ok");
    });
  });
});

