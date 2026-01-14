import { useState } from "react";
import { toast } from "sonner";
import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Label
} from "@/components/ui";
import { api } from "@/api";

const DeleteItemModal = ({ open, onOpenChange, onDeleted }) => {
    const [query, setQuery] = useState("");
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error("Enter barcode or item name");
            return;
        }

        try {
            setLoading(true);

            // reuse existing GET /items?search=
            const results = await api.getItems(query);

            if (!results || results.length === 0) {
                toast.error("No matching item found");
                setItem(null);
                return;
            }

            if (results.length > 1) {
                toast.error("Multiple items found, please refine search");
                return;
            }

            setItem(results[0]);
        } catch (err) {
            toast.error("Failed to search item");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!item) return;

        try {
            setLoading(true);
            await api.deleteItem(item.barcode);
            toast.success(`Deleted "${item.name}"`);
            onDeleted();
            handleClose();
        } catch (err) {
            toast.error("Failed to delete item");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setQuery("");
        setItem(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-600">
                        Delete Item
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Barcode or Item Name</Label>
                        <Input
                            placeholder="Type barcode or name"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800"
                    >
                        Search Item
                    </Button>

                    {item && (
                        <div className="p-4 border border-red-200 rounded bg-red-50">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-sm text-slate-600">Barcode: {item.barcode}</p>

                            <Button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full mt-4 bg-red-600 hover:bg-red-700"
                            >
                                Confirm Delete
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteItemModal;