import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, ShieldAlert, CheckCircle, Eye, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AlertSystem() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, UNSAFE, MARGINAL, SAFE
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/alerts');
      setStations(response.data);
      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up polling interval
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchAlerts, 30000); // 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.state.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === 'ALL' || station.status.toUpperCase() === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500 font-medium">Loading TabTransformer Alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Alert System</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time triage and monitoring powered by PyTorch</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-slate-600">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          {/* Last Updated */}
          {lastUpdated && (
            <span className="text-sm text-slate-500 hidden sm:block">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-600">Auto-refresh</span>
          </label>
          {/* Manual Refresh Button */}
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search code, name, or state..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>All Stations</button>
          <button onClick={() => setFilter('UNSAFE')} className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${filter === 'UNSAFE' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}><ShieldAlert size={16} /> Critical</button>
          <button onClick={() => setFilter('MARGINAL')} className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${filter === 'MARGINAL' ? 'bg-yellow-100 text-yellow-700' : 'text-slate-500 hover:bg-slate-100'}`}><AlertTriangle size={16} /> Warning</button>
          <button onClick={() => setFilter('SAFE')} className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${filter === 'SAFE' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'}`}><CheckCircle size={16} /> Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Station Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">WQI</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Confidence</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStations.map((station, index) => {
                const isUnsafe = station.status.toUpperCase() === 'UNSAFE';
                const isMarginal = station.status.toUpperCase() === 'MARGINAL';
                
                return (
                  <tr key={index} className={`hover:bg-slate-50 transition-colors ${isUnsafe ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{station.station_code}</p>
                      <p className="text-sm text-slate-500 truncate max-w-xs" title={station.station_name}>{station.station_name}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{station.state}</td>
                    <td className="p-4">
                      <span className={`font-black ${isUnsafe ? 'text-red-600' : isMarginal ? 'text-yellow-600' : 'text-green-600'}`}>{station.wqi}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${isUnsafe ? 'bg-red-100 text-red-700' : isMarginal ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {isUnsafe && <ShieldAlert size={12} />}
                        {isMarginal && <AlertTriangle size={12} />}
                        {!isUnsafe && !isMarginal && <CheckCircle size={12} />}
                        {station.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${station.confidence > 90 ? 'bg-green-500' : station.confidence > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${station.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{station.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {/* THIS IS THE UPDATED BUTTON */}
                      <button 
                        onClick={() => navigate('/inspector', { state: { stationId: station.station_code } })}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
                      >
                        <Eye size={16} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStations.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                    No stations found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}