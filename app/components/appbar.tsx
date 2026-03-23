"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --bg: #080a0f;
          --surface: #0e1118;
          --surface2: #141720;
          --accent: #ff3c5f;
          --accent2: #ff8c42;
          --green: #1db954;
          --text: #f0f0f0;
          --muted: #6b7280;
          --border: rgba(255,255,255,0.07);
        }

        .lp-root {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* noise overlay */
        .lp-root::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.25;
        }

        /* ── NAV ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          background: rgba(8,10,15,0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .lp-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.1em; color: var(--text);
          display: flex; align-items: center; gap: 8px;
        }
        .lp-logo-dot {
          width: 7px; height: 7px; background: var(--accent);
          border-radius: 50%; animation: lpPulse 2s infinite;
        }
        @keyframes lpPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0.5} }

        .lp-nav-right { display: flex; align-items: center; gap: 10px; }

        .lp-nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid var(--border); overflow: hidden;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: white;
        }
        .lp-nav-avatar img { width:100%; height:100%; object-fit:cover; }

        .lp-nav-name {
          font-size: 0.85rem; color: var(--text); font-weight: 500;
        }

        .lp-btn {
          font-family: 'Space Mono', monospace;
          font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 8px 20px; border-radius: 2px;
          cursor: pointer; transition: all 0.2s; border: none;
          display: flex; align-items: center; gap: 7px;
        }
        .lp-btn-ghost {
          background: transparent; color: var(--muted);
          border: 1px solid var(--border) !important;
        }
        .lp-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.25) !important; }
        .lp-btn-red {
          background: var(--accent); color: white;
        }
        .lp-btn-red:hover {
          background: #ff1f45;
          box-shadow: 0 6px 20px rgba(255,60,95,0.4);
          transform: translateY(-1px);
        }
        .lp-btn-white {
          background: white; color: #111;
        }
        .lp-btn-white:hover {
          background: #f0f0f0;
          transform: translateY(-1px);
        }
        .lp-btn-lg { font-size: 0.78rem; padding: 14px 32px; }

        .lp-nav-skeleton {
          width: 100px; height: 30px; border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: lpSkel 1.5s infinite;
        }
        @keyframes lpSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding-top: 64px;
          position: relative;
          overflow: hidden;
        }

        /* grid lines */
        .lp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* blobs */
        .lp-blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.12;
          animation: lpDrift 14s ease-in-out infinite;
          pointer-events: none;
        }
        .lp-blob-1 { width:700px;height:700px;background:var(--accent);top:-200px;right:-150px;animation-delay:0s; }
        .lp-blob-2 { width:450px;height:450px;background:var(--accent2);bottom:-100px;left:-100px;animation-delay:-5s; }
        .lp-blob-3 { width:350px;height:350px;background:#6d28d9;top:40%;left:30%;animation-delay:-9s; }
        @keyframes lpDrift {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(24px,-16px) scale(1.04)}
          66%{transform:translate(-16px,24px) scale(0.96)}
        }

        /* left panel */
        .lp-hero-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px 64px 80px 80px;
          position: relative; z-index: 2;
        }

        .lp-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
          animation: lpUp 0.6s ease 0.1s both;
        }
        .lp-eyebrow::before { content:''; width:28px; height:1px; background:var(--accent); }

        .lp-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.5rem, 8vw, 8rem);
          line-height: 0.92; letter-spacing: 0.01em;
          margin-bottom: 28px;
          animation: lpUp 0.7s ease 0.25s both;
        }
        .lp-title-outline {
          -webkit-text-stroke: 2px var(--accent);
          color: transparent;
        }

        .lp-desc {
          font-size: 1.05rem; color: var(--muted); line-height: 1.75;
          max-width: 440px; margin-bottom: 40px; font-weight: 300;
          animation: lpUp 0.7s ease 0.4s both;
        }

        .lp-hero-cta {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: lpUp 0.7s ease 0.55s both;
        }

        @keyframes lpUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* right panel — mockup */
        .lp-hero-right {
          display: flex; align-items: center; justify-content: center;
          padding: 80px 80px 80px 40px;
          position: relative; z-index: 2;
          animation: lpUp 0.9s ease 0.7s both;
        }

        .lp-mockup {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px; padding: 24px; width: 100%; max-width: 360px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
        }

        .lp-mock-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px;
        }
        .lp-mock-room {
          font-family: 'Space Mono', monospace; font-size: 0.65rem;
          letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted);
        }
        .lp-mock-live {
          background: rgba(29,185,84,0.12); color: var(--green);
          font-family: 'Space Mono', monospace; font-size: 0.58rem;
          letter-spacing: 0.12em; padding: 3px 9px; border-radius: 99px;
          border: 1px solid rgba(29,185,84,0.25);
          display: flex; align-items: center; gap: 5px;
        }
        .lp-mock-live-dot {
          width: 5px; height: 5px; background: var(--green);
          border-radius: 50%; animation: lpPulse 1.5s infinite;
        }

        .lp-mock-playing {
          display: flex; gap: 12px; align-items: center;
          background: var(--surface2); border-radius: 10px; padding: 12px;
          margin-bottom: 14px; border: 1px solid var(--border);
        }
        .lp-mock-thumb {
          width: 42px; height: 42px; border-radius: 6px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
        }
        .lp-mock-info { flex:1; min-width:0; }
        .lp-mock-name { font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px; }
        .lp-mock-artist { font-size:0.68rem;color:var(--muted); }
        .lp-mock-wave { display:flex;gap:3px;align-items:center;height:22px; }
        .lp-mock-bar { width:3px;background:var(--accent);border-radius:2px;animation:lpWave 1s ease-in-out infinite; }
        .lp-mock-bar:nth-child(1){animation-delay:0s}.lp-mock-bar:nth-child(2){animation-delay:.15s}
        .lp-mock-bar:nth-child(3){animation-delay:.3s}.lp-mock-bar:nth-child(4){animation-delay:.45s}
        .lp-mock-bar:nth-child(5){animation-delay:.6s}
        @keyframes lpWave { 0%,100%{height:5px} 50%{height:18px} }

        .lp-mock-queue-label {
          font-family: 'Space Mono', monospace; font-size: 0.58rem;
          color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;
        }

        .lp-mock-item {
          display: flex; gap: 10px; align-items: center;
          padding: 9px; border-radius: 7px; margin-bottom: 5px;
        }
        .lp-mock-item-thumb { width:32px;height:32px;border-radius:5px;flex-shrink:0; }
        .lp-t1{background:linear-gradient(135deg,#5b21b6,#7c3aed)}
        .lp-t2{background:linear-gradient(135deg,#0369a1,#0ea5e9)}
        .lp-mock-item-meta { flex:1;min-width:0; }
        .lp-mock-item-name { font-size:0.75rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px; }
        .lp-mock-item-artist { font-size:0.63rem;color:var(--muted); }
        .lp-mock-votes { display:flex;flex-direction:column;gap:2px;align-items:center; }
        .lp-mock-vbtn {
          width:20px;height:20px;border-radius:3px;font-size:0.65rem;
          border:1px solid var(--border);background:none;color:var(--muted);
          display:flex;align-items:center;justify-content:center;
        }
        .lp-mock-vbtn.up{border-color:var(--green);color:var(--green)}
        .lp-mock-vcount{font-family:'Space Mono',monospace;font-size:0.58rem;color:var(--green)}

        .lp-mock-footer {
          display:flex;justify-content:space-between;align-items:center;
          margin-top:14px;padding-top:14px;border-top:1px solid var(--border);
        }
        .lp-mock-listeners { display:flex;align-items:center; }
        .lp-mock-av {
          width:22px;height:22px;border-radius:50%;border:2px solid var(--surface);
          margin-left:-5px;font-size:0.5rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;
        }
        .lp-mock-av:first-child{margin-left:0}
        .lp-av1{background:linear-gradient(135deg,#f59e0b,#ef4444)}
        .lp-av2{background:linear-gradient(135deg,#8b5cf6,#ec4899)}
        .lp-av3{background:linear-gradient(135deg,#10b981,#3b82f6)}
        .lp-mock-count{font-size:0.68rem;color:var(--muted);margin-left:8px}
        .lp-mock-yt{
          background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.2);
          color:#ff4444;font-family:'Space Mono',monospace;font-size:0.55rem;
          padding:3px 7px;border-radius:3px;
        }

        /* ── FEATURES ── */
        .lp-features {
          padding: 120px 80px;
          position: relative; z-index: 1;
        }

        .lp-section-tag {
          font-family: 'Space Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent);
          margin-bottom: 14px;
        }
        .lp-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 5vw, 5rem); line-height: 1;
          margin-bottom: 64px; max-width: 560px;
        }

        .lp-feat-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 2px;
        }

        .lp-feat {
          background: var(--surface); padding: 36px 28px;
          border: 1px solid var(--border); position: relative; overflow: hidden;
          transition: background 0.3s;
        }
        .lp-feat:hover { background: var(--surface2); }
        .lp-feat::after {
          content:''; position:absolute; top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,var(--accent),var(--accent2));
          opacity:0;transition:opacity 0.3s;
        }
        .lp-feat:hover::after { opacity:1; }
        .lp-feat:nth-child(1){border-radius:14px 0 0 0}
        .lp-feat:nth-child(3){border-radius:0 14px 0 0}
        .lp-feat:nth-child(4){border-radius:0 0 0 14px}
        .lp-feat:nth-child(6){border-radius:0 0 14px 0}

        .lp-feat-icon { font-size:1.8rem; margin-bottom:16px; display:block; }
        .lp-feat-title { font-size:1rem; font-weight:500; margin-bottom:10px; }
        .lp-feat-desc { font-size:0.84rem; color:var(--muted); line-height:1.7; }
        .lp-feat-n {
          font-family:'Bebas Neue',sans-serif; font-size:3.5rem;
          color:rgba(255,255,255,0.04); position:absolute; bottom:12px; right:16px; line-height:1;
        }

        /* ── HOW ── */
        .lp-how {
          padding: 120px 80px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: relative; z-index: 1;
        }

        .lp-steps {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 0; margin-top: 56px; position: relative;
        }
        .lp-steps::before {
          content:''; position:absolute; top:23px;
          left:calc(12.5% + 16px); right:calc(12.5% + 16px);
          height:1px;
          background:linear-gradient(90deg,var(--accent),var(--accent2),var(--accent));
          opacity:0.25;
        }
        .lp-step { padding:0 20px; text-align:center; }
        .lp-step-n {
          width:46px;height:46px;border-radius:50%;
          border:1px solid var(--border);background:var(--bg);
          display:flex;align-items:center;justify-content:center;
          font-family:'Space Mono',monospace;font-size:0.7rem;color:var(--accent);
          margin:0 auto 20px;position:relative;z-index:1;
        }
        .lp-step-title { font-size:0.95rem;font-weight:500;margin-bottom:8px; }
        .lp-step-desc { font-size:0.8rem;color:var(--muted);line-height:1.6; }

        /* ── BOTTOM CTA ── */
        .lp-cta {
          padding: 160px 80px; text-align: center;
          position: relative; z-index: 1; overflow: hidden;
        }
        .lp-cta::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,60,95,0.07), transparent);
        }
        .lp-cta-title {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(3.5rem,8vw,7.5rem);
          line-height:0.94; margin-bottom:20px; position:relative;
        }
        .lp-cta-sub {
          font-size:1rem;color:var(--muted);margin-bottom:40px;position:relative;
        }
        .lp-cta-btns {
          display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative;
        }

        /* ── FOOTER ── */
        .lp-footer {
          border-top:1px solid var(--border);padding:28px 80px;
          display:flex;justify-content:space-between;align-items:center;
          position:relative;z-index:1;
        }
        .lp-footer-logo {
          font-family:'Bebas Neue',sans-serif;font-size:1.3rem;
          letter-spacing:0.1em;color:var(--muted);
        }
        .lp-footer-copy {
          font-family:'Space Mono',monospace;font-size:0.58rem;
          color:var(--muted);letter-spacing:0.08em;
        }

        @media(max-width:1024px){
          .lp-hero { grid-template-columns:1fr; }
          .lp-hero-right { display:none; }
          .lp-hero-left { padding:80px 40px; }
          .lp-feat-grid { grid-template-columns:repeat(2,1fr); }
          .lp-steps { grid-template-columns:repeat(2,1fr);gap:40px; }
          .lp-steps::before { display:none; }
          .lp-features,.lp-how,.lp-cta { padding:80px 40px; }
          .lp-footer { padding:24px 40px; }
        }
        @media(max-width:640px){
          .lp-nav { padding:0 20px; }
          .lp-nav-name { display:none; }
          .lp-feat-grid { grid-template-columns:1fr; }
          .lp-steps { grid-template-columns:1fr; }
          .lp-features,.lp-how,.lp-cta { padding:64px 20px; }
          .lp-footer { padding:20px;flex-direction:column;gap:10px;text-align:center; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-logo">Muzer <span className="lp-logo-dot" /></div>
          
          <div className="lp-nav-right">
            {status === "loading" && <div className="lp-nav-skeleton" />}

            {status === "authenticated" && session?.user && (
              <>
                <div className="lp-nav-avatar">
                  {session.user.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={session.user.image} alt="avatar" />
                    : session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="lp-nav-name">{session.user.name}</span>
                <button className="lp-btn lp-btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </button>
              </>
            )}

            {status === "unauthenticated" && (
              <>
                <button
                  className="lp-btn lp-btn-white"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" }, { prompt: "select_account" })}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  className="lp-btn lp-btn-red"
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
          <div className="lp-blob lp-blob-3" />

          {/* Left */}
          <div className="lp-hero-left">
            <div className="lp-eyebrow">Collaborative Music Listening</div>
            <h1 className="lp-title">
              Music<br />
              <span className="lp-title-outline">Together</span>
            </h1>
            <p className="lp-desc">
              Create a room, drop YouTube links, and let your crew vote on what plays next.
              Real-time democracy for your playlist. Signin to make your own music room.
            </p>
            <div className="lp-hero-cta">
              {status === "unauthenticated" && (
                <>
                  <button
                    className="lp-btn lp-btn-red lp-btn-lg"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" }, { prompt: "select_account" })}
                  >
                    Sign in with Google
                  </button>
                  <button
                    className="lp-btn lp-btn-ghost lp-btn-lg"
                    onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                  >
                    Sign in with GitHub
                  </button>
                </>
              )}
              {status === "authenticated" && (
                <button
                  className="lp-btn lp-btn-red lp-btn-lg"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard →
                </button>
              )}
            </div>
          </div>

          {/* Right — live room mockup */}
          <div className="lp-hero-right">
            <div className="lp-mockup">
              <div className="lp-mock-header">
                <span className="lp-mock-room">Lo-fi Study Session</span>
                <span className="lp-mock-live"><span className="lp-mock-live-dot" />Live</span>
              </div>
              <div className="lp-mock-playing">
                <div className="lp-mock-thumb">🎵</div>
                <div className="lp-mock-info">
                  <div className="lp-mock-name">Chill Beats Vol. 3</div>
                  <div className="lp-mock-artist">ChilledCow · youtube</div>
                </div>
                <div className="lp-mock-wave">
                  {[0,1,2,3,4].map(i => <div key={i} className="lp-mock-bar" />)}
                </div>
              </div>
              <div className="lp-mock-queue-label">Up Next</div>
              {[
                { name:"Midnight Jazz", artist:"Lofi Girl", cls:"lp-t1", votes:"+12", up:true },
                { name:"Tokyo Dreaming", artist:"Nujabes", cls:"lp-t2", votes:"+7", up:false },
              ].map(t => (
                <div key={t.name} className="lp-mock-item">
                  <div className={`lp-mock-item-thumb ${t.cls}`} />
                  <div className="lp-mock-item-meta">
                    <div className="lp-mock-item-name">{t.name}</div>
                    <div className="lp-mock-item-artist">{t.artist}</div>
                  </div>
                  <div className="lp-mock-votes">
                    <div className={`lp-mock-vbtn ${t.up ? "up" : ""}`}>▲</div>
                    <span className="lp-mock-vcount" style={t.up ? {} : {color:"var(--muted)"}}>{t.votes}</span>
                    <div className="lp-mock-vbtn">▼</div>
                  </div>
                </div>
              ))}
              <div className="lp-mock-footer">
                <div className="lp-mock-listeners">
                  <div className="lp-mock-av lp-av1">A</div>
                  <div className="lp-mock-av lp-av2">K</div>
                  <div className="lp-mock-av lp-av3">R</div>
                  <span className="lp-mock-count">+5 listening</span>
                </div>
                <span className="lp-mock-yt">▶ YouTube</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="lp-features">
          <div className="lp-section-tag">Why Muzer</div>
          <h2 className="lp-section-title">Built for the collective experience</h2>
          <div className="lp-feat-grid">
            {[
              { icon:"🎚️", title:"Democratic Queue", desc:"Everyone votes on what plays next. The crowd decides — not just the host.", n:"01" },
              { icon:"🔗", title:"YouTube Links", desc:"Paste any YouTube URL to queue a track instantly. No downloads needed.", n:"02" },
              { icon:"🚪", title:"Instant Rooms", desc:"Create a room in seconds. Share the link — friends join straight away.", n:"03" },
              { icon:"⚡", title:"Real-time Sync", desc:"Everyone hears the same song at the same moment. Votes sync instantly.", n:"04" },
              { icon:"👑", title:"Host Controls", desc:"As creator you have final say — skip tracks and keep the vibe right.", n:"05" },
              { icon:"🌐", title:"No App Needed", desc:"Runs in the browser. Share a link, your friends are in. Zero friction.", n:"06" },
            ].map(f => (
              <div key={f.n} className="lp-feat">
                <span className="lp-feat-icon">{f.icon}</span>
                <div className="lp-feat-title">{f.title}</div>
                <p className="lp-feat-desc">{f.desc}</p>
                <span className="lp-feat-n">{f.n}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-how">
          <div className="lp-section-tag">How it works</div>
          <h2 className="lp-section-title">Four steps to the perfect session</h2>
          <div className="lp-steps">
            {[
              { n:"01", title:"Create a Room", desc:"Sign in and hit Create Room. Give it a name — you're the host." },
              { n:"02", title:"Share the Link", desc:"Send the room link to friends. They join instantly in their browser." },
              { n:"03", title:"Add YouTube Songs", desc:"Anyone pastes a YouTube URL to add tracks to the shared queue." },
              { n:"04", title:"Vote & Vibe", desc:"Upvote your favorites, downvote the rest. Best song always wins." },
            ].map(s => (
              <div key={s.n} className="lp-step">
                <div className="lp-step-n">{s.n}</div>
                <div className="lp-step-title">{s.title}</div>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="lp-cta">
          <h2 className="lp-cta-title">Ready to<br />drop the beat?</h2>
          <p className="lp-cta-sub">Free to start. No credit card. Just music.</p>
          <div className="lp-cta-btns">
            <button
              className="lp-btn lp-btn-red lp-btn-lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" }, { prompt: "select_account" })}
            >
              Start with Google
            </button>
            <button
              className="lp-btn lp-btn-ghost lp-btn-lg"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              Start with GitHub
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <span className="lp-footer-logo">Muzer</span>
          <span className="lp-footer-copy">© 2025 Muzer. Listen together.</span>
        </footer>

      </div>
    </>
  );
}