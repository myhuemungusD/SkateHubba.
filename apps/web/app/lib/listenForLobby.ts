import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "@utils/firebaseClient";
import { useMatchStore } from "../../store/useMatchmaking";

export function listenForLobby(uid: string) {
  return onSnapshot(doc(firestore, "users", uid), (snap) => {
    const data = snap.data();
    if (data?.lobbyId) {
      useMatchStore.setState({ lobbyId: data.lobbyId, searching: false });
    }
  });
}
