import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from "@/components";
import { api } from "@/api"
import Barcode from "react-barcode";

//const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
//const API = `${BACKEND_URL}/api`;

const AddItemModal = ({ open, onOpenChange, onItemAdded }) => {
  const [itemName, setItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedItem, setGeneratedItem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API}/items`, { name: itemName });
      setGeneratedItem(response.data);
      toast.success("Item added successfully!");
      setTimeout(() => {
        onItemAdded();
        handleClose();
      }, 2000);
    } catch (error) {
      toast.error("Failed to add item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setItemName("");
    setGeneratedItem(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="add-item-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Add New Item
          </DialogTitle>
        </DialogHeader>

        {!generatedItem ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-sm font-medium">
                Item Name
              </Label>
              <Input
                id="itemName"
                data-testid="item-name-input"
                type="text"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="h-10 rounded-md border border-slate-200"
                disabled={loading}
              />
            </div>

            <Button
              data-testid="submit-item-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-10 transition-all active:scale-95"
            >
              {loading ? "Adding..." : "Add Item & Generate Barcode"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-center" data-testid="item-created-success">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{generatedItem.name}</h3>
              <div className="my-4 bg-white p-4 rounded inline-block">
                <Barcode value={generatedItem.barcode} height={60} width={1.5} fontSize={14} />
              </div>
              <p className="text-sm text-slate-600 mt-2">Barcode: {generatedItem.barcode}</p>
            </div>
            <p className="text-sm text-emerald-600 font-medium">Item added successfully!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
