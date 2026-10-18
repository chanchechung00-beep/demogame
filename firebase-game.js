
import { auth, db } from "./firebase-config.js";

import {
  doc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

let currentUser = auth.currentUser;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

window.luuThanhTichFirebase = async function (score) {
  const user = currentUser || auth.currentUser;

  if (!user) {
    console.warn("Chưa đăng nhập, không lưu được thành tích.");
    return false;
  }

  const validScore = Number(score);

  if (!Number.isFinite(validScore) || validScore < 0) {
    console.error("Điểm không hợp lệ:", score);
    return false;
  }

  const playerRef = doc(db, "players", user.uid);

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(playerRef);
      const oldData = snapshot.exists() ? snapshot.data() : {};

      const oldBest = Number(oldData.bestScore) || 0;
      const oldTotal = Number(oldData.totalScore) || 0;
      const oldGames = Number(oldData.gamesPlayed) || 0;

      transaction.set(playerRef, {
        displayName:
          user.displayName || user.email || oldData.displayName || "Người chơi",
        bestScore: Math.max(oldBest, validScore),
        totalScore: oldTotal + validScore,
        gamesPlayed: oldGames + 1,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    console.log("Đã lưu thành tích:", validScore);
    return true;
  } catch (error) {
    console.error("Không lưu được thành tích:", error);
    return false;
  }
};
