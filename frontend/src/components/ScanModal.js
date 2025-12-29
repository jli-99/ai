import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Keyboard, Scan } from "lucide-react";
import Webcam from "react-webcam";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScanModal = ({ open, onOpenChange, action, onSuccess }) => {
  const [manualBarcode, setManualBarcode] = useState("");
  const [usbBarcode, setUsbBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const webcamRef = useRef(null);
  const usbInputRef = useRef(null);

  useEffect(() => {
    if (open && usbInputRef.current) {
      usbInputRef.current.focus();
    }
  }, [open]);

  const processBarcode = async (barcode) => {
    if (!barcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    try {
      setLoading(true);
      const endpoint = action === "checkin" ? "checkin" : "checkout";
      const response = await axios.post(`${API}/items/${barcode}/${endpoint}`);
      
      const actionText = action === "checkin" ? "checked in" : "checked out";
      toast.success(`${response.data.name} ${actionText} successfully!`);
      
      onSuccess();
      handleClose();
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Item not found");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(`Failed to ${action} item`);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsbSubmit = (e) => {
    e.preventDefault();
    processBarcode(usbBarcode);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processBarcode(manualBarcode);
  };

  const handleClose = () => {
    setManualBarcode("");
    setUsbBarcode("");
    setCameraEnabled(false);
    onOpenChange(false);
  };

  const actionText = action === "checkin" ? "Check In" : "Check Out";
  const actionColor = action === "checkin" ? "emerald" : "amber";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="scan-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
            {actionText} Item
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="usb" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="usb" data-testid="usb-scanner-tab">
              <Scan className="h-4 w-4 mr-2" />
              USB Scanner
            </TabsTrigger>
            <TabsTrigger value="camera" data-testid="camera-scanner-tab">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" data-testid="manual-input-tab">
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usb" className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <Scan className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                Use your USB barcode scanner to scan an item
              </p>
              <form onSubmit={handleUsbSubmit}>
                <Input
                  ref={usbInputRef}
                  data-testid="usb-barcode-input"
                  type="text"
                  placeholder="Scan barcode here..."
                  value={usbBarcode}
                  onChange={(e) => setUsbBarcode(e.target.value)}
                  className="h-10 rounded-md border border-slate-200 text-center font-mono"
                  disabled={loading}
                  autoFocus
                />
                <Button
                  data-testid="usb-submit-btn"
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 bg-${actionColor}-600 hover:bg-${actionColor}-700 text-white rounded-lg h-10`}
                  style={{
                    backgroundColor: action === "checkin" ? "#10b981" : "#f59e0b"
                  }}
                >
                  {loading ? "Processing..." : actionText}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
              {!cameraEnabled ? (
                <>
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">
                    Enable camera to scan barcodes
                  </p>
                  <Button
                    data-testid="enable-camera-btn"
                    onClick={() => setCameraEnabled(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                  >
                    Enable Camera
                  </Button>
                </>
              ) : (
                <div>
                  <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-4">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    Camera scanning requires additional barcode detection library.
                    Please use USB scanner or manual input for now.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manualBarcode" className="text-sm font-medium">
                  Enter Barcode
                </Label>
                <Input
                  id="manualBarcode"
                  data-testid="manual-barcode-input"
                  type="text"
                  placeholder="Type barcode manually"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="h-10 rounded-md border border-slate-200 font-mono"
                  disabled={loading}
                />
              </div>

              <Button
                data-testid="manual-submit-btn"
                type="submit"
                disabled={loading}
                className={`w-full bg-${actionColor}-600 hover:bg-${actionColor}-700 text-white rounded-lg h-10`}
                style={{
                  backgroundColor: action === "checkin" ? "#10b981" : "#f59e0b"
                }}
              >
                {loading ? "Processing..." : actionText}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScanModal;
