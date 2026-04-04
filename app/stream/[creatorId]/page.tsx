"use client";

import { useSession, signIn,signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getThumbUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  votes: number;
  addedBy: string;
  streamId: string;
}


export default function StreamPage() {
  //for mute and unmute
const [isMuted, setIsMuted] = useState(true);
  const { data: session } = useSession();
  const params = useParams();
  const creatorId = params.creatorId as string;

  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<{ id: string; title: string } | null>(null);
  //for youtube api two states
  const [searchQuery, setSearchQuery] = useState("");
const [results, setResults] = useState<any[]>([]);
  const [urlError, setUrlError] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<QueueItem | null>(null);
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());
  const [ytReady, setYtReady] = useState(false);
  const playerRef = useRef<any>(null);
  const queueRef = useRef<QueueItem[]>([]);

  // Prevents player from restarting every 3 seconds during polling
  const nowPlayingRef = useRef<QueueItem | null>(null);

  // Check if logged-in user is the room creator
  const isCreator = (session?.user as any)?.id === creatorId;

  const router = useRouter();
useEffect(() => {
  if (isCreator && session) {
    router.push("/dashboard");
  }
}, [isCreator, session]);

  // Keep refs in sync with state
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { nowPlayingRef.current = nowPlaying; }, [nowPlaying]);

  // ── Fetch streams + currently playing from DB every 3 seconds ──
  useEffect(() => {
  const fetchStreams = async () => {
    try {
      const res = await fetch(`/api/Streams?creatorId=${creatorId}`);
      if (!res.ok) return; // don't crash on error

      const data = await res.json();

      // fetch currently playing
      const currentRes = await fetch(`/api/Streams/current?creatorId=${creatorId}`);
      if (currentRes.ok) {
        const currentData = await currentRes.json();
        if (currentData.stream) {
          const incoming = {
            id: currentData.stream.id,
            videoId: currentData.stream.extractedId,
            title: currentData.stream.title,
            votes: 0,
            addedBy: "Someone",
            streamId: currentData.stream.id,
          };
          if (nowPlayingRef.current?.id !== incoming.id) {
            setNowPlaying(incoming);
          }
        }
      }

      // update queue — only active songs, not currently playing
      if (data.streams) {
        const sorted = data.streams
          .filter((s: any) => s.active === true) // ← only queued songs
          .map((s: any) => ({
            id: s.id,
            videoId: s.extractedId,
            title: s.title || "YouTube Video",
            votes: s.upvotes?.length ?? 0,
            addedBy: "Someone",
            streamId: s.id,
          }))
          .sort((a: any, b: any) => b.votes - a.votes);
        setQueue(sorted);
      }
    } catch(e) {
      console.error("fetchStreams error:", e);
      // don't clear queue on error
    }
  };

  fetchStreams();
  const interval = setInterval(fetchStreams, 2000);
  return () => clearInterval(interval);
}, [creatorId]);

  // ── Load YouTube IFrame API script ──
  useEffect(() => {
    if ((window as any).YT) { setYtReady(true); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // ── Create YouTube player ──
  // controls:0 → hides seek bar, skip buttons
  // disablekb:1 → disables keyboard shortcuts (spacebar etc.)
  // Transparent overlay in JSX blocks all mouse interaction for viewers
  useEffect(() => {
    if (!nowPlaying || !ytReady) return;
    if (playerRef.current) { try { playerRef.current.destroy(); } catch {} }

    playerRef.current = new (window as any).YT.Player("yt-player", {
      videoId: nowPlaying.videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        mute: isMuted? 1:0
      },events:{
        onReady:(event:any)=>{
          if(isMuted){
            event.target.mute();
          }
          else{
            event.target.unMute();
          }
        }
      }
    });
  }, [nowPlaying, ytReady]);

  useEffect(() => {
    setUrlError("");
    if (!url.trim()) { setPreview(null); return; }
    const id = extractYouTubeId(url);
    if (id) setPreview({ id, title: "YouTube Video" });
    else if (url.length > 10) { setPreview(null); setUrlError("Doesn't look like a valid YouTube link"); }
  }, [url]);

  //youtube api
   useEffect(() => {
  if (!searchQuery.trim()) {
    setResults([]);
    return;
  }

  const delay = setTimeout(() => {
    searchSongs(searchQuery);
  }, 300);

  return () => clearTimeout(delay);
}, [searchQuery]);




  const playNext = () => {
    if (queue.length === 0) return;
    const sorted = [...queue].sort((a, b) => b.votes - a.votes);
    const next = sorted[0];
    setNowPlaying(next);
    setQueue(prev => prev.filter(q => q.id !== next.id));
  };

  const handleAddToQueue = async () => {
    if (!preview) return;
    if (!session) { signIn(undefined, { callbackUrl: window.location.href }); return; }
    const fetchedId = await fetchurl();
    const newItem: QueueItem = {
      id: Date.now().toString(),
      videoId: preview.id,
      title: preview.title,
      votes: 0,
      addedBy: session?.user?.name?.split(" ")[0] ?? "You",
      streamId: fetchedId,
    };
    setQueue(prev => [...prev, newItem].sort((a, b) => b.votes - a.votes));
    setUrl(""); setPreview(null);
  };
// add creator id and url to database and returning streamid
  async function fetchurl() {
    const response = await fetch("/api/Streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId, url }),
    });
    const data = await response.json();
    return data.id;
  }

 async function upvote(streamId: string) {
  try {
    const response = await fetch("/api/Streams/upvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamId }),
    });
    if (!response.ok) {
      console.error("Upvote failed:", response.status);
    }
    const data = await response.json();
    return data.message;
  } catch(e) {
    console.error("Upvote error:", e);
  }
}

