import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const matchPlayers = functions.firestore
  .document("matchTickets/{ticketId}")
  .onCreate(async (snap, ctx) => {
    const ticket = snap.data();
    const ticketId = ctx.params.ticketId;
    const { uid, mode, skill } = ticket;

    const oppSnap = await db
      .collection("matchTickets")
      .where("mode", "==", mode)
      .where("uid", "!=", uid)
      .orderBy("createdAt", "asc")
      .limit(1)
      .get();

    if (oppSnap.empty) {
      return;
    }

    const opponent = oppSnap.docs[0].data();
    const opponentId = oppSnap.docs[0].id;

    const lobbyRef = db.collection("lobbies").doc();
    await lobbyRef.set({
      lobbyId: lobbyRef.id,
      mode,
      players: [uid, opponent.uid],
      createdAt: Date.now(),
      state: "ready",
    });

    await db.collection("matchTickets").doc(ticketId).delete();
    await db.collection("matchTickets").doc(opponentId).delete();

    await db.collection("users").doc(uid).update({ lobbyId: lobbyRef.id });
    await db.collection("users").doc(opponent.uid).update({ lobbyId: lobbyRef.id });
  });
