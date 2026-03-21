"use client";
import { useState, useEffect, useRef } from "react";
import { getSupportQueue, acceptTicket, sendAgentMessage, closeTicket, getTicketMessages, type SupportTicket, type SupportMessage } from "../routes/supportRoutes";

const AGENT_NAME = "Pharmacist";

export default function SupportPage() {
  const [queue, setQueue]               = useState<SupportTicket[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages]         = useState<SupportMessage[]>([]);
  const [message, setMessage]           = useState("");
  const [sending, setSending]           = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]                   = useState("");
  const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatRef                         = useRef<HTMLDivElement>(null);

  const fetchQueue = async () => {
    try { setQueue(await getSupportQueue()); }
    catch { setQueue([]); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      const msgs = await getTicketMessages(ticketId);
      setMessages(msgs);
      // Scroll to bottom
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Poll messages every 3 seconds when a ticket is active
  useEffect(() => {
    if (!activeTicket) return;
    fetchMessages(activeTicket.id);
    const msgInterval = setInterval(() => fetchMessages(activeTicket.id), 3000);
    return () => clearInterval(msgInterval);
  }, [activeTicket]);

  const handleAccept = async (ticket: SupportTicket) => {
    setActionLoading(true); setMsg("");
    try {
      await acceptTicket(ticket.id, AGENT_NAME);
      setActiveTicket(ticket);
      setMessages([]);
      setMsg("✓ Connected to patient.");
      fetchQueue();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to accept"); }
    finally { setActionLoading(false); }
  };

  const handleSend = async () => {
    if (!activeTicket || !message.trim()) return;
    setSending(true);
    try {
      await sendAgentMessage(activeTicket.id, message.trim());
      setMessage("");
      // Optimistically add the message
      setMessages(p => [...p, {
        id: Date.now(),
        sender_type: "AGENT",
        body: message.trim(),
        created_at: new Date().toISOString(),
      }]);
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to send"); }
    finally { setSending(false); }
  };

  const handleClose = async () => {
    if (!activeTicket) return;
    setActionLoading(true);
    try {
      await closeTicket(activeTicket.id);
      setMsg("✓ Chat closed.");
      setActiveTicket(null);
      setMessages([]);
      fetchQueue();
      setTimeout(() => setMsg(""), 3000);
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to close"); }
    finally { setActionLoading(false); }
  };


  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", boxShadow: "0 0 18px rgba(56,189,248,0.1)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title gradient-text">Live Support</h1>
            <p className="page-sub">WhatsApp patient support queue</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={fetchQueue}>↻ Refresh</button>
      </div>

      {msg && <div className={`msg-box fade mb-20 ${msg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: activeTicket ? "1fr 1.4fr" : "1fr", gap: 20 }}>

        {/* Queue */}
        <div className="glass-panel fade-2">
          <div className="toolbar">
            <h2 className="panel-title">Waiting Queue</h2>
            <span className="count-label">{queue.length} waiting</span>
          </div>
          {loading
            ? <div className="loading-cell"><div className="spinner-lg" />Loading queue…</div>
            : queue.length === 0
              ? <div className="loading-cell">🟢 No patients waiting</div>
              : (
                <div className="table-wrap">
                  <table className="full-table">
                    <thead>
                      <tr className="thead-border">
                        {["Ticket", "Phone", "Waiting Since", ""].map(h => <th key={h} className="th">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map(t => (
                        <tr key={t.id} className="tr-hover tr-border">
                          <td className="td td-order-id">#{t.id}</td>
                          <td className="td td-phone-cell"><div className="td-phone">{t.user_phone ?? "—"}</div></td>
                          <td className="td td-date">{new Date(t.created_at).toLocaleTimeString()}</td>
                          <td className="td">
                            <button
                              className="btn-action btn-action-green"
                              style={{ padding: "6px 14px", fontSize: 12 }}
                              onClick={() => handleAccept(t)}
                              disabled={actionLoading}
                            >
                              Accept
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          }
        </div>

        {/* Active chat */}
        {activeTicket && (
          <div className="glass-panel fade-2" style={{ display: "flex", flexDirection: "column" }}>
            <div className="toolbar">
              <div>
                <h2 className="panel-title">Chat — {activeTicket.user_phone ?? `Ticket #${activeTicket.id}`}</h2>
                <p className="panel-sub">Messages update every 3 seconds</p>
              </div>
              <button className="btn-action btn-action-red" style={{ padding: "6px 14px", fontSize: 12 }} onClick={handleClose} disabled={actionLoading}>
                End Chat
              </button>
            </div>

            {/* Chat messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 300, maxHeight: 400 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#334155", fontSize: 13, marginTop: 40 }}>No messages yet. Patient messages will appear here.</div>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.sender_type === "AGENT" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", borderRadius: m.sender_type === "AGENT" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.sender_type === "AGENT" ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${m.sender_type === "AGENT" ? "rgba(56,189,248,0.25)" : "rgba(255,255,255,0.08)"}`,
                    fontSize: 13, color: "#e2e8f0", lineHeight: 1.5,
                  }}>
                    {m.body}
                  </div>
                  <span style={{ fontSize: 10, color: "#334155", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                    {m.sender_type === "AGENT" ? "You" : "Patient"} · {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Type your message…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  style={{ resize: "none", flex: 1, marginBottom: 0 }}
                />
                <button
                  className="btn-primary"
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  style={{ alignSelf: "flex-end", padding: "10px 16px", whiteSpace: "nowrap" }}
                >
                  {sending ? <span className="spinner" /> : "Send"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}