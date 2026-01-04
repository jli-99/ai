import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import { api } from "@/api";

const Home = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [scanValue, setScanValue] = useState("");
  const scanInputRef = useRef(null);

  /* ---------------- API calls ---------------- */

  const fetchItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const createItem = async () => {
    if (!newItemName.trim()) return;
    try {
      await api.createItem(newItemName);
      setNewItemName("");
      fetchItems();
    } catch (err) {
      console.error("Failed to create item", err);
    }
  };

  const checkIn = async (barcode) => {
    try {
      await api.checkIn(barcode);
      fetchItems();
    } catch (err) {
      console.error("Check-in failed", err);
    }
  };

  const checkOut = async (barcode) => {
    try {
      await api.checkOut(barcode);
      fetchItems();
    } catch (err) {
      console.error("Check-out failed", err);
    }
  };

  /* ---------------- Barcode scan flow ---------------- */

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanValue.trim()) return;

    try {
      const item = await api.getItem(scanValue);

      if (item.status === "in") {
        await api.checkOut(scanValue);
      } else {
        await api.checkIn(scanValue);
      }

      fetchItems();
    } catch (err) {
      alert("Item not found for barcode: " + scanValue);
    }

    setScanValue("");
    scanInputRef.current?.focus();
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    fetchItems();
    scanInputRef.current?.focus();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>📦 Inventory Manager</h2>

      {/* ---- Create Item ---- */}
      <section style={{ marginBottom: 24 }}>
        <h3>Create Item</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
          />
          <button onClick={createItem}>Create</button>
        </div>
      </section>

      {/* ---- Barcode Scan ---- */}
      <section style={{ marginBottom: 24 }}>
        <h3>Scan Barcode</h3>
        <form onSubmit={handleScanSubmit}>
          <input
            ref={scanInputRef}
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            placeholder="Scan barcode here"
          />
        </form>
        <p style={{ fontSize: 12 }}>
          Scanner will auto-submit when Enter is sent
        </p>
      </section>

      {/* ---- Items List ---- */}
      <section>
        <h3>Items</h3>

        {items.length === 0 ? (
          <p>No items yet</p>
        ) : (
          <ul style={{ paddingLeft: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  listStyle: "none",
                  border: "1px solid #ddd",
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {item.barcode} · status: {item.status}
                  </div>
                </div>

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
        )}
      </section>
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