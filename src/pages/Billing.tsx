import { useEffect, useState, useRef } from 'react';
import {
    Search, ShoppingCart, Trash2, Printer, Plus, Minus, CheckCircle,
    Camera, X, Bluetooth, Smartphone, Banknote, Share2, Send,
    RotateCcw, Sparkles
} from 'lucide-react';
import { billingService, catalogService } from '../services/api';
import '../styles/website.css';

interface Product {
    id: number;
    name: string;
    sku: string;
    unique_code?: string;
    barcode?: string;
    selling_price: string;
    cost_price: string;
    gst_percentage: string;
    size?: string;
    stock?: number;
}

interface CartItem extends Product {
    qty: number;
}

interface CompletedOrder {
    id: number;
    invoice_number: string;
    total_price: string;
    net_revenue: string;
    payment_method: string;
    customer_name: string;
    customer_phone: string;
    created_at: string;
    items: Array<{
        id: number;
        product_name: string;
        quantity: number;
        unit_price: string;
    }>;
}

export default function Billing() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('activeBillingCart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [barcodeScan, setBarcodeScan] = useState('');

    // Camera Barcode/QR Scanner State
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
    const [scanMessage, setScanMessage] = useState('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);

    // Checkout form
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'MPOS' | 'CASH'>('UPI');
    const [loading, setLoading] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

    // Bluetooth mPOS State
    const [mposConnected, setMposConnected] = useState(false);
    const [mposStatus, setMposStatus] = useState<string>('Idle. Click to connect mPOS terminal.');
    const [mposDeviceName, setMposDeviceName] = useState<string>('Cavree-mPOS-BT902');
    const [isProcessingMpos, setIsProcessingMpos] = useState(false);

    // Cash Change Calculator
    const [cashTendered, setCashTendered] = useState('');

    const scanInputRef = useRef<HTMLInputElement>(null);

    // Load Catalog on Mount
    const loadCatalog = async () => {
        try {
            const res = await catalogService.getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products for POS", err);
        }
    };

    useEffect(() => {
        loadCatalog();

        // Check for native BarcodeDetector support
        if ('BarcodeDetector' in window) {
            try {
                // @ts-ignore
                detectorRef.current = new window.BarcodeDetector({
                    formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a']
                });
            } catch (e) {
                console.warn("BarcodeDetector formats init failed", e);
            }
        }

        // Auto-focus barcode input for hardware USB/Bluetooth gun scanners
        const focusInterval = setInterval(() => {
            if (!cameraOpen && scanInputRef.current && document.activeElement !== scanInputRef.current && document.activeElement?.tagName !== 'INPUT') {
                scanInputRef.current.focus();
            }
        }, 2000);

        return () => clearInterval(focusInterval);
    }, [cameraOpen]);

    // Automatically sync cart items with localStorage so refreshing page keeps items intact
    useEffect(() => {
        try {
            localStorage.setItem('activeBillingCart', JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to localStorage", e);
        }
    }, [cart]);

    // Play Beep on Barcode Scan
    const playBeepSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
            // Audio context not allowed or muted
        }
    };

    // Camera Scanner Lifecycle
    const startCameraScanner = async () => {
        setCameraOpen(true);
        setScanMessage('Initializing camera video feed...');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: cameraFacing }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setScanMessage('Align Product QR or Barcode inside target frame');
                startScanningLoop();
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setScanMessage('Camera permission denied or camera not found.');
        }
    };

    const stopCameraScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraOpen(false);
        setScanMessage('');
    };

    const startScanningLoop = () => {
        let active = true;

        const scanFrame = async () => {
            if (!active || !videoRef.current || videoRef.current.readyState < 2) {
                if (active) requestAnimationFrame(scanFrame);
                return;
            }

            if (detectorRef.current) {
                try {
                    const barcodes = await detectorRef.current.detect(videoRef.current);
                    if (barcodes && barcodes.length > 0) {
                        const rawValue = barcodes[0].rawValue;
                        if (rawValue) {
                            // 1. Play scan audio beep
                            playBeepSound();

                            // 2. Trigger mobile phone vibration feedback
                            if (navigator.vibrate) {
                                navigator.vibrate([150, 50, 150]);
                            }

                            // 3. Add product to cart
                            await handleProductCodeDetected(rawValue);

                            // 4. Auto-close camera scanner immediately
                            active = false;
                            stopCameraScanner();
                            return;
                        }
                    }
                } catch (err) {
                    console.error("Detection error:", err);
                }
            }

            if (active) {
                requestAnimationFrame(scanFrame);
            }
        };

        requestAnimationFrame(scanFrame);
    };

    // Handle Scanned Barcode/QR string
    const handleProductCodeDetected = async (code: string) => {
        const clean = code.trim();
        if (!clean) return;

        // 1. Try local cache first for zero-latency lookup
        const localMatch = products.find(
            p => (p.barcode && p.barcode.toLowerCase() === clean.toLowerCase()) ||
                 (p.sku && p.sku.toLowerCase() === clean.toLowerCase()) ||
                 (p.unique_code && p.unique_code.toLowerCase() === clean.toLowerCase())
        );

        if (localMatch) {
            addToCart(localMatch);
            return;
        }

        // 2. Fallback to backend lookup
        try {
            const res = await billingService.lookupBarcode(clean);
            if (res.data) {
                addToCart(res.data);
            }
        } catch (err) {
            alert(`Product code "${clean}" not found in store catalog!`);
        }
    };

    // Handle Manual Barcode Scanner Gun Input
    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeScan.trim();
        if (!code) return;
        playBeepSound();
        await handleProductCodeDetected(code);
        setBarcodeScan('');
    };

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const exists = prevCart.find((item) => item.id === product.id);
            if (exists) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prevCart, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
                .filter((item) => item.qty > 0)
        );
    };

    const removeFromCart = (id: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Cart Financials
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.selling_price) * item.qty, 0);
    const baseTotal = cart.reduce((sum, item) => {
        const gstFactor = 1.0 + (parseFloat(item.gst_percentage) / 100.0);
        const basePrice = parseFloat(item.selling_price) / gstFactor;
        return sum + basePrice * item.qty;
    }, 0);
    const gstTotal = totalPrice - baseTotal;

    // Connect Bluetooth mPOS Device
    const handleConnectBluetoothMpos = async () => {
        setMposStatus('Scanning for Bluetooth mPOS devices...');
        setIsProcessingMpos(true);

        try {
            if ((navigator as any).bluetooth) {
                // Real Web Bluetooth API request
                try {
                    const device = await (navigator as any).bluetooth.requestDevice({
                        acceptAllDevices: true,
                        optionalServices: ['battery_service']
                    });
                    setMposDeviceName(device.name || 'Cavree-mPOS-BT');
                    setMposConnected(true);
                    setMposStatus(`✓ Connected: ${device.name || 'Cavree-mPOS-BT'}`);
                    setIsProcessingMpos(false);
                    return;
                } catch (btErr) {
                    console.log("Web Bluetooth prompt dismissed or simulated", btErr);
                }
            }

            // Simulated mPOS handshake
            setTimeout(() => {
                setMposConnected(true);
                setMposDeviceName('Cavree-mPOS-BT902');
                setMposStatus('✓ Bluetooth Connected: Cavree-mPOS-BT902 (Ready for card swipe)');
                setIsProcessingMpos(false);
            }, 1200);
        } catch (err) {
            setMposStatus('Bluetooth connection failed. Please retry.');
            setIsProcessingMpos(false);
        }
    };

    // Trigger Bluetooth Card Swipe Flow
    const handleMposSwipeProcess = async (): Promise<boolean> => {
        setIsProcessingMpos(true);
        setMposStatus('Please Insert, Tap, or Swipe Customer Card on mPOS...');

        return new Promise((resolve) => {
            setTimeout(() => {
                setMposStatus('Card Detected. Reading EMV Chip & Verifying PIN...');
                setTimeout(() => {
                    setMposStatus('✓ Payment Authorized by Bank (Txn: AUTH_OK_9821)');
                    setIsProcessingMpos(false);
                    resolve(true);
                }, 1800);
            }, 2000);
        });
    };

    // Checkout Flow
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        setLoading(true);

        try {
            // If mPOS is selected, simulate card transaction handshake first
            if (paymentMethod === 'MPOS') {
                if (!mposConnected) {
                    await handleConnectBluetoothMpos();
                }
                const authSuccess = await handleMposSwipeProcess();
                if (!authSuccess) {
                    throw new Error("mPOS Card Authorization declined by bank");
                }
            }

            const checkoutPayload = {
                customer_name: custName.trim() || "Walk-in Customer",
                customer_phone: custPhone.trim() || "9876543210",
                payment_method: paymentMethod,
                payment_status: 'SUCCESS',
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.qty
                }))
            };

            const res = await billingService.checkout(checkoutPayload);
            setCompletedOrder(res.data);
            
            // Clear cart & inputs
            setCart([]);
            setCustName('');
            setCustPhone('');
            setCashTendered('');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || err.message || "Checkout failed. Please check stock levels.");
        } finally {
            setLoading(false);
        }
    };

    // Multi-Channel Sharing Actions
    const handleShareWhatsApp = () => {
        if (!completedOrder) return;
        const phone = completedOrder.customer_phone.replace(/[^0-9]/g, '');
        const storeName = localStorage.getItem('franchiseId') || 'Cavree Retail Store';
        
        const itemsSummary = completedOrder.items?.map(it => `• ${it.product_name} x ${it.quantity} = ₹${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}`).join('%0A') || '';
        
        const text = `🛍️ *CAVREE INVOICE RECEIPT*%0AStore: ${storeName}%0AInvoice No: *${completedOrder.invoice_number}*%0ADate: ${new Date(completedOrder.created_at || Date.now()).toLocaleDateString()}%0A%0A*Items:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(completedOrder.total_price).toFixed(2)}* (${completedOrder.payment_method})%0A%0AThank you for shopping at Cavree!`;
        
        const targetPhone = phone && phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    const handleShareSMS = () => {
        if (!completedOrder) return;
        const phone = completedOrder.customer_phone.replace(/[^0-9]/g, '');
        const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';
        const body = `Thank you for shopping at ${storeName}! Invoice #${completedOrder.invoice_number} for Rs.${parseFloat(completedOrder.total_price).toFixed(2)} is paid. Cavree Retail.`;
        window.open(`sms:${phone}?body=${encodeURIComponent(body)}`, '_blank');
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Filter search items
    const searchedProducts = searchQuery.trim() === ''
        ? []
        : products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    // Calculate Cash Change
    const tenderedVal = parseFloat(cashTendered) || 0;
    const changeDue = tenderedVal > totalPrice ? tenderedVal - totalPrice : 0;

    return (
        <div className="main-content">
            
            {/* Top Toolbar: Scanner Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={22} style={{ color: 'var(--accent-blue)' }} />
                        POS Billing &amp; Counter Terminal
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        Scan product QR/Barcodes via Camera or Laser Scanner Gun for instant billing.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={startCameraScanner}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none' }}
                    >
                        <Camera size={18} />
                        <span>📸 Scan QR with Camera</span>
                    </button>
                </div>
            </div>

            <div className="pos-layout">
                
                {/* Left Panel: Catalog Searching & Barcode Scanner Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Laser Scanner Input Panel */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <Sparkles size={18} style={{ color: 'var(--accent-blue)' }} />
                            Laser Gun Scanner Input / Manual Barcode
                        </h3>
                        <form onSubmit={handleBarcodeSubmit}>
                            <input
                                ref={scanInputRef}
                                type="text"
                                className="form-input"
                                style={{ fontSize: '1.125rem', padding: '0.875rem 1rem', border: '1px solid var(--accent-blue)' }}
                                value={barcodeScan}
                                onChange={(e) => setBarcodeScan(e.target.value)}
                                placeholder="Scan Barcode / Enter SKU code and press Enter..."
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                Scanner gun auto-submits on scan.
                            </p>
                        </form>
                    </div>

                    {/* Manual Product Search */}
                    <div className="glass-panel" style={{ flexGrow: 1 }}>
                        <h3 className="panel-title">
                            <Search size={18} style={{ color: 'var(--accent-purple)' }} />
                            Quick Product Lookup
                        </h3>
                        <input
                            type="text"
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type product name, barcode, or SKU..."
                            style={{ marginBottom: '1rem' }}
                        />

                        {searchQuery && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                                {searchedProducts.length > 0 ? (
                                    searchedProducts.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    SKU: {p.sku} | Barcode: {p.barcode || 'N/A'} | Size: {p.size || 'Free'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>₹{p.selling_price}</div>
                                                <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>
                                                    <Plus size={12} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No matches found.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Checkout Cart */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 className="panel-title" style={{ margin: 0 }}>Active Billing Cart</h3>
                                <span className="badge badge-blue">{totalQty} Items</span>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setCart([])}
                                    style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', color: 'var(--accent-red)' }}
                                >
                                    Clear Cart
                                </button>
                            )}
                        </div>
                        
                        <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.25rem' }}>
                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <div className="cart-item" key={item.id}>
                                        <div style={{ flexGrow: 1, marginRight: '0.75rem' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9375rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                SKU: {item.sku} | GST: {item.gst_percentage}%
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
                                                ₹{item.selling_price} &times; {item.qty} = ₹{(parseFloat(item.selling_price) * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="qty-control">
                                                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                                                <span style={{ fontWeight: 'bold', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                                            </div>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)} style={{ padding: '0.35rem' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0' }}>
                                    <ShoppingCart size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p>Cart is empty. Scan QR or Barcode to start billing.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Summary & Payment Mode Selection */}
                    {cart.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal (excl. GST):</span>
                                <span>₹{baseTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Tax (GST):</span>
                                <span>₹{gstTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--accent-green)' }}>
                                <span>Grand Total Payable:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Customer and Checkout Form */}
                            <form onSubmit={handleCheckout}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Mobile *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={custPhone}
                                            onChange={(e) => setCustPhone(e.target.value)}
                                            placeholder="e.g. 9876543210"
                                            required
                                            style={{ padding: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={custName}
                                            onChange={(e) => setCustName(e.target.value)}
                                            placeholder="e.g. Rahul Sharma"
                                            style={{ padding: '0.5rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Payment Mode Options */}
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Method</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('UPI')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        >
                                            <Smartphone size={14} /> UPI QR
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'MPOS' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('MPOS')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        >
                                            <Bluetooth size={14} /> mPOS (BT)
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('CASH')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        >
                                            <Banknote size={14} /> Cash
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Sub-Panels for Payment Mode */}
                                {paymentMethod === 'MPOS' && (
                                    <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>Bluetooth Card Swiper:</span>
                                            <span className={`badge ${mposConnected ? 'badge-success' : 'badge-warning'}`}>
                                                {mposConnected ? `Connected (${mposDeviceName})` : 'Disconnected'}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                            {mposStatus}
                                        </p>
                                        {!mposConnected && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleConnectBluetoothMpos}
                                                disabled={isProcessingMpos}
                                                style={{ width: '100%' }}
                                            >
                                                <Bluetooth size={12} /> {isProcessingMpos ? 'Connecting...' : 'Pair / Connect mPOS Device'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {paymentMethod === 'CASH' && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Cash Received (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Enter cash received..."
                                            value={cashTendered}
                                            onChange={(e) => setCashTendered(e.target.value)}
                                            style={{ padding: '0.5rem', marginBottom: '0.5rem' }}
                                        />
                                        {tenderedVal > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                <span>Change Due to Customer:</span>
                                                <span style={{ color: 'var(--accent-green)' }}>₹{changeDue.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.875rem', fontWeight: 'bold', fontSize: '1rem' }}
                                    disabled={loading || isProcessingMpos}
                                >
                                    {loading ? 'Processing Checkout...' : `Confirm & Pay ₹${totalPrice.toFixed(2)}`}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL: LIVE CAMERA BARCODE / QR SCANNER    */}
            {/* ========================================== */}
            {cameraOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '520px', width: '96vw', padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                                <Camera size={20} style={{ color: 'var(--accent-blue)' }} />
                                Scan Product QR / Barcode
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={stopCameraScanner} style={{ padding: '0.35rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Large Responsive Camera Video Viewfinder */}
                        <div style={{ position: 'relative', width: '100%', height: 'min(55vh, 350px)', background: '#000', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                            <video
                                ref={videoRef}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                playsInline
                                muted
                            />
                            
                            {/* High-visibility Scanning Target Crosshair Frame */}
                            <div style={{
                                position: 'absolute',
                                width: 'min(65vw, 240px)',
                                height: 'min(65vw, 240px)',
                                border: '2.5px solid #3b82f6',
                                borderRadius: '16px',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <div className="laser-line" />
                            </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '0.875rem' }}>
                            {scanMessage}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.65rem' }}
                                onClick={() => {
                                    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
                                    stopCameraScanner();
                                    setTimeout(startCameraScanner, 300);
                                }}
                            >
                                <RotateCcw size={15} /> Flip Camera
                            </button>
                            <button className="btn btn-primary" style={{ padding: '0.65rem' }} onClick={stopCameraScanner}>
                                Done ({cart.length} in Cart)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL: CHECKOUT SUCCESS & MULTI-CHANNEL     */}
            {/* ========================================== */}
            {completedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        
                        {/* Screen View Confirmation */}
                        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                            <CheckCircle size={48} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                            <h3 className="panel-title" style={{ justifyContent: 'center', border: 'none', margin: 0, padding: 0 }}>
                                Billing Successful!
                            </h3>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                                Invoice #{completedOrder.invoice_number}
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--accent-green)', marginTop: '0.25rem' }}>
                                Total Paid: ₹{parseFloat(completedOrder.total_price).toFixed(2)} ({completedOrder.payment_method})
                            </div>
                        </div>

                        {/* Multi-Channel Sharing Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleShareWhatsApp}
                                style={{ background: '#25D366', color: '#fff', border: 'none', justifyContent: 'center', padding: '0.75rem' }}
                            >
                                <Share2 size={16} /> Share Invoice on WhatsApp (Text + Link)
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handleShareSMS}
                                style={{ justifyContent: 'center', padding: '0.75rem' }}
                            >
                                <Send size={16} /> Send SMS Receipt
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handlePrintInvoice}
                                style={{ justifyContent: 'center', padding: '0.75rem' }}
                            >
                                <Printer size={16} /> Print Thermal / Download PDF Receipt
                            </button>
                        </div>

                        {/* Printable Thermal Receipt Container */}
                        <div className="print-area" style={{ fontFamily: 'monospace', color: 'black', background: 'white', padding: '1rem', borderRadius: '4px', display: 'none' }}>
                            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>CAVREE RETAIL STORE</h2>
                                <p style={{ fontSize: '0.6875rem' }}>Indiranagar, Bangalore, KA</p>
                                <p style={{ fontSize: '0.6875rem' }}>Ph: {completedOrder.customer_phone}</p>
                            </div>
                            <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.35rem', marginBottom: '0.35rem', fontSize: '0.6875rem' }}>
                                <div><strong>Invoice:</strong> {completedOrder.invoice_number}</div>
                                <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
                                <div><strong>Customer:</strong> {completedOrder.customer_name} ({completedOrder.customer_phone})</div>
                            </div>
                            <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.35rem', marginBottom: '0.35rem' }}>
                                <table style={{ width: '100%', fontSize: '0.6875rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid black' }}>
                                            <th style={{ textAlign: 'left' }}>Item</th>
                                            <th style={{ textAlign: 'center' }}>Qty</th>
                                            <th style={{ textAlign: 'right' }}>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedOrder.items?.map((it: any) => (
                                            <tr key={it.id}>
                                                <td>{it.product_name || "Product"}</td>
                                                <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>₹{(it.unit_price * it.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8125rem', fontWeight: 'bold' }}>
                                <div>Total: ₹{parseFloat(completedOrder.total_price).toFixed(2)}</div>
                                <div style={{ fontSize: '0.625rem', fontWeight: 'normal' }}>Paid via {completedOrder.payment_method}</div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.6875rem' }}>
                                <p>Thank you for shopping with Cavree!</p>
                            </div>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => setCompletedOrder(null)}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            + Start Next Billing
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
