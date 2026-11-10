import React, { useState, useEffect } from 'react';
import { Loader2, Award, Brain, Zap, BarChart2, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import axios from 'axios';

export default function ModelComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/model/comparison');
        setData(response.data);
      } catch (err) {
        console.error("Error fetching model comparison:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-medium">Loading Model Performance Data...</p>
        </div>
      </div>
    );
  }

  const { models, summary } = data;

  const metrics = [
    { key: 'accuracy', label: 'Accuracy (%)', color: '#3b82f6' },
    { key: 'f1_macro', label: 'F1 Macro (%)', color: '#10b981' },
    { key: 'precision_macro', label: 'Precision Macro (%)', color: '#f59e0b' },
    { key: 'recall_macro', label: 'Recall Macro (%)', color: '#ef4444' },
  ];

  const formatMetric = (val) => val.toFixed(2);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="text-purple-600" /> Model Performance Comparison
        </h2>
        <p className="text-slate-500 font-medium mt-1">Compare TabTransformer, FT-Transformer, and baseline models across all metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Trophy size={24} /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Best Overall</p>
            <p className="text-2xl font-black text-slate-800">{summary.best_overall}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Brain size={24} /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Best Transformer</p>
            <p className="text-2xl font-black text-slate-800">{summary.best_transformer}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><Award size={24} /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Best Macro F1</p>
            <p className="text-2xl font-black text-slate-800">{summary.best_macro_f1}</p>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-800">Key Finding</h4>
          <p className="text-sm text-blue-700 mt-1">
            {summary.note}
          </p>
        </div>
      </div>

      {/* Metrics Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></span>
              {metric.label} Comparison
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={models} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={140} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey={metric.key} name={metric.label} fill={metric.color} radius={[0, 4, 4, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Model Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed Model Analysis</h3>
        {models.map((model) => (
          <ModelCard
            key={model.name}
            model={model}
            isExpanded={expandedModel === model.name}
            onToggle={() => setExpandedModel(expandedModel === model.name ? null : model.name)}
            allModels={models}
          />
        ))}
      </div>
    </div>
  );
}

function ModelCard({ model, isExpanded, onToggle, allModels }) {
  const isTransformer = model.type === 'Transformer';
  const rank = allModels.findIndex(m => m.name === model.name) + 1;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg ring-2 ring-blue-200' : ''}`}>
      {/* Card Header */}
      <div className={`p-6 flex items-center justify-between cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`} onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${isTransformer ? 'bg-purple-500' : 'bg-orange-500'}`}>
            {rank}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {model.name}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isTransformer ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                {model.type}
              </span>
            </h4>
            <p className="text-sm text-slate-500 mt-1">{model.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800">{model.accuracy}%</p>
            <p className="text-xs text-slate-500">Accuracy</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-green-600">{model.f1_macro}%</p>
            <p className="text-xs text-slate-500">Macro F1</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-6 bg-slate-50 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metrics Detail */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-700">Detailed Metrics</h5>
              <MetricRow label="Precision (Macro)" value={`${model.precision_macro}%`} />
              <MetricRow label="Recall (Macro)" value={`${model.recall_macro}%`} />
              <MetricRow label="Best For" value={model.best_for} />
            </div>

            {/* Radar Chart */}
            <div className="md:col-span-2">
              <h5 className="font-bold text-slate-700 mb-4">Performance Profile</h5>
              <RadarChart data={[
                { metric: 'Accuracy', value: model.accuracy, fullMark: 100 },
                { metric: 'F1 Macro', value: model.f1_macro, fullMark: 100 },
                { metric: 'Precision', value: model.precision_macro, fullMark: 100 },
                { metric: 'Recall', value: model.recall_macro, fullMark: 100 },
              ]} color={isTransformer ? '#8b5cf6' : '#f97316'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

function RadarChart({ data, color }) {
  const angles = data.map((_, i) => (i * 2 * Math.PI) / data.length - Math.PI / 2);
  const radius = 100;
  const centerX = 150;
  const centerY = 150;

  const getPoint = (value, angle) => {
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const points = data.map((d, i) => getPoint(d.value, angles[i]));
  const fullPoints = data.map((d, i) => getPoint(d.fullMark, angles[i]));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const fullPathData = fullPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
      {/* Grid circles */}
      {[25, 50, 75, 100].map((r) => (
        <circle key={r} cx={centerX} cy={centerY} r={radius * r / 100} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      ))}

      {/* Grid lines */}
      {angles.map((angle, i) => (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={centerX + radius * Math.cos(angle)}
          y2={centerY + radius * Math.sin(angle)}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}

      {/* Full mark polygon */}
      <path d={fullPathData} fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />

      {/* Model polygon */}
      <path d={pathData} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2} />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
          <text
            x={p.x + (p.x > centerX ? 15 : -15)}
            y={p.y + (p.y > centerY ? 15 : -5)}
            textAnchor={p.x > centerX ? 'start' : 'end'}
            fontSize="10"
            fill="#64748b"
            fontWeight="600"
          >
            {data[i].metric}
          </text>
        </g>
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const labelPos = getPoint(110, angles[i]);
        return (
          <text
            key={d.metric}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantCentral="middle"
            fontSize="11"
            fill="#475569"
            fontWeight="600"
          >
            {d.metric}
          </text>
        );
      })}
    </svg>
  );
}