
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

// Đăng ký
window.xuLyDangKy = async function (email, password) {
    if (!email || !password) {
        alert("Điền đủ Email và Mật khẩu nha bé!");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
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
});