//youtube api
const searchSongs = async (query: string) => {
  if (!query || query.trim().length < 2) {
    setResults([]);
    return;
  }

  try {
    const res = await fetch(`/api/youtube/search?q=${query}`);

    if (!res.ok) {
      setResults([]);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      setResults([]);
      return;
    }

    setResults(data);

  } catch (err) {
    console.error("Search failed:", err);
    setResults([]);
  }
};


  const handleVote = async (id: string, delta: 1 | -1) => {
    if (!session) { signIn(undefined, { callbackUrl: window.location.href }); return; }
    if (delta === 1) {
      if (votedItems.has(id)) return;
      setVotedItems(prev => new Set(prev).add(id));
      const item = queue.find(q => q.id === id);
      upvote(item?.streamId ?? "");
    }
    setQueue(prev =>
      prev.map(item => item.id === id ? { ...item, votes: item.votes + delta } : item)
        .sort((a, b) => b.votes - a.votes)
    );
  };

  const handlePlay = (item: QueueItem) => {
    if (!isCreator) return;
    setNowPlaying(item);
    setQueue(prev => prev.filter(q => q.id !== item.id));
  };

  const sortedQueue = [...queue].sort((a, b) => b.votes - a.votes);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html, body{overflow-x:hidden; max-width:100%;}
        :root {
          --bg:#080a0f; --surface:#0e1118; --surface2:#141720;
          --accent:#ff3c5f; --accent2:#ff8c42; --green:#1db954;
          --text:#f0f0f0; --muted:#6b7280; --border:rgba(255,255,255,0.07);
        }
        .rm-root {
  min-height:100vh; background:var(--bg); color:var(--text);
  font-family:'DM Sans',sans-serif;
  overflow-x:hidden;
}
        .rm-root::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:52px 52px;pointer-events:none;}
        .rm-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:rgba(8,10,15,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
        .rm-logo{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:0.1em;display:flex;align-items:center;gap:8px;}
        .rm-logo-dot{width:7px;height:7px;background:var(--accent);border-radius:50%;animation:rmPulse 2s infinite;}
        @keyframes rmPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:0.5}}
        .rm-nav-right{display:flex;align-items:center;gap:12px}
        .rm-avatar{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--border);overflow:hidden;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;color:white;flex-shrink:0;}
        .rm-avatar img{width:100%;height:100%;object-fit:cover}
        .rm-signin-btn{font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;background:var(--accent);color:white;border:none;padding:7px 16px;border-radius:2px;cursor:pointer;transition:all 0.2s;}
        .rm-signin-btn:hover{background:#ff1f45}
        .rm-viewer-badge{background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--muted);font-family:'Space Mono',monospace;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;border-radius:99px;}
        .rm-creator-badge{background:rgba(255,60,95,0.1);border:1px solid rgba(255,60,95,0.3);color:var(--accent);font-family:'Space Mono',monospace;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;border-radius:99px;}
        .rm-body{display:grid;grid-template-columns:1fr 380px;gap:24px;padding:32px 40px 80px;max-width:1280px;margin:0 auto;position:relative;z-index:1;}
        .rm-left{display:flex;flex-direction:column;gap:24px}
        .rm-player{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
        .rm-player-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);}
        .rm-player-label{font-family:'Space Mono',monospace;font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px;}
        .rm-live-dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:rmPulse 1.5s infinite;}
        .rm-player-title{font-size:0.9rem;font-weight:500;color:var(--text)}
        .rm-play-next-btn{font-family:'Space Mono',monospace;font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);padding:5px 10px;border-radius:4px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:5px;}
        .rm-play-next-btn:hover:not(:disabled){border-color:var(--green);color:var(--green)}
        .rm-play-next-btn:disabled{opacity:0.3;cursor:not-allowed}
        .rm-embed-wrap{position:relative;width:100%;padding-bottom:56.25%;background:#000;}
        .rm-embed-wrap #yt-player{position:absolute;inset:0;width:100%;height:100%;border:none;}
        .rm-embed-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--surface2);}
        .rm-embed-placeholder-icon{font-size:3rem;opacity:0.3}
        .rm-embed-placeholder-text{font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);}
        .rm-input-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;}
        .rm-input-label{font-family:'Space Mono',monospace;font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;display:block;}
        .rm-input-row {
  display: flex;
  gap: 10px;
}
        .rm-input-card input:first-of-type {
  margin-bottom: 10px;
}
        .rm-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.2s,box-shadow 0.2s;min-width:0;}
        .rm-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,60,95,0.1)}
        .rm-input::placeholder{color:var(--muted)}
        .rm-input.error{border-color:var(--accent)}
        .rm-add-btn {
  font-family:'Space Mono',monospace;
  font-size:0.68rem;
  letter-spacing:0.1em;
  text-transform:uppercase;

  background:var(--accent);
  color:white;
  border:none;

  height: 42px;
  min-width: 90px;
  padding: 0 16px;

  border-radius:8px;
  cursor:pointer;
  transition:all 0.2s;
  white-space:nowrap;
  flex-shrink:0;

  display:flex;
  align-items:center;
  justify-content:center;
}
        .rm-add-btn:hover:not(:disabled){background:#ff1f45;box-shadow:0 4px 16px rgba(255,60,95,0.4);transform:translateY(-1px)}
        .rm-add-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .rm-url-error{font-family:'Space Mono',monospace;font-size:0.62rem;color:var(--accent);margin-top:8px;letter-spacing:0.05em;}
        .rm-preview{display:flex;gap:12px;align-items:center;margin-top:14px;padding:12px;background:var(--surface2);border-radius:10px;border:1px solid rgba(29,185,84,0.2);animation:rmFadeIn 0.3s ease;}
        @keyframes rmFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .rm-preview-thumb{width:80px;height:52px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--bg);}
        .rm-preview-thumb img{width:100%;height:100%;object-fit:cover}
        .rm-preview-info{flex:1;min-width:0}
        .rm-preview-tag{font-family:'Space Mono',monospace;font-size:0.58rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--green);margin-bottom:4px;}
        .rm-preview-id{font-size:0.8rem;color:var(--muted);font-family:'Space Mono',monospace}
        .rm-queue-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:0;overflow:hidden;position:sticky;top:88px;max-height:calc(100vh - 112px);display:flex;flex-direction:column;}
        .rm-queue-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);flex-shrink:0;}
        .rm-queue-title{font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);}
        .rm-queue-count{background:rgba(255,60,95,0.15);color:var(--accent);font-family:'Space Mono',monospace;font-size:0.6rem;padding:3px 9px;border-radius:99px;border:1px solid rgba(255,60,95,0.25);}
        .rm-queue-list{overflow-y:auto;flex:1;padding:8px}
        .rm-queue-list::-webkit-scrollbar{width:4px}
        .rm-queue-list::-webkit-scrollbar-track{background:transparent}
        .rm-queue-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .rm-queue-item{display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;margin-bottom:4px;transition:background 0.2s;}
        .rm-search-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 14px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.rm-search-item:hover {
  background: var(--surface2);
}

