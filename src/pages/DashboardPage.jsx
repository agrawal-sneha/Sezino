import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Users, Eye, MousePointerClick, Globe, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { trackPageView, getAnalyticsStats } from '../services/api';

// ─── Tiny SVG Line Chart ───────────────────────────────────────────────────

function LineChart({ data, color = '#ffffff', height = 200 }) {
    const svgRef = useRef(null);
    const [hovered, setHovered] = useState(null);

    const W = 800;
    const H = height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerW = W - padding.left - padding.right;
    const innerH = H - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map((d) => d.visits), 1);
    const minVal = Math.min(...data.map((d) => d.visits), 0);

    const xScale = (i) => padding.left + (i / (data.length - 1)) * innerW;
    const yScale = (v) => padding.top + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH;

    const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.visits), ...d }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1].x},${H - padding.bottom} L${points[0].x},${H - padding.bottom} Z`;

    // Y-axis gridlines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        y: padding.top + innerH - t * innerH,
        label: Math.round(minVal + t * (maxVal - minVal)),
    }));

    // X-axis labels – show ~6 evenly spaced
    const xLabels = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1);

    const formatDate = (iso) => {
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="chart-container" style={{ position: 'relative' }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
                onMouseLeave={() => setHovered(null)}
            >
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid lines */}
                {gridLines.map((g, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left} y1={g.y}
                            x2={W - padding.right} y2={g.y}
                            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                        />
                        <text
                            x={padding.left - 8} y={g.y + 4}
                            fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end"
                        >
                            {g.label}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <path d={areaD} fill="url(#areaGrad)" />

                {/* Line */}
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />

                {/* X-axis labels */}
                {xLabels.map((d, i) => {
                    const idx = data.findIndex((dd) => dd.date === d.date);
                    return (
                        <text
                            key={i}
                            x={xScale(idx)} y={H - 5}
                            fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle"
                        >
                            {formatDate(d.date)}
                        </text>
                    );
                })}

                {/* Hover zones */}
                {points.map((p, i) => (
                    <rect
                        key={i}
                        x={p.x - innerW / (2 * (data.length - 1))}
                        y={0} width={innerW / (data.length - 1)} height={H}
                        fill="transparent"
                        onMouseEnter={() => setHovered(p)}
                    />
                ))}

                {/* Hover indicator */}
                {hovered && (
                    <g>
                        <line
                            x1={hovered.x} y1={padding.top}
                            x2={hovered.x} y2={H - padding.bottom}
                            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3"
                        />
                        <circle cx={hovered.x} cy={hovered.y} r="5" fill={color} filter="url(#glow)" />
                        <circle cx={hovered.x} cy={hovered.y} r="3" fill="#000" />
                    </g>
                )}
            </svg>

            {/* Tooltip */}
            {hovered && (
                <div
                    className="chart-tooltip"
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                    }}
                >
                    <div className="chart-tooltip-date">{new Date(hovered.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="chart-tooltip-value">{hovered.visits.toLocaleString()} visits</div>
                </div>
            )}
        </div>
    );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────

function MiniBarChart({ data }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="mini-bar-chart">
            {data.map((d, i) => (
                <div key={i} className="mini-bar-row">
                    <span className="mini-bar-label">{d.label}</span>
                    <div className="mini-bar-track">
                        <div
                            className="mini-bar-fill"
                            style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
                        />
                    </div>
                    <span className="mini-bar-value">{d.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, color, subtitle }) {
    const positive = change >= 0;
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={18} />
                </div>
                <span className="stat-label">{label}</span>
            </div>
            <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            {subtitle && <div className="stat-subtitle">{subtitle}</div>}
            {change !== undefined && (
                <div className={`stat-change ${positive ? 'positive' : 'negative'}`}>
                    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{Math.abs(change)}% vs {subtitle || 'prev period'}</span>
                </div>
            )}
        </div>
    );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({ segments }) {
    const total = segments.reduce((s, sg) => s + sg.value, 0);
    let cumulative = 0;

    const R = 60;
    const cx = 80;
    const cy = 80;

    const describeArc = (start, end) => {
        const startAngle = (start / total) * 2 * Math.PI - Math.PI / 2;
        const endAngle = (end / total) * 2 * Math.PI - Math.PI / 2;
        const laf = end - start > total / 2 ? 1 : 0;
        const x1 = cx + R * Math.cos(startAngle);
        const y1 = cy + R * Math.sin(startAngle);
        const x2 = cx + R * Math.cos(endAngle);
        const y2 = cy + R * Math.sin(endAngle);
        return `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${laf},1 ${x2},${y2} Z`;
    };

    return (
        <div className="donut-wrap">
            <svg viewBox="0 0 160 160" style={{ width: 160, height: 160, flexShrink: 0 }}>
                <circle cx={cx} cy={cy} r={R} fill="var(--bg-tertiary)" />
                {segments.map((sg, i) => {
                    const path = describeArc(cumulative, cumulative + sg.value);
                    cumulative += sg.value;
                    return (
                        <path key={i} d={path} fill={sg.color} opacity="0.85">
                            <title>{sg.label}: {((sg.value / total) * 100).toFixed(1)}%</title>
                        </path>
                    );
                })}
                {/* inner cutout */}
                <circle cx={cx} cy={cy} r={R * 0.6} fill="var(--bg-secondary)" />
                <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
                    {total.toLocaleString()}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                    TOTAL
                </text>
            </svg>
            <div className="donut-legend">
                {segments.map((sg, i) => (
                    <div key={i} className="donut-legend-item">
                        <span className="donut-dot" style={{ background: sg.color }} />
                        <span className="donut-legend-label">{sg.label}</span>
                        <span className="donut-legend-pct">{((sg.value / total) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────

const REFERRERS = [
    { label: 'Direct / None', value: 38, color: '#6366f1' },
    { label: 'Twitter / X', value: 24, color: '#1d9bf0' },
    { label: 'Google Search', value: 19, color: '#ea4335' },
    { label: 'Instagram', value: 11, color: '#e1306c' },
    { label: 'Other', value: 8, color: '#71717a' },
];

const DEVICES = [
    { label: 'Mobile', value: 52, color: '#8b5cf6' },
    { label: 'Desktop', value: 36, color: '#06b6d4' },
    { label: 'Tablet', value: 12, color: '#f59e0b' },
];

const TOP_EVENTS = [
    { title: 'Sezino Launch Party', views: 1420, badge: '🔥 Trending' },
    { title: 'AI Agents Workshop', views: 987, badge: '' },
    { title: 'Solana Hacker House', views: 874, badge: '' },
    { title: 'React Conf 2026', views: 652, badge: '' },
    { title: 'Sunrise Yoga & Sound Bath', views: 541, badge: '' },
];

const TIME_RANGES = ['7D', '14D', '30D'];

export default function DashboardPage() {
    const [range, setRange] = useState('30D');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Track this page view
        trackPageView({ path: '/dashboard', userAgent: navigator.userAgent });
        
        async function loadStats() {
            try {
                const data = await getAnalyticsStats();
                // Transform to expected shape
                // For now, just set raw stats; we'll adapt components later
                setStats(data);
            } catch (error) {
                console.error('Failed to load analytics:', error);
                // Fallback to empty stats
                setStats({
                    totalVisits: 0,
                    todayVisits: 0,
                    weeklyVisits: 0,
                    popularPaths: [],
                    referrers: []
                });
            }
        }
        loadStats();
    }, []);

    // Mock chart data for now (backend doesn't provide historical daily data yet)
    const chartData = useMemo(() => {
        // Generate mock data based on total visits
        const days = range === '7D' ? 7 : range === '14D' ? 14 : 30;
        const base = stats?.totalVisits || 1000;
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            const dateStr = date.toISOString().slice(0, 10);
            // Simulate random visits around average
            const avg = Math.floor(base / days);
            const visits = avg + Math.floor(Math.random() * avg * 0.5) - Math.floor(avg * 0.25);
            data.push({ date: dateStr, visits: Math.max(1, visits) });
        }
        return data;
    }, [stats, range]);

    // Transform popularPaths to bar chart data
    const pageData = useMemo(() => {
        if (!stats?.popularPaths) return [];
        return stats.popularPaths.map((p, i) => ({
            label: p.path.replace('/', '').charAt(0).toUpperCase() + p.path.replace('/', '').slice(1) || 'Home',
            value: p.views,
            color: ['#6366f1', '#06b6d4', '#f59e0b', '#71717a'][i] || '#6366f1'
        }));
    }, [stats]);

    if (!stats) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">Loading analytics…</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-title-group">
                    <div className="dashboard-icon-badge">
                        <BarChart2 size={22} />
                    </div>
                    <div>
                        <h1 className="dashboard-title">Analytics</h1>
                        <p className="dashboard-subtitle">Track visitors and measure your site's reach</p>
                    </div>
                </div>
                <div className="live-badge">
                    <span className="live-dot" />
                    Live
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                <StatCard
                    icon={Users}
                    label="Total Visitors"
                    value={stats.totalVisits}
                    color="#6366f1"
                    subtitle="all time"
                />
                <StatCard
                    icon={Eye}
                    label="Today"
                    value={stats.todayVisits}
                    change={stats.todayVisits > 0 ? 10 : 0} // Mock change
                    color="#06b6d4"
                    subtitle="yesterday"
                />
                <StatCard
                    icon={Activity}
                    label="This Week"
                    value={stats.weeklyVisits}
                    change={stats.weeklyVisits > 0 ? 15 : 0} // Mock change
                    color="#8b5cf6"
                    subtitle="last week"
                />
                <StatCard
                    icon={MousePointerClick}
                    label="Avg. Daily"
                    value={Math.round(stats.weeklyVisits / 7)}
                    color="#f59e0b"
                    subtitle="last 7 days"
                />
            </div>

            {/* Line Chart card */}
            <div className="dashboard-card chart-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <TrendingUp size={18} />
                        Visitor Trend
                    </h2>
                    <div className="range-tabs">
                        {TIME_RANGES.map((r) => (
                            <button
                                key={r}
                                className={`range-tab ${range === r ? 'active' : ''}`}
                                onClick={() => setRange(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <LineChart data={chartData} color="#6366f1" height={220} />
            </div>

            {/* Bottom 3-column grid */}
            <div className="dashboard-bottom-grid">
                {/* Traffic Sources */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2 className="card-title"><Globe size={18} /> Traffic Sources</h2>
                    </div>
                    <MiniBarChart data={REFERRERS} />
                </div>

                {/* Devices */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2 className="card-title">Device Breakdown</h2>
                    </div>
                    <DonutChart segments={DEVICES} />
                </div>

                {/* Pages */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2 className="card-title">Top Pages</h2>
                    </div>
                    <MiniBarChart data={pageData} />
                </div>
            </div>

            {/* Top Events Table */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h2 className="card-title"><Eye size={18} /> Most Viewed Events</h2>
                </div>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Event</th>
                            <th>Page Views</th>
                            <th>Share</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {TOP_EVENTS.map((ev, i) => {
                            const total = TOP_EVENTS.reduce((s, e) => s + e.views, 0);
                            const pct = ((ev.views / total) * 100).toFixed(1);
                            return (
                                <tr key={i}>
                                    <td className="rank-cell">{i + 1}</td>
                                    <td>
                                        <span className="event-name">{ev.title}</span>
                                        {ev.badge && <span className="trending-badge">{ev.badge}</span>}
                                    </td>
                                    <td className="views-cell">{ev.views.toLocaleString()}</td>
                                    <td>
                                        <div className="table-bar-track">
                                            <div className="table-bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </td>
                                    <td className="pct-cell">{pct}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer note */}
            <p className="dashboard-note">
                Data is tracked via backend API. Visitor counts are recorded when users navigate Sezino pages. The chart shows simulated data for the last {range}.
            </p>
        </div>
    );
}