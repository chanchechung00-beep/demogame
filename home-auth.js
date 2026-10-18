
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const accountInfo = document.getElementById("tenTaiKhoan");
const logoutButton = document.getElementById("btnDangXuat");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Chưa đăng nhập: chuyển về trang đăng nhập
        window.location.replace("./login.html");
        return;
    }

    // Đã đăng nhập: hiển thị tên hoặc email
    if (accountInfo) {
        accountInfo.textContent =
            user.displayName || user.email || "Người chơi";
    }
});

// Xử lý nút đăng xuất
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.replace("./login.html");
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            alert("Đăng xuất thất bại. Vui lòng thử lại!");
        }
    });
}
