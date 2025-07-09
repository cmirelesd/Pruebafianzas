
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Papa from 'papaparse';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('auth');
  return isAuth ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/actualizar" element={<ProtectedRoute><Actualizar /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = () => {
    if (user === 'Cmireles' && pass === 'Charly') {
      localStorage.setItem('auth', 'true');
      navigate('/dashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 font-sans">
      <h1 className="text-3xl font-bold text-gray-800">Iniciar sesión</h1>
      <input className="border p-2 rounded w-64" placeholder="Usuario" onChange={e => setUser(e.target.value)} onKeyDown={handleKeyDown} />
      <input type="password" className="border p-2 rounded w-64" placeholder="Contraseña" onChange={e => setPass(e.target.value)} onKeyDown={handleKeyDown} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleLogin}>Ingresar</button>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [numContratos, setNumContratos] = useState(30);
  const [sortConfig, setSortConfig] = useState({ key: 'Monto', direction: 'desc' });

  useEffect(() => {
    fetch('/top_contratos_con_fianza.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setFiltered(json.slice(0, numContratos));
      });
  }, []);

  useEffect(() => {
    let sorted = [...data];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === 'Monto') {
          return sortConfig.direction === 'asc' ? a.Monto - b.Monto : b.Monto - a.Monto;
        } else {
          const valA = a[sortConfig.key]?.toString().toLowerCase();
          const valB = b[sortConfig.key]?.toString().toLowerCase();
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
      });
    }
    setFiltered(sorted.slice(0, numContratos));
  }, [data, sortConfig, numContratos]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const columns = ['Empresa', 'Beneficiario', 'Fecha', 'Monto', 'Descripción', 'Fianza sugerida'];

  return (
    <div className="p-6 space-y-6 font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <button
          className="text-sm text-red-600 underline"
          onClick={() => {
            localStorage.removeItem('auth');
            window.location.href = '/';
          }}
        >
          Cerrar sesión
        </button>
        <div className="text-right text-gray-700 font-medium">Bienvenido, Cmireles 👋</div>
      </div>

      <h1 className="text-4xl font-bold text-gray-800">Dashboard de Contratos Públicos</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded p-4 text-center font-semibold bg-blue-100 text-blue-800">
          <p className="text-sm">Total contratos</p>
          <p className="text-xl">100</p>
        </div>
        <div className="rounded p-4 text-center font-semibold bg-green-100 text-green-800">
          <p className="text-sm">Últimos 30 días</p>
          <p className="text-xl">19</p>
        </div>
        <div className="rounded p-4 text-center font-semibold bg-yellow-100 text-yellow-800">
          <p className="text-sm">&gt; $1M</p>
          <p className="text-xl">100</p>
        </div>
        <div className="rounded p-4 text-center font-semibold bg-orange-100 text-orange-800">
          <p className="text-sm">&gt; $10M</p>
          <p className="text-xl">100</p>
        </div>
        <div className="rounded p-4 text-center font-semibold bg-red-100 text-red-800">
          <p className="text-sm">&gt; $50M</p>
          <p className="text-xl">100</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Top contratos por monto</h2>
        <select
          className="border rounded p-2"
          value={numContratos}
          onChange={(e) => setNumContratos(parseInt(e.target.value))}
        >
          <option value={30}>Top 30</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
        </select>
      </div>

      <div className="rounded overflow-auto shadow border bg-white">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-3 text-left cursor-pointer hover:underline"
                  onClick={() => requestSort(col)}
                >
                  {col}
                  {sortConfig.key === col ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="p-3">
                    {col === 'Monto' ? `$${parseFloat(row[col]).toLocaleString()}` : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      <div className="flex justify-between items-center mt-10">
        <h2 className="text-2xl font-semibold text-gray-700">Contratos recientes (últimos 7 días)</h2>
        <select
          className="border rounded p-2"
          value={numRecientes}
          onChange={(e) => setNumRecientes(parseInt(e.target.value))}
        >
          <option value={30}>30 recientes</option>
          <option value={50}>50 recientes</option>
          <option value={100}>100 recientes</option>
        </select>
      </div>

      <div className="rounded overflow-auto shadow border bg-white mt-2">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-3 text-left cursor-pointer hover:underline"
                  onClick={() => requestSort(col)}
                >
                  {col}
                  {sortConfig.key === col ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recientes.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="p-3">
                    {col === 'Monto' ? `$${parseFloat(row[col]).toLocaleString()}` : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>

      <div className="flex justify-center pt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => window.location.href = '/actualizar'}
        >
          🔄 Actualizar archivo
        </button>
      </div>
    </div>
  );
}

function Actualizar() {
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        console.log('Archivo cargado:', result.data.slice(0, 5));
        alert('Archivo cargado exitosamente. Redirigiendo al dashboard...');
        navigate('/dashboard');
      },
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 font-sans">
      <h2 className="text-2xl font-semibold text-gray-700">Sube el nuevo archivo CSV</h2>
      <input type="file" accept=".csv" onChange={handleFile} className="border p-2 rounded" />
      <button className="text-sm text-blue-600 underline" onClick={() => navigate('/dashboard')}>
        Cancelar
      </button>
    </div>
  );
}



function RecentTable() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch('/contratos_mas_recientes_con_fianza.json')
      .then(res => res.json())
      .then(setRecent);
  }, []);

  const columns = ['Empresa', 'Beneficiario', 'Fecha', 'Monto', 'Descripción', 'Fianza sugerida'];

  return (
    <div className="rounded overflow-auto shadow border bg-white">
      <table className="w-full text-sm table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map(col => (
              <th key={col} className="p-3 text-left">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="p-3">
                  {col === 'Monto' ? `$${parseFloat(row[col]).toLocaleString()}` : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
