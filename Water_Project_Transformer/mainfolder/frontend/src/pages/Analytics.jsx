import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, ComposedChart, Line as LineComponent } from 'recharts';
import { Activity, Droplets, TrendingUp, Loader2, AlertTriangle, Calendar, Thermometer, Zap } from 'lucide-react';
import axios from 'axios';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [temporalTrends, setTemporalTrends] = useState(null);
  const [seasonalDecomp, setSeasonalDecomp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, trendsRes, seasonalRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/analytics'),
          axios.get('http://127.0.0.1:8000/api/temporal-trends/1263'),
          axios.get('http://127.0.0.1:8000/api/seasonal-decomposition/1263')
        ]);
        setData(analyticsRes.data);
        setTemporalTrends(trendsRes.data);
        setSeasonalDecomp(seasonalRes.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-medium">Aggregating TabTransformer Predictions...</p>
        </div>
      </div>
    );
  }

  // Tab Navigation
const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'temporal-trends', label: 'Temporal Trends', icon: TrendingUp },
  { id: 'seasonal', label: 'Seasonal Analysis', icon: Calendar },
  { id: 'forecast', label: 'Forecasting', icon: Zap }
];

const renderTabContent = () => {
  switch (activeTab) {
    case 'overview':
      return <OverviewAnalytics data={data} />;
    case 'temporal-trends':
      return <TemporalTrendsAnalysis data={temporalTrends} />;
    case 'seasonal':
      return <SeasonalAnalysis data={seasonalDecomp} />;
    case 'forecast':
      return <ForecastingAnalytics data={data} />;
    default:
      return <OverviewAnalytics data={data} />;
  }
};

