"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type AuthMode = "login" | "signup";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

type Notice = {
  type: "error" | "success";
  text: string;
};

const passwordRules = [
  { label: "Ít nhất 8 ký tự", test: (value: string) => value.length >= 8 },
  { label: "Có chữ thường và chữ hoa", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: "Có ít nhất một chữ số", test: (value: string) => /\d/.test(value) },
  { label: "Có ít nhất một ký tự đặc biệt", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function getApiMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return undefined;
  }

  const { message } = payload;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
    return message.join(". ");
  }

  return undefined;
}

function isAuthResponse(payload: unknown): payload is AuthResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "accessToken" in payload &&
    typeof payload.accessToken === "string" &&
    "refreshToken" in payload &&
    typeof payload.refreshToken === "string"
  );
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const isSignup = mode === "signup";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (isSignup) {
      if (!passwordRules.every((rule) => rule.test(password))) {
        setNotice({ type: "error", text: "Mật khẩu chưa đáp ứng đủ yêu cầu bảo mật." });
        return;
      }

      if (password !== confirmPassword) {
        setNotice({ type: "error", text: "Mật khẩu xác nhận chưa khớp." });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/auth/${isSignup ? "sign-up" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Nest API trả về phản hồi không hợp lệ.");
      }

      if (!response.ok) {
        throw new Error(
          getApiMessage(payload) ??
            `Yêu cầu không thành công (mã ${response.status}).`,
        );
      }

      if (!isAuthResponse(payload)) {
        throw new Error("Nest API chưa trả về đủ accessToken và refreshToken.");
      }

      try {
        sessionStorage.setItem("nest-starter.access-token", payload.accessToken);
        sessionStorage.setItem("nest-starter.refresh-token", payload.refreshToken);
        sessionStorage.setItem("nest-starter.email", email);
      } catch {
        throw new Error("Đăng nhập thành công nhưng không thể lưu phiên trên thiết bị này.");
      }

      router.replace("/home");
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof TypeError
            ? "Không thể kết nối Nest API. Hãy kiểm tra server và NEXT_PUBLIC_API_URL."
            : error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="brand-panel">
          <Link className="brand" href="/" aria-label="Nest Starter trang chủ">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 3.5 28 10v12L16 28.5 4 22V10l12-6.5Z" />
                <path d="m10 13.2 6 3.4 6-3.4M16 16.8v7.1" />
              </svg>
            </span>
            <span>nest<span className="brand-light">starter</span></span>
          </Link>

          <div className="brand-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> CỔNG THÀNH VIÊN</span>
            <h2>
              Mọi hành trình
              <br />
              đều bắt đầu từ
              <br />
              <span>một kết nối.</span>
            </h2>
            <p>
              Đăng nhập để tiếp tục hành trình của bạn, hoặc tạo tài khoản mới
              chỉ trong vài bước đơn giản.
            </p>
          </div>

          <div className="artwork" aria-hidden="true">
            <div className="artwork-orbit artwork-orbit-one" />
            <div className="artwork-orbit artwork-orbit-two" />
            <div className="artwork-card">
              <div className="artwork-card-top">
                <span className="artwork-avatar">N</span>
                <span className="artwork-lines"><i /><i /></span>
                <span className="artwork-check">✓</span>
              </div>
              <div className="artwork-card-bottom">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <span className="artwork-spark artwork-spark-one">✳</span>
            <span className="artwork-spark artwork-spark-two">✦</span>
          </div>

          <p className="brand-footer">BẮT ĐẦU ĐIỀU MỚI MẺ, NGAY HÔM NAY.</p>
        </aside>

        <section className="form-panel">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 3.5 28 10v12L16 28.5 4 22V10l12-6.5Z" />
                <path d="m10 13.2 6 3.4 6-3.4M16 16.8v7.1" />
              </svg>
            </span>
            <span>nest<span className="brand-light">starter</span></span>
          </div>

          <div className="form-content">
            <div className="form-heading">
              <span className="form-kicker">{isSignup ? "BẮT ĐẦU HÔM NAY" : "CHÀO MỪNG TRỞ LẠI"}</span>
              <h1>{isSignup ? "Tạo tài khoản" : "Đăng nhập"}</h1>
              <p>
                {isSignup
                  ? "Tạo tài khoản để bắt đầu trải nghiệm."
                  : "Nhập thông tin để tiếp tục với tài khoản của bạn."}
              </p>
            </div>

            <div className="mode-tabs" role="tablist" aria-label="Chọn hình thức tài khoản">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={!isSignup ? "mode-tab active" : "mode-tab"}
                onClick={() => changeMode("login")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={isSignup ? "mode-tab active" : "mode-tab"}
                onClick={() => changeMode("signup")}
              >
                Đăng ký
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Địa chỉ email</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="14" rx="3" />
                    <path d="m5 7 7 5.5L19 7" />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ban@email.com"
                    maxLength={50}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <div className="label-row">
                  <label htmlFor="password">Mật khẩu</label>
                  {!isSignup && <span className="field-note">Tối thiểu 8 ký tự</span>}
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="10" width="16" height="11" rx="3" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder="Nhập mật khẩu"
                    minLength={isSignup ? 8 : undefined}
                    maxLength={50}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "ẨN" : "HIỆN"}
                  </button>
                </div>
              </div>

              {isSignup && (
                <>
                  <div className="password-requirements" aria-label="Yêu cầu mật khẩu">
                    {passwordRules.map((rule) => {
                      const isMet = rule.test(password);
                      return (
                        <span className={isMet ? "requirement met" : "requirement"} key={rule.label}>
                          <span aria-hidden="true">{isMet ? "✓" : "·"}</span>
                          {rule.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="field">
                    <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                    <div className="input-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="4" y="10" width="16" height="11" rx="3" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2" />
                      </svg>
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu"
                        minLength={8}
                        maxLength={50}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showConfirmPassword ? "ẨN" : "HIỆN"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {notice && (
                <p className={`notice ${notice.type}`} role="status" aria-live="polite">
                  <span aria-hidden="true">{notice.type === "success" ? "✓" : "!"}</span>
                  {notice.text}
                </p>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang xử lý..."
                  : isSignup
                    ? "Tạo tài khoản"
                    : "Đăng nhập"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="form-footer">
              {isSignup ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => changeMode(isSignup ? "login" : "signup")}
              >
                {isSignup ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </p>
          </div>

          <p className="security-note">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2.5 16 5v4.3c0 3.8-2.5 6.6-6 8.2-3.5-1.6-6-4.4-6-8.2V5l6-2.5Z" />
              <path d="m7.5 9.8 1.7 1.7 3.5-3.7" />
            </svg>
            Thông tin của bạn luôn được bảo vệ an toàn
          </p>
        </section>
      </div>
    </main>
  );
}
