import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1) AUTO-MATCH PLAYERS
export const matchPlayers = functions.firestore
  .document("matchTickets/{ticketId}")
  .onCreate(async (snap, context) => {
    const ticket = snap.data();
    const ticketId = context.params.ticketId;
    const { uid, mode, skill } = ticket;

    const opponentQuery = await db
      .collection("matchTickets")
      .where("mode", "==", mode)
      .where("uid", "!=", uid)
      .orderBy("createdAt", "asc")
      .limit(1)
      .get();

    if (opponentQuery.empty) return;

    const opponentDoc = opponentQuery.docs[0];
    const opponent = opponentDoc.data();
    const opponentId = opponentDoc.id;

    const lobbyRef = db.collection("lobbies").doc();
    await lobbyRef.set({
      lobbyId: lobbyRef.id,
      mode,
      players: [uid, opponent.uid],
      skillAverage: Math.round((skill + opponent.skill) / 2),
      createdAt: Date.now(),
      state: "ready",
    });

    await db.collection("users").doc(uid).update({
      lobbyId: lobbyRef.id,
      inMatch: true,
    });
    await db.collection("users").doc(opponent.uid).update({
      lobbyId: lobbyRef.id,
      inMatch: true,
    });

    await db.collection("matchTickets").doc(ticketId).delete();
    await db.collection("matchTickets").doc(opponentId).delete();
  });

// 2) CLEANUP TICKETS
export const cleanupTickets = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    const cutoff = Date.now() - 3 * 60 * 1000;
    const stale = await db
      .collection("matchTickets")
      .where("createdAt", "<", cutoff)
      .get();
    const batch = db.batch();
    stale.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return null;
  });

// 3) CLEANUP LOBBIES
export const cleanupLobbies = functions.pubsub
  .schedule("every 10 minutes")
  .onRun(async () => {
    const cutoff = Date.now() - 10 * 60 * 1000;
    const stale = await db
      .collection("lobbies")
      .where("createdAt", "<", cutoff)
      .get();
    const batch = db.batch();
    stale.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return null;
  });

// 4) CHALLENGE START
export const onChallengeStart = functions.firestore
  .document("challenges/{challengeId}")
  .onCreate(async (snap) => {
    const challenge = snap.data();
    const { defenderUid, trickName } = challenge;
    await sendPush(defenderUid, {
      title: "You’ve been challenged!",
      body: `Land the trick: ${trickName}`,
    });
  });

// 5) CHALLENGE UPDATE
export const onChallengeUpdate = functions.firestore
  .document("challenges/{challengeId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.replyVideo && after.replyVideo) {
      const { challengerUid, defenderUid } = after;
      const winner = after.replyLanded ? defenderUid : challengerUid;

      await change.after.ref.update({
        winner,
        completedAt: Date.now(),
      });

      await sendPush(challengerUid, {
        title: "SKATE Result",
        body: winner === challengerUid ? "You won this round!" : "You lost this round.",
      });

      await sendPush(defenderUid, {
        title: "SKATE Result",
        body: winner === defenderUid ? "You won this round!" : "You lost this round.",
      });
    }
  });

async function sendPush(uid: string, payload: { title: string; body: string }) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const token = userDoc.data()?.fcmToken;
    if (!token) return;

    await admin.messaging().send({
      token,
      notification: payload,
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });
  } catch (err) {
    console.error("FCM error:", err);
  }
}