const OverviewAnalytics = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* 12-Month WQI Trend (Large Chart) */}
    <div className="col-span-1 lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">12-Month WQI Trend</h3>
          <p className="text-sm text-slate-500">Average regional Water Quality Index over time</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
          <TrendingUp size={16} /> Seasonal Spike Detected
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            />
            <Area type="monotone" dataKey="avg_wqi" name="Average WQI" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWqi)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Top Pollutants Bar Chart */}
    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="text-red-500" />
        <h3 className="font-bold text-slate-800 text-lg">Primary Pollutants</h3>
      </div>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.pollutant_breakdown} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={120} />
            <Tooltip cursor={{fill: '#f8fafc'}} />
            <Bar dataKey="count" name="Stations Affected" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* WQI Category Distribution */}
    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6">Classification Volume</h3>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.wqi_distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip cursor={{fill: '#f8fafc'}} />
            <Bar dataKey="count" name="Total Stations" radius={[4, 4, 0, 0]} barSize={40}>
              {data.wqi_distribution.map((entry, index) => {
                const isPoor = entry.category.toLowerCase().includes('poor') || entry.category.toLowerCase().includes('unsafe');
                const isGood = entry.category.toLowerCase().includes('good') || entry.category.toLowerCase().includes('excellent');
                return <Cell key={`cell-${index}`} fill={isPoor ? '#ef4444' : isGood ? '#10b981' : '#f59e0b'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const TemporalTrendsAnalysis = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <TrendingUp className="text-blue-600" /> Temporal Trend Analysis
      </h3>
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm text-slate-500">Trend Direction</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">{data.trend_analysis?.trend_direction}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Linear Trend</p>
              <p className="text-2xl font-bold text-slate-800">{data.trend_analysis?.linear_trend > 0 ? '+' : ''}{data.trend_analysis?.linear_trend} WQI/period</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Growth Rate</p>
              <p className="text-2xl font-bold text-slate-800">{data.trend_analysis?.growth_rate > 0 ? '+' : ''}{data.trend_analysis?.growth_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Growth Direction</p>
              <p className="text-2xl font-bold capitalize text-slate-800">{data.trend_analysis?.growth_direction}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Trend Forecast</h4>
            <div className="grid grid-cols-4 gap-4">
              <TrendForecastCard label="Next Month" value={data.trend_forecast?.next_month_wqi} unit="WQI" />
              <TrendForecastCard label="Next Quarter" value={data.trend_forecast?.next_quarter_wqi} unit="WQI" />
              <TrendForecastCard label="6 Months" value={data.trend_forecast?.next_half_year_wqi} unit="WQI" />
              <TrendForecastCard label="Annual" value={data.trend_forecast?.annual_wqi} unit="WQI" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Change Point Detection</h4>
            <div className="space-y-2">
              {data.change_points?.map((cp, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="text-amber-600" size={20} />
                  <div>
                    <p className="font-medium text-slate-800">{cp.type}</p>
                    <p className="text-sm text-slate-600">{cp.description}</p>
                    <p className="text-xs text-slate-500">Confidence: {Math.round(cp.confidence * 100)}%</p>
                  </div>
                </div>
              ))}
              {(!data.change_points || data.change_points.length === 0) && (
                <p className="text-slate-500 text-center py-4">No significant change points detected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <Thermometer className="text-red-500" /> Volatility Analysis
      </h3>
      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Volatility Score</p>
            <p className="text-3xl font-bold text-slate-800">{data.volatility_analysis?.volatility_score}</p>
            <p className="text-sm font-medium capitalize">{data.volatility_analysis?.volatility_level} Volatility</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500">Growth Rate</p>
              <p className="text-2xl font-bold text-slate-800">{data.volatility_analysis?.growth_rate}%</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500">Trend Velocity</p>
              <p className="text-2xl font-bold text-slate-800">{data.volatility_analysis?.trend_velocity} WQI/period</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Seasonal Risk Patterns</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.seasonal_patterns?.map((sp, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">{sp.month}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    sp.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sp.risk_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const SeasonalAnalysis = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <Calendar className="text-green-600" /> Seasonal Decomposition
      </h3>
      {data && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Decomposition Components</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.decomposition?.seasonal} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Seasonal" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="value" name="Trend" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2 }} data={data.decomposition?.trend} />
                  <Line type="monotone" dataKey="value" name="Residual" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} data={data.decomposition?.residual} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-slate-500">Seasonal Strength</p>
              <p className="text-2xl font-bold text-green-700">{data.seasonal_strength?.seasonal_strength_score}%</p>
              <p className="text-sm font-medium text-green-600">{data.seasonal_strength?.seasonal_impact} Impact</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-500">Trend Dominance</p>
              <p className="text-2xl font-bold text-blue-700">{data.seasonal_strength?.trend_dominance}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-slate-500">Model Fit</p>
              <p className="text-2xl font-bold text-purple-700">{data.decomposition_quality?.model_fit}</p>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <Zap className="text-purple-600" /> Fourier Analysis
      </h3>
      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-slate-800 mb-4">Dominant Frequency</h4>
            <p className="text-3xl font-bold text-purple-700">
              {data.fourier_analysis?.dominant_frequency?.frequency}-month cycle
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Period: {data.fourier_analysis?.dominant_period_months} months
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 mb-2">Frequency Coefficients</h4>
            {data.fourier_analysis?.coefficients?.map((coeff, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? '#3b82f6' : '#64748b' }} />
                  <span className="text-sm font-medium">Frequency {coeff.frequency}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Amplitude: {coeff.amplitude}</p>
                  <p className="text-xs text-slate-500">Phase: {coeff.phase}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <h4 className="font-bold text-slate-800 mb-2">Decomposition Quality</h4>
            <p className="text-sm text-slate-600">Explained Variance: {data.decomposition_quality?.explained_variance}%</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

const ForecastingAnalytics = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <Zap className="text-orange-500" /> Multi-Horizon Forecasting
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="font-bold text-slate-800 mb-4">1-Month Forecast</h4>
          <div className="space-y-2">
            {data.monthly_trend?.slice(0, 1).map((m, i) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-medium">{m.month}</span>
                <span className="font-bold text-blue-600">{m.avg_wqi} WQI</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="font-bold text-slate-800 mb-4">6-Month Forecast</h4>
          <div className="space-y-2">
            {data.monthly_trend?.slice(0, 6).map((m, i) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-medium">{m.month}</span>
                <span className="font-bold text-blue-600">{m.avg_wqi} WQI</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <AlertTriangle className="text-amber-500" /> Risk Assessment
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-bold text-red-700">Current Status: Unsafe</p>
          <p className="text-sm text-red-600 mt-1">Immediate attention required for critical stations</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">346</p>
            <p className="text-xs text-slate-500">Critical Alerts</p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">143</p>
            <p className="text-xs text-slate-500">Marginal Stations</p>
          </div>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-bold text-blue-700">Recommended Actions:</p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• Increase monitoring frequency for unsafe stations</li>
            <li>• Deploy mobile treatment units to critical zones</li>
            <li>• Issue public health advisories for affected areas</li>
            <li>• Activate emergency remediation protocols</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const TrendForecastCard = ({ label, value, unit }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value} {unit}</p>
  </div>
);

return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-600" /> System Analytics
        </h2>
        <p className="text-slate-500 font-medium mt-1">Advanced temporal analysis and forecasting powered by deep learning</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}