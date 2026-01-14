import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Package, Scan, Plus, Search, Filter, ArrowDownLeft, ArrowUpRight, History, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import AddItemModal from "@/components/AddItemModal";
import ScanModal from "@/components/ScanModal";
import ItemDetails from "@/components/ItemDetails";
import DeleteItemModal from "@/components/DeleteItemModal";

import { api } from "@/api"

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [scanAction, setScanAction] = useState("checkout");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [searchQuery, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const data = await api.getItems(searchQuery, statusFilter);
      setItems(data);
    } catch (error) {
      toast.error("Failed to fetch items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openScanModal = (action) => {
    setScanAction(action);
    setShowScanModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
                Inventory System
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                data-testid="scan-checkout-btn"
                onClick={() => openScanModal("checkout")}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-all active:scale-95"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Check Out
              </Button>
              <Button
                data-testid="scan-checkin-btn"
                onClick={() => openScanModal("checkin")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all active:scale-95"
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Check In
              </Button>
              <Button
                data-testid="add-item-btn"
                onClick={() => setShowAddModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button
                data-testid="delete-item-btn"
                onClick={() => {
                  if (items.length === 0) {
                    toast.error("No items available to delete");
                    return;
                  }
                  setItemToDelete(items[0]); // default selection
                  setShowDeleteModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  data-testid="search-input"
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-md border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter" className="h-10 rounded-md border border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in">Checked In</SelectItem>
                  <SelectItem value="out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No items found</h3>
            <p className="text-slate-600 mb-6">Start by adding your first inventory item</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="items-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors" data-testid={`item-row-${item.barcode}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {item.barcode}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "in" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Checked Out
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(item.status === "in" ? item.checked_in_at : item.checked_out_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          data-testid={`view-details-${item.barcode}`}
                          onClick={() => setSelectedItem(item)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg"
                        >
                          <History className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onItemAdded={fetchItems}
      />

      <DeleteItemModal
        open={showDeleteModal}
        item={itemToDelete}
        onOpenChange={setShowDeleteModal}
        onDeleted={fetchItems}
      />

      <ScanModal
        open={showScanModal}
        onOpenChange={setShowScanModal}
        action={scanAction}
        onSuccess={fetchItems}
      />

      {selectedItem && (
        <ItemDetails
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          onUpdate={fetchItems}
        />
      )}
    </div>
  );
};

export default Dashboard;
