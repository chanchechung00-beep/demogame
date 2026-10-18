
import { auth, db } from './firebase-config.js';

import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';

const $ = id => document.getElementById(id);

let currentUser = null;
let authReadyResolve;

const authReady = new Promise(resolve => {
  authReadyResolve = resolve;
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  authReadyResolve(user);
});

async function saveGameResult(score) {
  await authReady;

  if (!currentUser) {
    console.warn('Chưa đăng nhập, không lưu được thành tích.');
    return;
  }

  const validScore = Number(score);

  if (!Number.isFinite(validScore) || validScore < 0) {
    console.warn('Điểm không hợp lệ:', score);
    return;
  }

  const playerRef = doc(db, 'players', currentUser.uid);

  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(playerRef);
    const oldData = snapshot.exists() ? snapshot.data() : {};

    const oldBest = Number(oldData.bestScore) || 0;
    const oldTotal = Number(oldData.totalScore) || 0;
    const oldGames = Number(oldData.gamesPlayed) || 0;

    transaction.set(playerRef, {
      displayName:
        currentUser.displayName ||
        currentUser.email?.split('@')[0] ||
        'Người chơi',
      bestScore: Math.max(oldBest, validScore),
      totalScore: oldTotal + validScore,
      gamesPlayed: oldGames + 1,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}

async function loadAchievements() {
  const status = $('leaderboard-status');
  const body = $('leaderboard-body');

  console.log("Kiểm tra db trong achievements.js:", db);

  status.textContent = 'Đang tải bảng thành tích...';

  try {
    await authReady;

    if (!currentUser) {
      status.textContent = 'Bạn cần đăng nhập để xem bảng thành tích.';
      body.innerHTML = '';
      return;
    }

    const ownRef = doc(db, 'players', currentUser.uid);
    const ownSnapshot = await getDoc(ownRef);
    const ownData = ownSnapshot.exists()
      ? ownSnapshot.data()
      : {};

    $('achievement-best-score').textContent =
      Number(ownData.bestScore) || 0;

    $('achievement-games-played').textContent =
      Number(ownData.gamesPlayed) || 0;
    console.log("Kiểm tra ownData:", db);

    const leaderboardQuery = query(
      collection(db, 'players'),
      orderBy('bestScore', 'desc'),
      limit(20)
    );

    const leaderboardSnapshot = await getDocs(leaderboardQuery);

    body.innerHTML = '';

    if (leaderboardSnapshot.empty) {
      body.innerHTML =
        '<tr><td colspan="3">Chưa có thành tích nào.</td></tr>';
    } else {
      let rank = 0;

      leaderboardSnapshot.forEach(playerDoc => {
        rank++;

        const data = playerDoc.data();
        const tr = document.createElement('tr');
        const rankCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');

        rankCell.textContent = rank;
        nameCell.textContent = data.displayName || 'Người chơi';
        scoreCell.textContent = Number(data.bestScore) || 0;

        tr.append(rankCell, nameCell, scoreCell);
        body.appendChild(tr);
      });
    }

    status.textContent =
      `Đã tải ${leaderboardSnapshot.size} người chơi.`;
  } catch (error) {
    console.error('Lỗi tải thành tích:', error);
    status.textContent =
      'Không tải được thành tích. Hãy kiểm tra kết nối và quyền Firestore.';
  }
}

window.addEventListener('wordland:load-achievements', () => {
  loadAchievements();
});

window.addEventListener('wordland:game-finished', async event => {
  const score = Number(event.detail?.score);

  if (
    event.detail?.practice ||
    !Number.isFinite(score) ||
    score < 0
  ) {
    return;
  }

  try {
    await saveGameResult(score);

    if (
      document.getElementById('achievements-screen') &&
      !document.getElementById('achievements-screen').classList.contains('hidden')
    ) {
      await loadAchievements();
    }
  } catch (error) {
    console.error('Lỗi lưu thành tích:', error);
  }
});