.rm-search-item img {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}
        .rm-queue-item:hover{background:var(--surface2)}
        .rm-queue-rank{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:rgba(255,255,255,0.08);width:20px;text-align:center;flex-shrink:0;line-height:1;}
        .rm-queue-rank.top{color:rgba(255,60,95,0.4)}
        .rm-queue-thumb{width:52px;height:36px;border-radius:5px;overflow:hidden;flex-shrink:0;background:var(--bg);}
        .rm-queue-thumb img{width:100%;height:100%;object-fit:cover}
        .rm-queue-meta{flex:1;min-width:0}
        .rm-queue-name{font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
        .rm-queue-by{font-size:0.66rem;color:var(--muted)}
        .rm-vote-col{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0}
        .rm-vote-btn{width:26px;height:26px;border-radius:5px;border:1px solid var(--border);background:none;color:var(--muted);cursor:pointer;font-size:0.7rem;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .rm-vote-btn.up:hover{border-color:var(--green);color:var(--green);background:rgba(29,185,84,0.08)}
        .rm-vote-num{font-family:'Space Mono',monospace;font-size:0.65rem;font-weight:700;min-width:24px;text-align:center;}
        .rm-vote-num.pos{color:var(--green)}.rm-vote-num.neg{color:var(--accent)}.rm-vote-num.zero{color:var(--muted)}
        .rm-play-btn{font-family:'Space Mono',monospace;font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);padding:4px 8px;border-radius:4px;cursor:pointer;transition:all 0.15s;margin-top:4px;}
        .rm-play-btn:hover{border-color:var(--green);color:var(--green)}
        .rm-queue-empty{padding:48px 20px;text-align:center;}
        .rm-queue-empty-icon{font-size:2.5rem;margin-bottom:12px;opacity:0.3}
        .rm-queue-empty-text{font-family:'Space Mono',monospace;font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);}
          /*signout button class*/
            .rm-signout {
          font-family:'Space Mono',monospace; font-size:0.65rem;
          letter-spacing:0.1em; text-transform:uppercase;
          background:none; border:1px solid var(--border);
          color:var(--muted); padding:7px 16px; border-radius:2px;
          cursor:pointer; transition:all 0.2s;
        }
        .rm-signout:hover{border-color:var(--accent);color:var(--accent)}
        
       @media(max-width:900px){
  .rm-body{grid-template-columns:1fr;padding:16px}
  .rm-queue-card{position:static;max-height:500px}
  .rm-nav{padding:0 16px}
  .rm-input-card{padding:16px}
  .rm-player-header{flex-wrap:wrap;gap:8px}
  .rm-input-row{flex-direction:column}
  .rm-add-btn{width:100%}
  .rm-input{width:100%}
}
        
      `}</style>

      <div className="rm-root">
        <nav className="rm-nav">
          <div className="rm-logo">Muzer <span className="rm-logo-dot" /></div>
          <div className="rm-nav-right">
             {session && (
  <button
    className="rm-signout"
    onClick={() => signOut({ callbackUrl: "/" })}
  >
    Sign Out
  </button>
)}
            {session && (
              <span className={isCreator ? "rm-creator-badge" : "rm-viewer-badge"}>
                {isCreator ? "🎛 Host" : "👀 Viewer"}
              </span>
            )}
            {session ? (
              <div className="rm-avatar">
                {session.user?.image
                  ? <img src={session.user.image} alt="avatar" />
                  : session.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            ) : (
              <button className="rm-signin-btn" onClick={() => signIn(undefined, { callbackUrl: window.location.href })}>
                Sign in to Vote
              </button>
            )}
          </div>
        </nav>
        <div className="rm-body">
          <div className="rm-left">
            <div className="rm-player">
              <div className="rm-player-header">
                <span className="rm-player-label">
                  <span className="rm-live-dot" /> Now Playing
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {nowPlaying && <span className="rm-player-title">{nowPlaying.title}</span>}




     

  {/* 🔊 Unmute / Mute button */}
                      {nowPlaying && (
                                  <button
                    className="rm-play-next-btn"
                    onClick={() => {
                      if (isMuted) {
                        playerRef.current?.unMute();
                        setIsMuted(false);
                      } else {
                        playerRef.current?.mute();
                        setIsMuted(true);
                      }
                    }}
                  >
                    {isMuted ? "🔊 Unmute" : "🔇 Mute"}
                  </button>
                )}








                  {isCreator && (
                    <button className="rm-play-next-btn" onClick={playNext} disabled={queue.length === 0}>
                      ⏭ Play Next
                    </button>
                  )}
                </div>
              </div>

              <div className="rm-embed-wrap">
                {nowPlaying ? (
                  <>
                    {/* ── Viewer overlay ──
                        Only shows for viewers (not creator).
                        Blocks ALL mouse interaction with the YouTube player.
                        Viewers can only watch — no pause, skip or seek.
                        Creator has no overlay so they keep full controls. */}
                    {!isCreator && (
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                        background: "transparent",
                        cursor: "default",
                      }} />
                    )}
                    {/* YouTube player attaches here */}
                    <div id="yt-player" />
                  </>
                ) : (
                  <div className="rm-embed-placeholder">
                    <span className="rm-embed-placeholder-icon">🎵</span>
                    <span className="rm-embed-placeholder-text">No song playing yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rm-input-card">
              <span className="rm-input-label">Suggest a song</span>

              {/* //youtube api  */}
{/*<div className="rm-input-row">
  <input
    className="rm-input"
    type="text"
    placeholder="Search songs..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        searchSongs(searchQuery);
      }
    }}
  />

  <button
    className="rm-add-btn"
    onClick={() => searchSongs(searchQuery)}
    disabled={!searchQuery.trim()}
  >
    Search
  </button>
</div>*/}

{/* //youtube api */}
{results.length > 0 && (
  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
    {results.map((video) => (
      <div
        key={video.videoId}
        className="rm-search-item"
        onClick={() => {
          setPreview({
            id: video.videoId,
            title: video.title
          });

          setUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
          setResults([]);
          setSearchQuery("");
        }}
      >
        <img src={video.thumbnail} width={80} />
        <p>{video.title}</p>
      </div>
    ))}
  </div>
)}


              <div className="rm-input-row">
                <input
                  className={`rm-input ${urlError ? "error" : ""}`}
                  type="text"
                  placeholder="Paste a YouTube link..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && preview && handleAddToQueue()}
                />
                <button className="rm-add-btn" onClick={handleAddToQueue} disabled={!preview}>+ Add</button>
              </div>
              {urlError && <p className="rm-url-error">⚠ {urlError}</p>}
              {preview && (
                <div className="rm-preview">
                  <div className="rm-preview-thumb">
                    <img src={getThumbUrl(preview.id)} alt="thumb" />
                  </div>
                  <div className="rm-preview-info">
                    <div className="rm-preview-tag">✓ Valid YouTube link</div>
                    <div className="rm-preview-id">ID: {preview.id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rm-queue-card">
            <div className="rm-queue-header">
              <span className="rm-queue-title">Up Next</span>
              <span className="rm-queue-count">{sortedQueue.length} songs</span>
            </div>
            <div className="rm-queue-list">
              {sortedQueue.length === 0 ? (
                <div className="rm-queue-empty">
                  <div className="rm-queue-empty-icon">🎶</div>
                  <div className="rm-queue-empty-text">Queue is empty<br />Suggest a song above</div>
                </div>
              ) : (
                sortedQueue.map((item, idx) => (
                  <div key={item.id} className="rm-queue-item">
                    <span className={`rm-queue-rank ${idx === 0 ? "top" : ""}`}>{idx + 1}</span>
                    <div className="rm-queue-thumb">
                      <img src={getThumbUrl(item.videoId)} alt={item.title} />
                    </div>
                    <div className="rm-queue-meta">
                      <div className="rm-queue-name">{item.title}</div>
                      <div className="rm-queue-by">by {item.addedBy}</div>
                      {isCreator && (
                        <button className="rm-play-btn" onClick={() => handlePlay(item)}>
                          ▶ Play now
                        </button>
                      )}
                    </div>
                    <div className="rm-vote-col">
                      <button className="rm-vote-btn up" onClick={() => handleVote(item.id, 1)}>▲</button>
                      <span className={`rm-vote-num ${item.votes > 0 ? "pos" : item.votes < 0 ? "neg" : "zero"}`}>
                        {item.votes > 0 ? `+${item.votes}` : item.votes}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}