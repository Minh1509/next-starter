"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { apiBaseUrl } from "@/lib/api";

function subscribeToSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getAccessTokenSnapshot() {
  return typeof window === "undefined"
    ? null
    : sessionStorage.getItem("nest-starter.access-token");
}

function getEmailSnapshot() {
  return typeof window === "undefined"
    ? ""
    : (sessionStorage.getItem("nest-starter.email") ?? "");
}

export default function AuthenticatedHome() {
  const router = useRouter();
  const accessToken = useSyncExternalStore(subscribeToSession, getAccessTokenSnapshot, () => null);
  const email = useSyncExternalStore(subscribeToSession, getEmailSnapshot, () => "");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  async function handleLogout() {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Nest API không xác nhận đăng xuất (mã ${response.status}).`);
      }

      sessionStorage.removeItem("nest-starter.access-token");
      sessionStorage.removeItem("nest-starter.refresh-token");
      sessionStorage.removeItem("nest-starter.email");
      router.replace("/");
    } catch (logoutError) {
      setError(
        logoutError instanceof TypeError
          ? "Không thể kết nối Nest API để đăng xuất. Phiên vẫn đang hoạt động."
          : logoutError instanceof Error
            ? logoutError.message
            : "Đăng xuất không thành công. Vui lòng thử lại.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!accessToken) {
    return (
      <main className="home-page">
        <p className="session-loading" role="status">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </main>
    );
  }

  return (
    <main className="home-page">
      <div className="home-shell">
        <header className="home-header">
          <Link className="home-brand" href="/home" aria-label="Nest Starter trang chủ">
            <span className="home-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 3.5 28 10v12L16 28.5 4 22V10l12-6.5Z" />
                <path d="m10 13.2 6 3.4 6-3.4M16 16.8v7.1" />
              </svg>
            </span>
            <span>
              nest<span className="home-brand-light">starter</span>
            </span>
          </Link>
          <span className="home-session">
            <span /> Phiên đăng nhập đang hoạt động
          </span>
        </header>

        <section className="home-content">
          <span className="home-kicker">
            <span /> KHÔNG GIAN CỦA BẠN
          </span>
          <h1>
            Chào mừng
            <br />
            <span>{email || "bạn"}.</span>
          </h1>
          <p className="home-description">
            Bạn đã đăng nhập thành công. Tài khoản của bạn đã sẵn sàng kết nối
            với Nest Starter.
          </p>

          <div className="home-status-card">
            <span className="home-status-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <span className="home-status-label">TRẠNG THÁI TÀI KHOẢN</span>
              <p>Đã xác thực thành công</p>
            </div>
            <span className="home-status-badge">ĐANG HOẠT ĐỘNG</span>
          </div>

          {error && (
            <p className="home-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="home-logout"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            {!isLoggingOut && <span aria-hidden="true">→</span>}
          </button>
        </section>

        <footer className="home-footer">
          <span>ĐƯỢC KẾT NỐI VỚI NEST STARTER API</span>
          <span className="home-footer-dot" />
          <span>AN TOÀN &amp; RIÊNG TƯ</span>
        </footer>
      </div>
    </main>
  );
}
