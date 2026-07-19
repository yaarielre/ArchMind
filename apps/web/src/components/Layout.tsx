import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import layoutVideo from "../assets/videos/video_BackGround_layout.mp4";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <Sidebar />

      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-20"
        src={layoutVideo}
      />
      <div className="fixed inset-0 w-full h-full bg-black/50 -z-10" />

      <main className="ml-72 p-8 relative z-0 min-h-screen animate-fade-in">{children}</main>
    </div>
  );
}
