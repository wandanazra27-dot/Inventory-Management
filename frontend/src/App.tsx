import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import SearchLocate from './pages/SearchLocate';
import ManageWarehouse from './pages/ManageWarehouse';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import ScanVisual from './pages/ScanVisual';
import ReportsLogs from './pages/ReportsLogs';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/add" element={<AddItem />} />
          <Route path="/inventory/:id" element={<ItemDetail />} />
          <Route path="/search-locate" element={<SearchLocate />} />
          <Route path="/manage-warehouse" element={<ManageWarehouse />} />
          <Route path="/scan-visual" element={<ScanVisual />} />
          <Route path="/reports" element={<ReportsLogs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
