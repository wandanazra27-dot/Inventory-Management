import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SearchLocate from './pages/SearchLocate';
import ReportsLogs from './pages/ReportsLogs';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/search-locate" replace />} />
          <Route path="/search-locate" element={<SearchLocate />} />
          <Route path="/reports" element={<ReportsLogs />} />
          <Route path="*" element={<Navigate to="/search-locate" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
