import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "HTML2WEB - 粘贴代码，分享创意！",
  description: "粘贴 AI 生成的 HTML 代码，分享无限创意！一键粘贴，实时分享。",
  keywords: ["HTML2WEB", "HTML", "分享", "预览", "AI", "代码分享"],
  authors: [{ name: "HTML2WEB Team" }],
  openGraph: {
    title: "HTML2WEB - 粘贴代码，分享创意！",
    description: "粘贴 AI 生成的 HTML 代码，分享无限创意！",
    url: "https://html2web.com",
    siteName: "HTML2WEB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML2WEB - 粘贴代码，分享创意！",
    description: "粘贴 AI 生成的 HTML 代码，分享无限创意！",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
