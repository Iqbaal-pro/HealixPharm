"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrders, getOrderDetail as fetchOrderDetail, searchMedicines as searchMeds, approveOrder, updateOrderStatus, confirmPayment, fulfillOrder, cancelOrder, type Order, type OrderDetail, type MedResult, type ApprovalItem } from "../routes/orderRoutes";

type StatusFilter = "all"|"PENDING_VERIFICATION"|"AWAITING_PAYMENT_SELECTION"|"APPROVED"|"FULFILLED"|"CANCELLED";

const statusCfg: Record<string,{bg:string;color:string;label:string}> = {
  PENDING_VERIFICATION:      {bg:"rgba(245,158,11,0.08)",  color:"#f59e0b", label:"Pending"},
  PENDING:                   {bg:"rgba(245,158,11,0.08)",  color:"#f59e0b", label:"Pending"},
  APPROVED:                  {bg:"rgba(74,222,128,0.08)",  color:"#4ade80", label:"Approved"},
  AWAITING_PAYMENT_SELECTION:{bg:"rgba(129,140,248,0.08)", color:"#818cf8", label:"Awaiting Payment Choice"},
  AWAITING_PAYMENT:          {bg:"rgba(129,140,248,0.08)", color:"#818cf8", label:"Awaiting Payment"},
  CONFIRMED:                 {bg:"rgba(56,189,248,0.08)",  color:"#38bdf8", label:"Confirmed (COD)"},
  PAID:                      {bg:"rgba(74,222,128,0.08)",  color:"#4ade80", label:"Paid"},
  PENDING_ON_DELIVERY:       {bg:"rgba(245,158,11,0.08)",  color:"#f59e0b", label:"Pay on Delivery"},
  FULFILLED:                 {bg:"rgba(56,189,248,0.08)",  color:"#38bdf8", label:"Fulfilled"},
  CANCELLED:                 {bg:"rgba(239,68,68,0.08)",   color:"#ef4444", label:"Cancelled"},
  REJECTED:                  {bg:"rgba(239,68,68,0.08)",   color:"#ef4444", label:"Rejected"},
};
const sc = (s:string) => statusCfg[s]??{bg:"rgba(148,163,184,0.08)",color:"#94a3b8",label:s.replace(/_/g," ")};

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<StatusFilter>("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<OrderDetail|null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg]     = useState("");
  const [showApprove, setShowApprove] = useState(false);
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([{medicine_id:0,quantity:1}]);
  const [medSearch, setMedSearch]     = useState<string[]>([""]);
  const [medResults, setMedResults]   = useState<MedResult[][]>([[]]);
  const [medFocused, setMedFocused]   = useState<number|null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try { setOrders(await getOrders(filter!=="all"?filter:undefined)); }
    catch { setOrders([]); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (id: number) => {
    setDetailLoading(true); setActionMsg(""); setShowApprove(false);
    try { setSelected(await fetchOrderDetail(id)); }
    catch { setSelected(null); } finally { setDetailLoading(false); }
  };

  const searchMed = async (q: string, idx: number) => {
    const ms=[...medSearch]; ms[idx]=q; setMedSearch(ms);
    if(q.length<2){const r=[...medResults];r[idx]=[];setMedResults(r);return;}
    try { const data=await searchMeds(q); const r=[...medResults];r[idx]=data;setMedResults(r); } catch{}
  };
  const pickMed = (med: MedResult, idx: number) => {
    const items=[...approvalItems];items[idx]={...items[idx],medicine_id:med.id};setApprovalItems(items);
    const ms=[...medSearch];ms[idx]=`${med.name} (${med.id})`;setMedSearch(ms);
    const mr=[...medResults];mr[idx]=[];setMedResults(mr);
  };
  const addItem    = () => { setApprovalItems(p=>[...p,{medicine_id:0,quantity:1}]); setMedSearch(p=>[...p,""]); setMedResults(p=>[...p,[]]); };
  const removeItem = (idx:number) => { setApprovalItems(p=>p.filter((_,i)=>i!==idx)); setMedSearch(p=>p.filter((_,i)=>i!==idx)); setMedResults(p=>p.filter((_,i)=>i!==idx)); };

  const handleApprove = async () => {
    if(!selected) return;
    const valid=approvalItems.filter(i=>i.medicine_id>0&&i.quantity>0);
    if(!valid.length){setActionMsg("Add at least one medicine.");return;}
    setActionLoading(true); setActionMsg("");
    try { await approveOrder(selected.id,valid); setActionMsg("✓ Order approved."); setShowApprove(false); await openDetail(selected.id); fetchOrders(); }
    catch(e:unknown){setActionMsg(e instanceof Error?e.message:"Approval failed");}
    finally{setActionLoading(false);}
  };

  const handleAction = async (fn:(id:number)=>Promise<unknown>, msg:string) => {
    if(!selected) return;
    setActionLoading(true); setActionMsg("");
    try { await fn(selected.id); setActionMsg(`✓ ${msg}`); await openDetail(selected.id); fetchOrders(); }
    catch(e:unknown){setActionMsg(e instanceof Error?e.message:"Action failed");}
    finally{setActionLoading(false);}
  };

  const handleStatus = async (status:"APPROVED"|"REJECTED") => {
    if(!selected) return;
    setActionLoading(true); setActionMsg("");
    try { await updateOrderStatus(selected.id,status); setActionMsg(`✓ Order ${status.toLowerCase()}.`); await openDetail(selected.id); fetchOrders(); }
    catch(e:unknown){setActionMsg(e instanceof Error?e.message:"Failed");}
    finally{setActionLoading(false);}
  };

  const filtered = orders.filter(o => {
    const matchSearch = String(o.id).includes(search)||(o.phone??"").includes(search)||o.token?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "all") return true;
    if (filter === "AWAITING_PAYMENT_SELECTION") return ["AWAITING_PAYMENT_SELECTION","AWAITING_PAYMENT","CONFIRMED","PAID","PENDING_ON_DELIVERY"].includes(o.status);
    if (filter === "CANCELLED") return ["CANCELLED","REJECTED"].includes(o.status);
    if (filter === "PENDING_VERIFICATION") return ["PENDING_VERIFICATION","PENDING"].includes(o.status);
    return o.status === filter;
  });
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o=>o.status==="PENDING_VERIFICATION"||o.status==="PENDING").length,
    payment:   orders.filter(o=>o.status==="AWAITING_PAYMENT_SELECTION"||o.status==="AWAITING_PAYMENT"||o.status==="CONFIRMED"||o.status==="PAID"||o.status==="PENDING_ON_DELIVERY").length,
    fulfilled: orders.filter(o=>o.status==="FULFILLED").length,
    cancelled: orders.filter(o=>o.status==="CANCELLED"||o.status==="REJECTED").length,
  };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.22)", fontSize: 22, boxShadow: "0 0 18px rgba(129,140,248,0.1)" }}>📦</div>
          <div>
            <h1 className="page-title gradient-text">Orders</h1>
            <p className="page-sub">WhatsApp bot orders — approve, fulfill and manage</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={fetchOrders}>↻ Refresh</button>
      </div>

      {/* Filter pills */}
      <div className="filter-pills fade-2 mb-20">
        {[
          {label:`All (${counts.all})`,             key:"all",                   color:"#38bdf8"},
          {label:`Pending (${counts.pending})`,     key:"PENDING_VERIFICATION",  color:"#f59e0b"},
          {label:`Payment (${counts.payment})`,     key:"AWAITING_PAYMENT_SELECTION", color:"#818cf8"},
          {label:`Fulfilled (${counts.fulfilled})`, key:"FULFILLED",             color:"#4ade80"},
          {label:`Cancelled (${counts.cancelled})`, key:"CANCELLED",             color:"#ef4444"},
        ].map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key as StatusFilter)}
            className="filter-pill"
            style={{background:filter===f.key?`${f.color}18`:"rgba(148,163,184,0.06)", color:filter===f.key?f.color:"#475569", boxShadow:filter===f.key?`0 0 0 1px ${f.color}40`:"none"}}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={`orders-grid fade-3 ${selected?"orders-grid-split":"orders-grid-full"}`}>

        {/* Orders table */}
        <div className="glass-panel">
          <div className="toolbar">
            <div className="search-wrap search-flex">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="input-field search-sm" placeholder="Search order ID, phone, token…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <span className="count-label">{filtered.length} orders</span>
          </div>

          {loading
            ? <div className="loading-cell"><div className="spinner-lg"/>Loading orders…</div>
            : filtered.length===0
              ? <div className="loading-cell">{orders.length===0?"No orders yet — patients order via WhatsApp":"No orders match your filter"}</div>
              : (
                <div className="table-wrap">
                  <table className="full-table">
                    <thead><tr className="thead-border">{["Order","Phone / Token","Status","Amount","Date",""].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
                    <tbody>
                      {filtered.map(o=>{
                        const s=sc(o.status); const isSel=selected?.id===o.id;
                        return (
                          <tr key={o.id} className="tr-hover tr-border" onClick={()=>openDetail(o.id)} style={{background:isSel?"rgba(56,189,248,0.04)":"transparent"}}>
                            <td className="td td-order-id">#{o.id}</td>
                            <td className="td td-phone-cell">
                              <div className="td-phone">{o.phone??"—"}</div>
                              <div className="td-token">{o.token?.slice(0,14)}…</div>
                            </td>
                            <td className="td"><span className="badge" style={{background:s.bg,color:s.color}}>{s.label}</span></td>
                            <td className="td td-amount">{o.total_amount!=null?`LKR ${o.total_amount.toFixed(2)}`:"—"}</td>
                            <td className="td td-date">{new Date(o.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</td>
                            <td className="td td-arrow">→</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          }
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="glass-panel detail-panel">
            <div className="detail-header">
              <div>
                <h2 className="detail-title">Order #{selected.id}</h2>
                <p className="detail-date">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button className="modal-close" onClick={()=>{setSelected(null);setActionMsg("");setShowApprove(false);}}>×</button>
            </div>

            {detailLoading ? <div className="loading-cell"><span className="spinner-lg"/></div> : (
              <>
                {/* Status grid */}
                <div className="grid-2 mb-14">
                  {[
                    {label:"Status",  value:sc(selected.status).label,                                        color:sc(selected.status).color},
                    {label:"Payment", value:selected.payment_status??"—",                                     color:"#94a3b8"},
                    {label:"Method",  value:selected.payment_method??"—",                                     color:"#94a3b8"},
                    {label:"Total",   value:selected.total_amount!=null?`LKR ${selected.total_amount.toFixed(2)}`:"—", color:"#f1f5f9"},
                  ].map(s=>(
                    <div key={s.label} className="stat-mini">
                      <div className="stat-mini-label">{s.label}</div>
                      <div className="stat-mini-value" style={{color:s.color}}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Prescription */}
                {selected.prescription_url && (
                  <div className="mb-14">
                    <div className="section-label mb-6">Prescription</div>
                    <a href={selected.prescription_url} target="_blank" rel="noreferrer">
                      <img src={selected.prescription_url} alt="prescription" className="rx-img"/>
                    </a>
                  </div>
                )}

                {/* Items */}
                {selected.items?.length>0 && (
                  <div className="mb-14">
                    <div className="section-label mb-6">Items</div>
                    <div className="col g-6">
                      {selected.items.map((item,i)=>(
                        <div key={i} className="item-row">
                          <div className="item-name">{item.medicine_name??`MED-${item.medicine_id}`}</div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {item.unit_price!=null && <span style={{ fontSize:12, color:"#475569" }}>LKR {item.unit_price.toFixed(2)} ×</span>}
                            <div className="item-qty">×{item.quantity}</div>
                            {item.subtotal!=null && <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:600 }}>= LKR {item.subtotal.toFixed(2)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selected.total_amount!=null && (
                      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10, paddingTop:10, borderTop:"1px solid rgba(148,163,184,0.08)" }}>
                        <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>Total: LKR {selected.total_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action message */}
                {actionMsg && <div className={`msg-box mb-14 ${actionMsg.startsWith("✓")?"msg-box-success":"msg-box-error"}`}>{actionMsg}</div>}

                {/* Approve flow */}
                {showApprove && (
                  <div className="approve-box">
                    <div className="approve-box-title">Select medicines to approve</div>
                    {approvalItems.map((item,idx)=>(
                      <div key={idx} className="approve-item">
                        <div className="approve-item-grid">
                          <div className="relative">
                            <input className="input-field search-sm" placeholder="Search medicine…" value={medSearch[idx]} onChange={e=>searchMed(e.target.value,idx)} onFocus={()=>setMedFocused(idx)} onBlur={()=>setTimeout(()=>setMedFocused(null),200)}/>
                            {medFocused===idx&&medResults[idx]?.length>0&&(
                              <div className="med-dropdown">
                                {medResults[idx].map(m=>(
                                  <div key={m.id} className="med-result-item" onClick={()=>pickMed(m,idx)}>
                                    <span className="med-name">{m.name}</span>
                                    <span className="med-price">LKR {m.selling_price}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input className="input-field input-center" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e=>{const a=[...approvalItems];a[idx]={...a[idx],quantity:parseInt(e.target.value)||1};setApprovalItems(a);}}/>
                          <button onClick={()=>removeItem(idx)} disabled={approvalItems.length===1} className="remove-btn" style={{opacity:approvalItems.length===1?0.3:1}}>×</button>
                        </div>
                      </div>
                    ))}
                    <div className="approve-actions">
                      <button onClick={addItem} className="btn-manual btn-sm-font">+ Add Medicine</button>
                      <button onClick={handleApprove} disabled={actionLoading} className="btn-primary btn-primary-sm">
                        {actionLoading?<><span className="spinner"/>Approving…</>:"Confirm Approval"}
                      </button>
                      <button onClick={()=>setShowApprove(false)} className="btn-ghost btn-ghost-xs">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="action-btns">
                  {(selected.status==="PENDING_VERIFICATION"||selected.status==="PENDING")&&!showApprove&&(
                    <>
                      <button onClick={()=>{setShowApprove(true);setApprovalItems([{medicine_id:0,quantity:1}]);setMedSearch([""]);setMedResults([[]]); }} className="btn-action btn-action-green">✓ Approve Order</button>
                      <button onClick={()=>handleStatus("REJECTED")} disabled={actionLoading} className="btn-action btn-action-red">{actionLoading?<><span className="spinner"/>Processing…</>:"✕ Reject Order"}</button>
                    </>
                  )}
                  {selected.status==="APPROVED"&&(
                    <>
                      <button onClick={()=>handleAction(confirmPayment,"Payment confirmed.")} disabled={actionLoading} className="btn-action btn-action-blue">{actionLoading?<><span className="spinner"/>Processing…</>:"💳 Confirm Payment"}</button>
                      <button onClick={()=>handleAction(fulfillOrder,"Order fulfilled.")} disabled={actionLoading} className="btn-action btn-action-green">{actionLoading?<><span className="spinner"/>Processing…</>:"📦 Mark Fulfilled"}</button>
                      <button onClick={()=>handleAction(cancelOrder,"Order cancelled.")} disabled={actionLoading} className="btn-action btn-action-red">{actionLoading?<><span className="spinner"/>Processing…</>:"✕ Cancel"}</button>
                    </>
                  )}
                  {selected.status==="AWAITING_PAYMENT_SELECTION"&&(
                    <div className="order-closed" style={{ color:"#818cf8", background:"rgba(129,140,248,0.06)", border:"1px solid rgba(129,140,248,0.15)", borderRadius:10, padding:"10px 14px", fontSize:13 }}>
                      ⏳ Waiting for patient to choose payment method via WhatsApp.
                    </div>
                  )}
                  {selected.status==="AWAITING_PAYMENT"&&(
                    <>
                      <div className="order-closed" style={{ color:"#818cf8", background:"rgba(129,140,248,0.06)", border:"1px solid rgba(129,140,248,0.15)", borderRadius:10, padding:"10px 14px", fontSize:13 }}>
                        ⏳ Waiting for online payment (PayHere link sent to patient).
                      </div>
                      <button onClick={()=>handleAction(confirmPayment,"Payment confirmed.")} disabled={actionLoading} className="btn-action btn-action-blue">{actionLoading?<><span className="spinner"/>Processing…</>:"💳 Mark as Paid Manually"}</button>
                      <button onClick={()=>handleAction(cancelOrder,"Order cancelled.")} disabled={actionLoading} className="btn-action btn-action-red">{actionLoading?<><span className="spinner"/>Processing…</>:"✕ Cancel"}</button>
                    </>
                  )}
                  {(selected.status==="CONFIRMED"||selected.status==="PAID"||selected.status==="PENDING_ON_DELIVERY")&&(
                    <>
                      <button onClick={()=>handleAction(fulfillOrder,"Order fulfilled.")} disabled={actionLoading} className="btn-action btn-action-green">{actionLoading?<><span className="spinner"/>Processing…</>:"📦 Mark Fulfilled"}</button>
                      <button onClick={()=>handleAction(cancelOrder,"Order cancelled.")} disabled={actionLoading} className="btn-action btn-action-red">{actionLoading?<><span className="spinner"/>Processing…</>:"✕ Cancel"}</button>
                    </>
                  )}
                  {(selected.status==="FULFILLED"||selected.status==="CANCELLED"||selected.status==="REJECTED")&&(
                    <div className="order-closed">
                      This order is {selected.status.toLowerCase()} — no further actions available.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}