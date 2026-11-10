import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { Search, AlertTriangle, TrendingUp, Calendar, Loader2, Download, Zap, ShieldAlert, Thermometer, Activity } from 'lucide-react';
import axios from 'axios';

export default function TemporalAnalysis() {
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeStation, setActiveStation] = useState('1263');
  const [activeTab, setActiveTab] = useState('forecast');

  const fetchTemporalData = async (stationId) => {
    setLoading(true);
    try {
      const [forecastRes, deteriorationRes, trendsRes, seasonalRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/temporal-forecast/${stationId}`),
        axios.get(`http://127.0.0.1:8000/api/deterioration-analysis/${stationId}`),
        axios.get(`http://127.0.0.1:8000/api/temporal-trends/${stationId}`),
        axios.get(`http://127.0.0.1:8000/api/seasonal-decomposition/${stationId}`)
      ]);
      setStationData({
        forecast: forecastRes.data,
        deterioration: deteriorationRes.data,
        trends: trendsRes.data,
        seasonal: seasonalRes.data
      });
      setSearchInput(stationId);
    } catch (err) {
      console.error("Error fetching temporal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemporalData(activeStation);
  }, [activeStation]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchInput.trim() !== '') {
      setActiveStation(searchInput);
    }
  };

  if (loading || !stationData) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-medium">Loading Temporal Analysis...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'forecast', label: 'Multi-Horizon Forecast', icon: Zap },
    { id: 'deterioration', label: 'Deterioration Analysis', icon: ShieldAlert },
    { id: 'trends', label: 'Temporal Trends', icon: TrendingUp },
    { id: 'seasonal', label: 'Seasonal Decomposition', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'forecast':
        return <ForecastTab data={stationData.forecast} />;
      case 'deterioration':
        return <DeteriorationTab data={stationData.deterioration} />;
      case 'trends':
        return <TrendsTab data={stationData.trends} />;
      case 'seasonal':
        return <SeasonalTab data={stationData.seasonal} />;
      default:
        return <ForecastTab data={stationData.forecast} />;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" /> Temporal Analysis
          </h2>
          <p className="text-slate-500 font-medium mt-1">Advanced deep learning based water quality deterioration prediction</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Enter Station Code (Press Enter)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Station Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Station {stationData.forecast?.station_code}</h3>
              <p className="text-slate-500 font-medium">{stationData.deterioration?.station_name}</p>
              <p className="text-slate-500 text-sm">{stationData.deterioration?.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Current WQI</p>
              <p className="text-2xl font-bold text-slate-800">{stationData.forecast?.temporal_features?.current_wqi}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                stationData.deterioration?.current_status === 'UNSAFE' ? 'bg-red-100 text-red-700' :
                stationData.deterioration?.current_status === 'MARGINAL' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {stationData.deterioration?.current_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
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

const ForecastTab = ({ data }) => {
  if (!data) return <div className="text-center py-8 text-slate-500">No forecast data available</div>;

  return (
    <div className="space-y-6">
      {/* Temporal Features Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <FeatureCard label="Current WQI" value={data.temporal_features?.current_wqi} icon={<Activity className="text-blue-600" />} color="blue" />
        <FeatureCard label="Trend" value={`${data.temporal_features?.trend > 0 ? '+' : ''}${data.temporal_features?.trend}`} unit="WQI/period" icon={<TrendingUp className="text-green-600" />} color="green" />
        <FeatureCard label="Growth Rate" value={`${data.temporal_features?.growth_rate > 0 ? '+' : ''}${data.temporal_features?.growth_rate}%`} icon={<Zap className="text-amber-600" />} color="amber" />
        <FeatureCard label="Rolling 3" value={data.temporal_features?.rolling3} unit="WQI" icon={<Activity className="text-purple-600" />} color="purple" />
        <FeatureCard label="Top Pollutant" value={data.temporal_features?.top_pollutant} icon={<AlertTriangle className="text-red-600" />} color="red" isText />
      </div>

      {/* Multi-Horizon Forecasts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(data.forecast_horizons || {}).map(([horizon, forecast]) => (
          <ForecastHorizonCard key={horizon} horizon={horizon} forecast={forecast} />
        ))}
      </div>
    </div>
  );
};

const DeteriorationTab = ({ data }) => {
  if (!data) return <div className="text-center py-8 text-slate-500">No deterioration data available</div>;

  return (
    <div className="space-y-6">
      {/* Risk Score & Level */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <RiskScoreCard score={data.deterioration_score} level={data.risk_level} />
        <MetricCard label="Trend Direction" value={data.trend_direction} icon={<TrendingUp />} color="blue" />
        <MetricCard label="Growth Rate" value={`${data.growth_rate > 0 ? '+' : ''}${data.growth_rate}%`} icon={<Zap />} color="amber" />
        <MetricCard label="Months to Critical" value={data.months_to_critical ? `${data.months_to_critical} months` : 'No immediate risk'} icon={<Calendar />} color="green" />
      </div>

      {/* Risk Factors */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Risk Factors
        </h3>
        <div className="space-y-3">
          {data.risk_factors?.map((factor, i) => (
            <RiskFactorCard key={i} factor={factor} />
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-green-500" /> Recommended Actions
        </h3>
        <ul className="space-y-3">
          {data.recommended_actions?.map((action, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="text-green-600" size={14} />
              </div>
              <p className="text-slate-700 font-medium">{action}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TrendsTab = ({ data }) => {
  if (!data) return <div className="text-center py-8 text-slate-500">No trends data available</div>;

  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Linear Trend" value={`${data.trend_analysis?.linear_trend > 0 ? '+' : ''}${data.trend_analysis?.linear_trend}`} unit="WQI/period" icon={<TrendingUp />} color="blue" />
        <MetricCard label="Trend Direction" value={data.trend_analysis?.trend_direction} icon={<TrendingUp />} color="green" isText />
        <MetricCard label="Trend Strength" value={data.trend_analysis?.trend_strength} icon={<Activity />} color="purple" isText />
        <MetricCard label="Growth Rate" value={`${data.trend_analysis?.growth_rate > 0 ? '+' : ''}${data.trend_analysis?.growth_rate}%`} icon={<Zap />} color="amber" />
      </div>

      {/* Trend Forecast */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Trend Forecast</h3>
        <div className="grid grid-cols-4 gap-4">
          <TrendForecastCard label="Next Month" value={data.trend_forecast?.next_month_wqi} unit="WQI" />
          <TrendForecastCard label="Next Quarter" value={data.trend_forecast?.next_quarter_wqi} unit="WQI" />
          <TrendForecastCard label="6 Months" value={data.trend_forecast?.next_half_year_wqi} unit="WQI" />
          <TrendForecastCard label="Annual" value={data.trend_forecast?.annual_wqi} unit="WQI" />
        </div>
      </div>

      {/* Change Points */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" /> Change Point Detection
        </h3>
        <div className="space-y-2">
          {data.change_points?.length > 0 ? (
            data.change_points?.map((cp, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="text-amber-600" size={20} />
                <div>
                  <p className="font-medium text-slate-800">{cp.type}</p>
                  <p className="text-sm text-slate-600">{cp.description}</p>
                  <p className="text-xs text-slate-500">Confidence: {Math.round(cp.confidence * 100)}%</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">No significant change points detected</p>
          )}
        </div>
      </div>

      {/* Volatility Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Volatility Score" value={data.volatility_analysis?.volatility_score} icon={<Thermometer />} color="red" />
        <MetricCard label="Volatility Level" value={data.volatility_analysis?.volatility_level} icon={<AlertTriangle />} color="amber" isText />
        <MetricCard label="Growth Rate" value={`${data.volatility_analysis?.growth_rate}%`} icon={<Zap />} color="blue" />
        <MetricCard label="Trend Velocity" value={`${data.volatility_analysis?.trend_velocity} WQI/period`} icon={<TrendingUp />} color="green" />
      </div>

      {/* Seasonal Risk Patterns */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="text-green-500" /> Seasonal Risk Patterns
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {data.seasonal_patterns?.map((sp, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-600">{sp.month}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{sp.expected_wqi} WQI</p>
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold rounded-full ${
                sp.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {sp.risk_level} Risk
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SeasonalTab = ({ data }) => {
  if (!data) return <div className="text-center py-8 text-slate-500">No seasonal data available</div>;

  return (
    <div className="space-y-6">
      {/* Decomposition Components */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="text-green-600" /> Decomposition Components
        </h3>
        <div className="h-96">
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

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Seasonal Strength" value={`${data.seasonal_strength?.seasonal_strength_score}%`} icon={<Thermometer />} color="green" />
        <MetricCard label="Seasonal Impact" value={data.seasonal_strength?.seasonal_impact} icon={<AlertTriangle />} color="amber" isText />
        <MetricCard label="Trend Dominance" value={data.seasonal_strength?.trend_dominance} icon={<TrendingUp />} color="blue" isText />
      </div>

      {/* Fourier Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="text-purple-500" /> Fourier Analysis
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-slate-800 mb-2">Dominant Frequency</h4>
            <p className="text-2xl font-bold text-purple-700">
              {data.fourier_analysis?.dominant_frequency?.frequency}-month cycle
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Period: {data.fourier_analysis?.dominant_period_months} months
            </p>
          </div>

          <div className="space-y-2">
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
            <p className="text-sm text-slate-600">Model Fit: {data.decomposition_quality?.model_fit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ label, value, unit = '', icon, color, isText = false }) => (
  <div className={`p-4 rounded-xl border ${isText ? 'border-slate-200' : `border-${color}-200 bg-${color}-50`}`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`p-2 rounded-lg bg-${color}-100`}>{icon}</div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
    <p className={`text-2xl font-bold ${isText ? 'text-slate-800' : `text-${color}-700`}`}>{value}{unit ? ` ${unit}` : ''}</p>
  </div>
);

const ForecastHorizonCard = ({ horizon, forecast }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
      <Zap className="text-orange-500" /> {horizon.replace('_', ' ').toUpperCase()}
    </h3>
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {forecast?.map((item, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{item.month}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              item.wqi_category === 'Unsafe' ? 'bg-red-100 text-red-700' :
              item.wqi_category === 'Very Poor' ? 'bg-red-100 text-red-700' :
              item.wqi_category === 'Poor' ? 'bg-amber-100 text-amber-700' :
              item.wqi_category === 'Good' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {item.wqi_category}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">{item.predicted_wqi} WQI</p>
            <p className="text-xs text-slate-500">Confidence: {item.confidence}% ± {item.uncertainty}%</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RiskScoreCard = ({ score, level }) => {
  const levelColors = {
    'CRITICAL': 'bg-red-100 text-red-700 border-red-200',
    'HIGH': 'bg-amber-100 text-amber-700 border-amber-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'LOW': 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className={`p-6 rounded-2xl border text-center ${levelColors[level] || levelColors.MEDIUM}`}>
      <p className="text-sm font-medium text-slate-500 mb-2">Deterioration Score</p>
      <p className="text-4xl font-bold text-slate-800">{score?.toFixed(1)}</p>
      <p className="text-sm font-bold uppercase tracking-wider mt-2">{level} Risk</p>
    </div>
  );
};

const MetricCard = ({ label, value, unit = '', icon, color = 'blue', isText = false }) => (
  <div className={`p-4 rounded-xl border ${isText ? 'border-slate-200' : `border-${color}-200 bg-${color}-50`}`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`p-2 rounded-lg ${isText ? 'bg-slate-100' : `bg-${color}-100`}`}>{icon}</div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
    <p className={`text-xl font-bold ${isText ? 'text-slate-800' : `text-${color}-700`}`}>{value}{unit ? ` ${unit}` : ''}</p>
  </div>
);

const RiskFactorCard = ({ factor }) => {
  const severityColors = {
    'CRITICAL': 'bg-red-50 border-red-200 text-red-700',
    'HIGH': 'bg-amber-50 border-amber-200 text-amber-700',
    'MEDIUM': 'bg-yellow-50 border-yellow-200 text-yellow-700',
    'LOW': 'bg-green-50 border-green-200 text-green-700'
  };

  return (
    <div className={`p-4 rounded-xl border ${severityColors[factor.severity] || severityColors.MEDIUM}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-800">{factor.factor}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColors[factor.severity] || severityColors.MEDIUM}`}>
              {factor.severity}
            </span>
          </div>
          <p className="text-sm text-slate-600">{factor.description}</p>
          <p className="text-xs text-slate-500 mt-1">{factor.impact}</p>
        </div>
      </div>
    </div>
  );
};

const TrendForecastCard = ({ label, value, unit }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value} {unit}</p>
  </div>
);