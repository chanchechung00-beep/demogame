
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// Đăng ký
window.xuLyDangKy = async function (email, password) {
    if (!email || !password) {
        alert("Điền đủ Email và Mật khẩu nha bé!");
        return;
    }

    try {
        // 1. Tạo tài khoản người dùng trên Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Tạo document lưu điểm số mặc định trên Firestore (collection 'players')
        await setDoc(doc(db, "players", user.uid), {
            email: user.email,
            bestScore: 0,
            totalScore: 0,
            createdAt: new Date().toISOString()
        });

        alert("Tạo tài khoản học tập thành công! 🎉");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        alert("Không thể đăng ký: " + error.message);
    }
};
// Đăng nhập
window.xuLyDangNhap = async function (email, password) {
    if (!email || !password) {
        alert("Điền đủ thông tin nha!");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Chào mừng bé quay trở lại! 🎉");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Đăng nhập thất bại. Hãy kiểm tra email và mật khẩu nhé!");
    }
};

// Đăng xuất
window.xuLyDangXuat = async function () {
    try {
        await signOut(auth);
        alert("Đã đăng xuất tài khoản học tập. Hẹn gặp lại! 👋");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
};

// Theo dõi trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Cho phép trang chủ lấy thông tin người dùng
        window.capNhatTaiKhoan?.(user);
    } else {
        const page = window.location.pathname;
        const isLoginPage = page.endsWith("/login.html")
            || page === "/login.html";
        const isRegisterPage = page.endsWith("/register.html")
            || page === "/register.html";

        if (!isLoginPage && !isRegisterPage) {
            window.location.href = "login.html";
        }
    }
        if (user) {
            capNhatDiemCaoNhat(user);
        } else {
            const scoreElement = document.getElementById("home-star-points");
            if (scoreElement) {
                scoreElement.textContent = "0";
            }
        }
});

async function capNhatDiemCaoNhat(user) {
    if (!user) return;
    
    try {
        const userDocRef = doc(db, "players", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const bestScore = userData.bestScore || 0;

            const scoreElement = document.getElementById("home-star-points");
            if (scoreElement) {
                scoreElement.textContent = bestScore;
            }
        } else {
            console.log("Không tìm thấy dữ liệu điểm của người dùng này trên Firestore.");
        }
    } catch (error) {
        console.error("Lỗi khi tải điểm cao nhất:", error);
    }
}
