import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nest Starter",
  description: "Đăng nhập, đăng ký và trang chủ của Nest Starter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
