import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import StationInspector from './pages/StationInspector';
import Analytics from './pages/Analytics';
import AlertSystem from './pages/AlertSystem';
import RemediationEngine from './pages/RemediationEngine';
import Reports from './pages/Reports';
import ModelComparison from './pages/ModelComparison';
import MapView from './components/MapView';
import TemporalAnalysis from './components/TemporalAnalysis';

function App() {
  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/inspector" element={<StationInspector />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertSystem />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/remediation" element={<RemediationEngine />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/models" element={<ModelComparison />} />
            <Route path="/temporal" element={<TemporalAnalysis />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;