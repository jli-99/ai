import { useState } from "react";
import { toast } from "sonner";
import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui";
import { api } from "@/api";
import { Trash2 } from "lucide-react";

const DeleteItemModal = ({ open, onOpenChange, item, onDeleted }) => {
    const [loading, setLoading] = useState(false);

    if (!item) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.deleteItem(item.barcode);
            toast.success(`"${item.name}" deleted`);
            onDeleted?.();
            onOpenChange(false);
        } catch (err) {
            toast.error(err.message || "Failed to delete item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                data-testid="delete-item-modal"
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Delete Item
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-slate-700">
                        Are you sure you want to delete:
                    </p>

                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600 font-mono">
                            {item.barcode}
                        </p>
                    </div>

                    <p className="text-sm text-red-600">
                        This action <strong>cannot be undone</strong>.
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? "Deleting..." : "Delete Item"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteItemModal;