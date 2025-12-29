import { useEffect, useState, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [scanValue, setScanValue] = useState("");
  const scanInputRef = useRef(null);

  /* ---------------- API calls ---------------- */

  const fetchItems = async () => {
    const res = await axios.get(`${API}/items`);
    setItems(res.data);
  };

  const createItem = async () => {
    if (!newItemName.trim()) return;
    await axios.post(`${API}/items`, { name: newItemName });
    setNewItemName("");
    fetchItems();
  };

  const checkIn = async (barcode) => {
    await axios.post(`${API}/items/${barcode}/checkin`);
    fetchItems();
  };

  const checkOut = async (barcode) => {
    await axios.post(`${API}/items/${barcode}/checkout`);
    fetchItems();
  };

  /* ---------------- Barcode scan flow ---------------- */

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanValue.trim()) return;

    try {
      const itemRes = await axios.get(`${API}/items/${scanValue}`);
      const item = itemRes.data;

      if (item.status === "in") {
        await checkOut(scanValue);
      } else {
        await checkIn(scanValue);
      }
    } catch (err) {
      alert("Item not found for barcode: " + scanValue);
    }

    setScanValue("");
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    fetchItems();
    scanInputRef.current?.focus();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Inventory Manager</h2>

      {/* ---- Create Item ---- */}
      <div style={{ marginBottom: 20 }}>
        <h3>Create Item</h3>
        <input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Item name"
        />
        <button onClick={createItem}>Create</button>
      </div>

      {/* ---- Barcode Scan ---- */}
      <div style={{ marginBottom: 20 }}>
        <h3>Scan Barcode</h3>
        <form onSubmit={handleScanSubmit}>
          <input
            ref={scanInputRef}
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            placeholder="Scan barcode here"
          />
          <button type="submit">Submit</button>
        </form>
        <p style={{ fontSize: 12 }}>
          (Scanner will auto-submit with Enter)
        </p>
      </div>

      {/* ---- Items List ---- */}
      <h3>Items</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <strong>{item.name}</strong>  
            &nbsp;[{item.status}]  
            &nbsp;({item.barcode})

            {item.status === "in" ? (
              <button onClick={() => checkOut(item.barcode)}>
                Check Out
              </button>
            ) : (
              <button onClick={() => checkIn(item.barcode)}>
                Check In
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

