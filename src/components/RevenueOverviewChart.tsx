import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  CreditCard,
  Layers,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Wallet,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { SubscriptionPayment } from '../types';

interface RevenueOverviewChartProps {
  subPayments: SubscriptionPayment[];
  dashboardSession?: string;
  selectedMonth?: string;
}

export const RevenueOverviewChart: React.FC<RevenueOverviewChartProps> = ({
  subPayments = [],
  dashboardSession = '2026-27',
  selectedMonth
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'UPI' | 'CASH' | 'ONLINE'>('ALL');
  const [showChannelBreakdown, setShowChannelBreakdown] = useState<boolean>(true);

  // Month ordering & normalizer
  const monthOrderMap: Record<string, number> = {
    'april': 1, 'may': 2, 'june': 3, 'july': 4,
    'august': 5, 'september': 6, 'october': 7, 'november': 8,
    'december': 9, 'january': 10, 'february': 11, 'march': 12
  };

  // Filter valid successful payments based on mode
  const filteredPayments = useMemo(() => {
    return subPayments.filter((p) => {
      // Must be SUCCESS or undefined (assume legacy seed is success if not marked failed)
      if (p.status === 'FAILED') return false;
      if (methodFilter === 'ALL') return true;
      if (methodFilter === 'UPI') return p.paymentMethod === 'UPI';
      if (methodFilter === 'CASH') return p.paymentMethod === 'CASH';
      if (methodFilter === 'ONLINE') {
        return p.paymentMethod === 'ONLINE' || p.paymentMethod === 'CARD' || p.paymentMethod === 'NET_BANKING';
      }
      return true;
    });
  }, [subPayments, methodFilter]);

  // Aggregate monthly trends from subPayments
  const { chartData, kpis } = useMemo(() => {
    const monthlyBuckets: Record<
      string,
      {
        rawMonth: string;
        displayMonth: string;
        revenue: number;
        transactions: number;
        upi: number;
        cash: number;
        online: number;
      }
    > = {};

    // Standard session template months
    const sessionYear = dashboardSession.startsWith('2026') ? 2026 : 2025;
    const defaultMonths = [
      `April ${sessionYear}`,
      `May ${sessionYear}`,
      `June ${sessionYear}`,
      `July ${sessionYear}`,
      `August ${sessionYear}`,
      `September ${sessionYear}`,
      `October ${sessionYear}`,
      `November ${sessionYear}`,
      `December ${sessionYear}`,
      `January ${sessionYear + 1}`,
      `February ${sessionYear + 1}`,
      `March ${sessionYear + 1}`
    ];

    // Seed empty buckets
    defaultMonths.forEach((m) => {
      const parts = m.split(' ');
      const shortName = `${parts[0].slice(0, 3)} '${parts[1].slice(-2)}`;
      monthlyBuckets[m] = {
        rawMonth: m,
        displayMonth: shortName,
        revenue: 0,
        transactions: 0,
        upi: 0,
        cash: 0,
        online: 0
      };
    });

    // Populate with actual subPayments
    filteredPayments.forEach((p) => {
      const m = p.month || 'Other';
      if (!monthlyBuckets[m]) {
        const parts = m.split(' ');
        const shortName = parts.length > 1 ? `${parts[0].slice(0, 3)} '${parts[1].slice(-2)}` : m;
        monthlyBuckets[m] = {
          rawMonth: m,
          displayMonth: shortName,
          revenue: 0,
          transactions: 0,
          upi: 0,
          cash: 0,
          online: 0
        };
      }

      const amt = Number(p.amountPaid) || 0;
      monthlyBuckets[m].revenue += amt;
      monthlyBuckets[m].transactions += 1;

      if (p.paymentMethod === 'UPI') {
        monthlyBuckets[m].upi += amt;
      } else if (p.paymentMethod === 'CASH') {
        monthlyBuckets[m].cash += amt;
      } else {
        monthlyBuckets[m].online += amt;
      }
    });

    // Sort chronologically based on month name and year
    const sortedData = Object.values(monthlyBuckets).sort((a, b) => {
      const parseYearMonth = (str: string) => {
        const parts = str.toLowerCase().split(' ');
        const mIndex = monthOrderMap[parts[0]] || 99;
        const yr = parseInt(parts[1], 10) || 2026;
        return yr * 100 + mIndex;
      };
      return parseYearMonth(a.rawMonth) - parseYearMonth(b.rawMonth);
    });

    // Calculate overall KPIs
    const totalCollected = filteredPayments.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const totalTxns = filteredPayments.length;
    const upiCollected = filteredPayments
      .filter((p) => p.paymentMethod === 'UPI')
      .reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const cashCollected = filteredPayments
      .filter((p) => p.paymentMethod === 'CASH')
      .reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const onlineCollected = filteredPayments
      .filter((p) => p.paymentMethod !== 'UPI' && p.paymentMethod !== 'CASH')
      .reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);

    // Peak month calculation
    let peakMonth = { month: 'N/A', amount: 0 };
    sortedData.forEach((d) => {
      if (d.revenue > peakMonth.amount) {
        peakMonth = { month: d.rawMonth, amount: d.revenue };
      }
    });

    const activeMonthsWithRevenue = sortedData.filter((d) => d.revenue > 0).length;
    const avgMonthly = activeMonthsWithRevenue > 0 ? Math.round(totalCollected / activeMonthsWithRevenue) : 0;

    return {
      chartData: sortedData,
      kpis: {
        totalCollected,
        totalTxns,
        avgMonthly,
        peakMonth,
        upiCollected,
        cashCollected,
        onlineCollected,
        upiPercent: totalCollected > 0 ? Math.round((upiCollected / totalCollected) * 100) : 0,
        cashPercent: totalCollected > 0 ? Math.round((cashCollected / totalCollected) * 100) : 0,
        onlinePercent: totalCollected > 0 ? Math.round((onlineCollected / totalCollected) * 100) : 0
      }
    };
  }, [filteredPayments, dashboardSession]);

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
            <span className="font-display font-black text-amber-400 text-xs tracking-wide">
              {dataPoint?.rawMonth || label}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
              {dataPoint?.transactions || 0} Txns
            </span>
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-emerald-400 font-bold">
              <span>Total Revenue:</span>
              <span className="font-mono text-sm">₹{(dataPoint?.revenue || 0).toLocaleString('en-IN')}</span>
            </div>

            {showChannelBreakdown && (
              <div className="pt-1.5 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> UPI:
                  </span>
                  <span className="font-mono font-medium">₹{(dataPoint?.upi || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Cash:
                  </span>
                  <span className="font-mono font-medium">₹{(dataPoint?.cash || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Digital/Card:
                  </span>
                  <span className="font-mono font-medium">₹{(dataPoint?.online || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="card-revenue-overview-chart"
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-5"
    >
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp size={18} />
            </span>
            <h4 className="font-display font-black text-sm text-slate-900 tracking-tight">
              Revenue Overview
            </h4>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Session {dashboardSession}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monthly tuition fee collection trends & channel distribution visualized from active student subscription payments.
          </p>
        </div>

        {/* View & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Channel Selector */}
          <div className="flex items-center">
            <select
              id="select-revenue-method-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Payment Channels</option>
              <option value="UPI">UPI Payments Only</option>
              <option value="CASH">Cash Payments Only</option>
              <option value="ONLINE">Digital / Card Only</option>
            </select>
          </div>

          {/* Breakdown Toggle */}
          <button
            type="button"
            id="btn-toggle-channel-breakdown"
            onClick={() => setShowChannelBreakdown(!showChannelBreakdown)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
              showChannelBreakdown
                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Payment Channels Breakdown"
          >
            <Layers size={13} className={showChannelBreakdown ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="hidden sm:inline">Channels</span>
          </button>

          {/* Chart Type Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              type="button"
              id="btn-revenue-view-area"
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Area Trend View"
            >
              <LineChart size={13} />
              <span>Trend</span>
            </button>
            <button
              type="button"
              id="btn-revenue-view-bar"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Bar Breakdown View"
            >
              <BarChart3 size={13} />
              <span>Bar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Numerical KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Collected */}
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white p-3.5 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Subscriptions
            </span>
            <DollarSign size={14} className="text-emerald-600" />
          </div>
          <div className="font-display font-black text-lg sm:text-xl text-emerald-700">
            ₹{kpis.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700/80 font-semibold mt-0.5 flex items-center gap-1">
            <ShieldCheck size={11} /> {kpis.totalTxns} Confirmed Payments
          </div>
        </div>

        {/* Peak Month */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white p-3.5 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Peak Month
            </span>
            <ArrowUpRight size={14} className="text-indigo-600" />
          </div>
          <div className="font-display font-black text-lg sm:text-xl text-indigo-950 line-clamp-1">
            ₹{kpis.peakMonth.amount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-0.5 line-clamp-1">
            {kpis.peakMonth.month}
          </div>
        </div>

        {/* Average Monthly */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-white p-3.5 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Monthly Average
            </span>
            <Calendar size={14} className="text-blue-600" />
          </div>
          <div className="font-display font-black text-lg sm:text-xl text-blue-900">
            ₹{kpis.avgMonthly.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-blue-700 font-medium mt-0.5">
            Active Cycle Benchmark
          </div>
        </div>

        {/* Channel Share */}
        <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/70 via-white to-white p-3.5 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Channel Split
            </span>
            <CreditCard size={14} className="text-slate-600" />
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-display font-black text-sm text-emerald-600">
              UPI {kpis.upiPercent}%
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-display font-black text-sm text-amber-600">
              Cash {kpis.cashPercent}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Digital: ₹{(kpis.upiCollected + kpis.onlineCollected).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Main Recharts Chart Stage */}
      <div className="rounded-xl border border-slate-200/70 bg-slate-50/30 p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="upiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="displayMonth"
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }}
                />

                {showChannelBreakdown ? (
                  <>
                    <Area
                      type="monotone"
                      name="UPI Collections"
                      dataKey="upi"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#upiGradient)"
                    />
                    <Area
                      type="monotone"
                      name="Cash Collections"
                      dataKey="cash"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cashGradient)"
                    />
                    <Area
                      type="monotone"
                      name="Total Revenue"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    name="Total Revenue"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="displayMonth"
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }}
                />

                {showChannelBreakdown ? (
                  <>
                    <Bar
                      name="UPI Collections"
                      dataKey="upi"
                      stackId="channelStack"
                      fill="#4f46e5"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Cash Collections"
                      dataKey="cash"
                      stackId="channelStack"
                      fill="#f59e0b"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Digital/Card"
                      dataKey="online"
                      stackId="channelStack"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : (
                  <Bar
                    name="Total Revenue"
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Total Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span> UPI
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Cash
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Source: Live Subscription Payments Ledger ({subPayments.length} records)
          </span>
        </div>
      </div>
    </div>
  );
};
export default RevenueOverviewChart;
