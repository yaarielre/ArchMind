import { NavLink } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, Sparkles, Upload } from "lucide-react";
import { AIConfigSidebar } from "./AIConfigSidebar";
import sidebarVideo from "../assets/videos/BackGround_video_.mp4";
import logo from "../assets/images/Logo.png";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Subir Proyecto", icon: Upload },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-72 text-white flex flex-col overflow-hidden border-r border-white/10" style={{ boxShadow: "12px 0 40px -18px rgba(15,23,42,0.95)" }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={sidebarVideo}
      />
      <div className="absolute inset-0 w-full h-full bg-black/95" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/20">
              <img src={logo} alt="ArchMind" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight leading-none">ArchMind</span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-white/40">DOCUMENT INTELLIGENCE</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Espacio de trabajo</p>
          <div className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-white/10 to-white/[0.05] text-white shadow-lg shadow-black/30"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 h-5 w-1 rounded-r-full bg-white" />}
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{label}</span>
                  {isActive && <Sparkles className="ml-auto h-3.5 w-3.5 text-white/60" />}
                </>
              )}
            </NavLink>
          ))}
          </div>
        </nav>

        <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.045] px-1 backdrop-blur-md">
          <AIConfigSidebar />
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-white/10 text-xs text-white/40">
          <BrainCircuit className="h-3.5 w-3.5 text-white/40" />
          <span>ArchMind v1.0</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-emerald-300/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Listo
          </span>
        </div>
      </div>
    </aside>
  );
}
