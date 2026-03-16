"use client";
import { useState, useEffect, useRef } from "react";
import { getSupportQueue, acceptTicket, sendAgentMessage, closeTicket, type SupportTicket } from "../routes/supportRoutes";

const AGENT_NAME = "Pharmacist";

export default function SupportPage() {
  const [queue, setQueue]             = useState<SupportTicket[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage]         = useState("");
  const [sending, setSending]         = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]                 = useState("");
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = async () => {
    try { setQueue(await getSupportQueue()); }
    catch { setQueue([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, 10000); // poll every 10s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleAccept = async (ticket: SupportTicket) => {
    setActionLoading(true); setMsg("");
    try {
      await acceptTicket(ticket.id, AGENT_NAME);
      setActiveTicket(ticket);
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
      setMsg("✓ Message sent via WhatsApp.");
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
      fetchQueue();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to close"); }
    finally { setActionLoading(false); }
  };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            className="page-icon"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.22)",
              boxShadow: "0 0 18px rgba(56,189,248,0.1)"
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
            >
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

      <div style={{ display: "grid", gridTemplateColumns: activeTicket ? "1fr 1fr" : "1fr", gap: 20 }}>

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
          <div className="glass-panel fade-2">
            <div className="toolbar">
              <div>
                <h2 className="panel-title">Chat — {activeTicket.user_phone ?? `Ticket #${activeTicket.id}`}</h2>
                <p className="panel-sub">Messages sent via WhatsApp</p>
              </div>
              <button className="btn-action btn-action-red" style={{ padding: "6px 14px", fontSize: 12 }} onClick={handleClose} disabled={actionLoading}>
                End Chat
              </button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <div className="warn-box mb-16" style={{ fontSize: 12 }}>
                Messages you type here are sent directly to the patient via WhatsApp.
              </div>
              <div className="field-label mb-6">Send Message</div>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Type your message…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ resize: "vertical", marginBottom: 10 }}
              />
              <button className="btn-primary" onClick={handleSend} disabled={sending || !message.trim()}>
                {sending ? <><span className="spinner" />Sending…</> : "📤 Send via WhatsApp"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}