/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {initializeApp} = require("firebase-admin/app");
const {setGlobalOptions} = require("firebase-functions");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const {getFirestore} = require("firebase-admin/firestore");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 1});

initializeApp();

const db = getFirestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.updateFollowingCount = onDocumentCreated(
    "following/{userId}/user-following/{followerId}",
    async (event) => {
      const followerId = event.params.followerId;
      const userSnapshot = event.data.data();
      const usersRef = db.collection("users");

      await usersRef.doc(followerId).update({
        followersCount: userSnapshot.followersCount,
      });

      logger.log(`Updating followers count for user with id ${followerId}.`);
    },
);

exports.updateFollowersCount = onDocumentCreated(
    "followers/{followerId}/user-followers/{userId}",
    async (event) => {
      const userId = event.params.userId;
      const userSnapshot = event.data.data();
      const usersRef = db.collection("users");

      await usersRef.doc(userId).update({
        followingCount: userSnapshot.followingCount,
      });

      logger.log(`Updating following count for user with id ${userId}.`);
    },
);
