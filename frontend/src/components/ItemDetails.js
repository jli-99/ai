import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ArrowDownLeft, ArrowUpRight, Package, Printer } from "lucide-react";
import Barcode from "react-barcode";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const buildBarcodePrintHtml = (item, imageSrc) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print Barcode - ${item.name}</title>
        <style>
          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
            color: #111827;
          }
          .label {
            width: 320px;
            border: 2px solid #d1d5db;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            background: #fff;
          }
          .name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 12px;
            word-break: break-word;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto 12px;
          }
          .barcode-text {
            font-size: 14px;
            font-family: monospace;
            word-break: break-all;
          }
          @media print {
            body {
              padding: 0;
            }
            .label {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="name">${item.name}</div>
          <img src="${imageSrc}" alt="Barcode for ${item.name}" />
          <div class="barcode-text">${item.barcode}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 250);
          };
        </script>
      </body>
    </html>
  `;
};

const ItemDetails = ({ item, open, onOpenChange, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handlePrintBarcode = async () => {
    try {
      const response = await api.getBarcodeImage(item.barcode);
      const imageSrc = response?.image;

      if (!imageSrc) {
        throw new Error("Barcode image not available");
      }

      const printWindow = window.open("", "_blank", "width=700,height=900");

      if (!printWindow) {
        toast.error("Please allow pop-ups to print the barcode.");
        return;
      }

      printWindow.document.write(buildBarcodePrintHtml(item, imageSrc));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate barcode for printing");
    }
  };

  const handleAction = async (action) => {
    try {
      setLoading(true);
      const endpoint = action === "checkin" ? "checkin" : "checkout";
      await axios.post(`${API}/items/${item.barcode}/${endpoint}`);

      const actionText = action === "checkin" ? "checked in" : "checked out";
      toast.success(`${item.name} ${actionText} successfully!`);

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(`Failed to ${action} item`);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="item-details-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Item Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{item.name}</h3>
                <div className="flex items-center gap-2 mt-2">
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
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <Barcode value={item.barcode} height={50} width={1.5} fontSize={12} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(item.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Check-In</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(item.checked_in_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Check-Out</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(item.checked_out_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Barcode</p>
                <code className="text-sm text-slate-900 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                  {item.barcode}
                </code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {item.history.slice().reverse().map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    {entry.action === "checked_in" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    ) : entry.action === "checked_out" ? (
                      <ArrowUpRight className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Package className="h-4 w-4 text-slate-600" />
                    )}
                    <span className="text-sm font-medium text-slate-900 capitalize">
                      {entry.action.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            {item.status === "in" ? (
              <Button
                data-testid="checkout-from-details-btn"
                onClick={() => handleAction("checkout")}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-10"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            ) : (
              <Button
                data-testid="checkin-from-details-btn"
                onClick={() => handleAction("checkin")}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10"
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Check In
              </Button>
            )}
            <Button
              data-testid="print-barcode-btn"
              onClick={handlePrintBarcode}
              variant="outline"
              className="flex-1 border-slate-200 hover:bg-slate-50 rounded-lg h-10"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Barcode
            </Button>
            <Button
              data-testid="close-details-btn"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-slate-200 hover:bg-slate-50 rounded-lg h-10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetails;
