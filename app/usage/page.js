"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BrainCircuit, FileText, Database, Puzzle, Search } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --brand: #12b8cd;
    --brand-dark: #3bb978;
    --bg: #f8fafc;
    --card-bg: rgba(255, 255, 255, 0.8);
    --border: rgba(0, 0, 0, 0.05);
  }

  .billing-page * { 
    box-sizing: border-box; 
    font-family: 'Plus Jakarta Sans', sans-serif; 
  }

  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes slideRight { from { width: 0; opacity: 0; } to { width: 100%; opacity: 1; } }

  .glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(18, 184, 205, 0.08);
    border-color: rgba(18, 184, 205, 0.2);
  }

  .gradient-text {
    background: linear-gradient(135deg, #12b8cd 0%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .chart-container {
    height: 200px;
    width: 100%;
    position: relative;
    margin-top: 20px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  .progress-bar-container {
    height: 10px;
    background: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
    margin-top: 12px;
  }

  .line-chart-svg {
    filter: drop-shadow(0 4px 12px rgba(18, 184, 205, 0.2));
  }
`;

function MetricCard({ icon, label, value, suffix = "", pct = null, color = "#12b8cd", delay = "0s", trend = null }) {
  return (
    <div className="glass-card" style={{ animation: `fadeUp 0.6s ease forwards`, animationDelay: delay }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `linear-gradient(135deg, ${color}10 0%, ${color}25 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, border: `1px solid ${color}20`
        }}>{icon}</div>
        {trend && (
          <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            {trend}
          </div>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <p className="stat-value">{value}</p>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>{suffix}</span>
      </div>
      {pct !== null && (
        <div className="progress-bar-container">
          <div style={{
            height: "100%", width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius: 99, transition: "width 1s ease-out"
          }} />
        </div>
      )}
    </div>
  );
}

function UsageChart() {
  const data = [
    { name: 'Feb 1', queries: 12 },
    { name: 'Feb 8', queries: 25 },
    { name: 'Feb 15', queries: 45 },
    { name: 'Feb 22', queries: 30 },
    { name: 'Mar 1', queries: 85 }
  ];
  return (
    <div className="glass-card" style={{ padding: "24px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Usage Trend</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>API queries performed over the last 30 days</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {['Daily', 'Weekly', 'Monthly'].map(t => (
            <span key={t} style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", background: t === 'Weekly' ? '#12b8cd' : '#f1f5f9',
              color: t === 'Weekly' ? '#fff' : '#64748b'
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="chart-container" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#12b8cd" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#12b8cd" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              itemStyle={{ color: '#12b8cd', fontWeight: 700 }}
            />
            <Area
              type="monotone"
              dataKey="queries"
              stroke="#12b8cd"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorQueries)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#12b8cd' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function UsagePage() {
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsage(); }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/usage`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      const data = await res.json();
      setUsage(data);
    } catch (err) {
      console.error("Usage fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#f8fafc" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "#12b8cd", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter, sans-serif" }}>Loading usage data…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!usage) return null;

  const { billing, metrics } = usage;
  const totalSizeKB = metrics.total_size_kb;
  const maxKB = 102400; // 100 MB baseline
  const storageUsed = Math.min(Math.round((totalSizeKB / maxKB) * 100), 100);

  return (
    <div className="billing-page" style={{ height: "100vh", overflowY: "auto", background: "#f8fafc" }}>
      <style>{STYLES}</style>

      {/* ── Navbar ── */}
      <nav style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 72, position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.back()} style={{
            width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Usage Dashboard</h1>
        </div>

        <div style={{
          padding: "8px 20px", borderRadius: 14, background: "linear-gradient(135deg, #12b8cd, #059669)",
          color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 15px rgba(18, 184, 205, 0.2)"
        }}>
          <span style={{ opacity: 0.9 }}>Plan:</span> {billing.plan}
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "40px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Main Stats */}
          <div className="glass-card" style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center"
          }}>
            <p className="stat-label" style={{ color: "#94a3b8" }}>Savings this month</p>
            <h2 style={{ fontSize: 56, fontWeight: 800, margin: "8px 0", letterSpacing: "-0.04em" }}>
              ${billing.savings_usd}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#12b8cd" }} />
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                Estimated value saved using open-source infrastructure
              </p>
            </div>
          </div>

          {/* Plan Info */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p className="stat-label">Model Engine</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b"
              }}><BrainCircuit size={24} /></div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Llama 3.3 70B</p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Processing & Reasoning</p>
              </div>
            </div>
            <button style={{
              marginTop: 24, width: "100%", padding: "12px", borderRadius: 12,
              background: "#0f172a", color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
              cursor: "pointer"
            }}>Upgrade Plan</button>
          </div>
        </div>

        {/* Usage Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
          <MetricCard icon={<FileText size={20} color="#3b82f6" />} label="Documents" value={metrics.total_documents} pct={Math.min(metrics.total_documents * 4, 100)} color="#3b82f6" delay="0.1s" trend="+12%" />
          <MetricCard icon={<Database size={20} color="#8b5cf6" />} label="Storage" value={(totalSizeKB / 1024).toFixed(1)} suffix="MB" pct={storageUsed} color="#8b5cf6" delay="0.2s" trend="+5%" />
          <MetricCard icon={<Puzzle size={20} color="#f59e0b" />} label="Chunks" value={metrics.total_chunks} color="#f59e0b" delay="0.3s" trend="+18%" />
          <MetricCard icon={<Search size={20} color="#12b8cd" />} label="Requests" value={metrics.queries_performed} color="#12b8cd" delay="0.4s" trend="+24%" />
        </div>

        {/* Chart View */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          <UsageChart />

          <div className="glass-card" style={{ background: "#fff" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 20px 0" }}>Infrastructure Health</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { name: "Qdrant Cluster", status: "Operational", color: "#12b8cd" },
                { name: "Embedding API", status: "99.9% Uptime", color: "#12b8cd" },
                { name: "Llama Inference", status: "Low Latency", color: "#3b82f6" }
              ].map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>{s.name}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: s.color,
                    padding: "4px 10px", borderRadius: 8, background: `${s.color}10`
                  }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}