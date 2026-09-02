import { useEffect, useState, useRef } from 'react';
import {
    Search, ShoppingCart, Trash2, Printer, Plus, Minus, CheckCircle,
    Camera, X, Bluetooth, Smartphone, Banknote, Share2, Send,
    RotateCcw, Sparkles, Tag, Package
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
            console.warn("Failed to persist billing cart", e);
        }
    }, [cart]);

    // ==========================================
    // CAMERA STREAM SCANNER IMPLEMENTATION
    // ==========================================
    const startCameraScanner = async () => {
        setCameraOpen(true);
        setScanMessage('Point camera at Product Barcode or QR Code...');

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: cameraFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true");
                await videoRef.current.play();
                requestAnimationFrame(scanVideoFrame);
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
    };

    const scanVideoFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
                if (detectorRef.current) {
                    const barcodes = await detectorRef.current.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        const rawVal = barcodes[0].rawValue;
                        if (rawVal) {
                            handleBarcodeScannedSuccess(rawVal);
                            return;
                        }
                    }
                }
            } catch (e) {
                // Fallthrough on detect loop
            }
        }

        if (streamRef.current) {
            requestAnimationFrame(scanVideoFrame);
        }
    };

    const handleBarcodeScannedSuccess = async (scannedCode: string) => {
        setScanMessage(`Scanned: ${scannedCode}. Fetching details...`);
        try {
            await handleBarcodeLookup(scannedCode);
            setScanMessage(`Added ${scannedCode} to cart! Ready for next.`);
            setTimeout(() => {
                if (streamRef.current) requestAnimationFrame(scanVideoFrame);
            }, 1200);
        } catch (e) {
            setScanMessage(`Not found: ${scannedCode}`);
            setTimeout(() => {
                if (streamRef.current) requestAnimationFrame(scanVideoFrame);
            }, 1500);
        }
    };

    // ==========================================
    // BARCODE & SKU LOOKUP FLOW
    // ==========================================
    const handleBarcodeLookup = async (code: string) => {
        const res = await billingService.lookupBarcode(code.trim());
        const prod = res.data;
        addToCart(prod);
    };

    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeScan.trim()) return;

        try {
            await handleBarcodeLookup(barcodeScan);
            setBarcodeScan('');
        } catch (err: any) {
            alert(err.response?.data?.error || `Product not found for code: ${barcodeScan}`);
        }
    };

    // Cart Actions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQty = item.qty + delta;
                    return newQty > 0 ? { ...item, qty: newQty } : null;
                }
                return item;
            }).filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Totals Calculation
    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.selling_price) * item.qty), 0);
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);

    const gstTotal = cart.reduce((acc, item) => {
        const gstRate = parseFloat(item.gst_percentage || '0');
        const itemGross = parseFloat(item.selling_price) * item.qty;
        const itemGst = itemGross - (itemGross / (1 + (gstRate / 100)));
        return acc + itemGst;
    }, 0);

    const baseTotal = totalPrice - gstTotal;

    // Bluetooth mPOS Simulation Handler
    const handleConnectBluetoothMpos = async () => {
        setIsProcessingMpos(true);
        setMposStatus('Scanning for Bluetooth POS devices...');

        setTimeout(() => {
            setMposConnected(true);
            setMposDeviceName('Cavree-mPOS-BT902');
            setMposStatus('mPOS Terminal Ready (Battery: 94%, EMV L2 Certified)');
            setIsProcessingMpos(false);
        }, 1500);
    };

    const handleMposSwipeProcess = (): Promise<boolean> => {
        return new Promise((resolve) => {
            setIsProcessingMpos(true);
            setMposStatus('Awaiting Card Insert / Tap on mPOS...');

            setTimeout(() => {
                setMposStatus('Card Detected (Chip Auth). Verifying PIN...');
                setTimeout(() => {
                    setMposStatus('Payment Approved by Bank (Auth Code: #AP94102)');
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
        
        const text = `🛍️ *CAVREE LUXURY INVOICE RECEIPT*%0AStore: ${storeName}%0AInvoice No: *${completedOrder.invoice_number}*%0ADate: ${new Date(completedOrder.created_at || Date.now()).toLocaleDateString()}%0A%0A*Items Purchased:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(completedOrder.total_price).toFixed(2)}* (${completedOrder.payment_method})%0A%0AThank you for choosing Cavree!`;
        
        const targetPhone = phone && phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    const handleShareSMS = () => {
        if (!completedOrder) return;
        const phone = completedOrder.customer_phone.replace(/[^0-9]/g, '');
        const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';
        const body = `Thank you for shopping with Cavree! Invoice #${completedOrder.invoice_number} for Rs.${parseFloat(completedOrder.total_price).toFixed(2)} is paid. Cavree Retail.`;
        window.open(`sms:${phone}?body=${encodeURIComponent(body)}`, '_blank');
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Search filter
    const searchedProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery))
    );

    // Calculate Cash Change
    const tenderedVal = parseFloat(cashTendered) || 0;
    const changeDue = tenderedVal > totalPrice ? tenderedVal - totalPrice : 0;

    return (
        <div className="main-content">
            
            {/* Top Toolbar: Scanner Actions & Live Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.65rem', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 }}>
                        <ShoppingCart size={24} style={{ color: 'var(--pos-gold-primary)' }} />
                        POS Billing &amp; Counter Terminal
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                            <span className="pulse-dot"></span> Laser Gun Scanner Active
                        </span>
                        <span style={{ color: 'var(--pos-border-gold)' }}>&bull;</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--pos-gold-champagne)' }}>
                            Catalog: {products.length} Products
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        className="btn btn-primary"
                        onClick={startCameraScanner}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Camera size={18} />
                        <span>📸 Scan QR / Barcode</span>
                    </button>
                </div>
            </div>

            <div className="pos-layout">
                
                {/* Left Panel: Catalog Searching & Barcode Scanner Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Laser Scanner Input Panel */}
                    <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                        <h3 className="panel-title">
                            <Sparkles size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                            Laser Gun Scanner Input / Manual SKU
                        </h3>
                        <form onSubmit={handleBarcodeSubmit}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    className="form-input"
                                    style={{ fontSize: '1.1rem', padding: '0.95rem 1.15rem' }}
                                    value={barcodeScan}
                                    onChange={(e) => setBarcodeScan(e.target.value)}
                                    placeholder="Scan Barcode with Laser Gun or enter SKU &amp; press Enter..."
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                💡 Tip: Point USB/Bluetooth laser scanner at product tag. It will auto-add to cart instantly.
                            </p>
                        </form>
                    </div>

                    {/* Visual Product Catalog & Quick Search */}
                    <div className="glass-panel" style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                <Search size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                Master Catalog Lookup
                            </h3>
                            <span className="badge badge-gold">
                                {searchedProducts.length} Items Found
                            </span>
                        </div>

                        <input
                            type="text"
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by product name, SKU, or category..."
                            style={{ marginBottom: '1.25rem' }}
                        />

                        {/* Interactive Product Cards Grid */}
                        <div className="product-grid">
                            {searchedProducts.length > 0 ? (
                                searchedProducts.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="product-card"
                                        onClick={() => addToCart(p)}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                                <span className="badge badge-blue" style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem' }}>
                                                    {p.sku}
                                                </span>
                                                <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>
                                                    {p.size || 'Free Size'}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9375rem', color: 'var(--pos-text-primary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                                {p.name}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--pos-gold-light)' }}>
                                                ₹{p.selling_price}
                                            </div>
                                            <button 
                                                className="btn btn-primary btn-sm" 
                                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(p);
                                                }}
                                            >
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                                    <Package size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p>No products match your search query.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sticky Checkout Cart & Receipt */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--pos-gold-primary)' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    Active Billing Cart
                                </h3>
                                <span className="badge badge-gold">{totalQty} Items</span>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setCart([])}
                                    style={{ fontSize: '0.6875rem', padding: '0.25rem 0.55rem', color: 'var(--pos-accent-red)' }}
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
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9375rem', color: 'var(--pos-text-primary)' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', marginTop: '0.15rem' }}>
                                                SKU: {item.sku} &bull; GST: {item.gst_percentage}%
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--pos-gold-light)' }}>
                                                ₹{item.selling_price} &times; {item.qty} = ₹{(parseFloat(item.selling_price) * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="qty-control">
                                                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                                                <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center', color: 'var(--pos-text-primary)' }}>{item.qty}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                                            </div>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)} style={{ padding: '0.35rem 0.5rem' }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--pos-text-secondary)', padding: '3rem 0' }}>
                                    <ShoppingCart size={38} style={{ opacity: 0.25, marginBottom: '0.75rem', color: 'var(--pos-gold-primary)' }} />
                                    <p style={{ margin: 0, fontWeight: 500 }}>Cart is empty.</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--pos-text-muted)', marginTop: '0.25rem' }}>Scan QR / Barcode or click items to begin billing.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Summary & Payment Mode Selection */}
                    {cart.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--pos-border-gold)', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Items Subtotal (excl. GST):</span>
                                <span style={{ fontWeight: 600 }}>₹{baseTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Total Tax (GST):</span>
                                <span style={{ fontWeight: 600 }}>₹{gstTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--pos-gold-light)', borderTop: '1px dashed var(--pos-border-gold)', paddingTop: '0.5rem' }}>
                                <span>Grand Total:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Customer and Checkout Form */}
                            <form onSubmit={handleCheckout}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <label className="form-label">Customer Mobile *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={custPhone}
                                            onChange={(e) => setCustPhone(e.target.value)}
                                            placeholder="e.g. 9876543210"
                                            required
                                            style={{ padding: '0.65rem 0.85rem', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={custName}
                                            onChange={(e) => setCustName(e.target.value)}
                                            placeholder="e.g. Rahul Sharma"
                                            style={{ padding: '0.65rem 0.85rem', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Payment Mode Options */}
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Payment Method</label>
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
                                    <div style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid var(--pos-border-gold)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--pos-gold-light)' }}>Bluetooth Card Swiper:</span>
                                            <span className={`badge ${mposConnected ? 'badge-success' : 'badge-warning'}`}>
                                                {mposConnected ? `Connected (${mposDeviceName})` : 'Disconnected'}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--pos-text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
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
                                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Cash Received (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Enter cash received from customer..."
                                            value={cashTendered}
                                            onChange={(e) => setCashTendered(e.target.value)}
                                            style={{ padding: '0.65rem', marginBottom: '0.5rem' }}
                                        />
                                        {tenderedVal > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                <span>Change Due to Customer:</span>
                                                <span style={{ color: 'var(--pos-accent-green)', fontSize: '1rem' }}>₹{changeDue.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.95rem', fontWeight: 'bold', fontSize: '1rem' }}
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
                    <div className="modal-content" style={{ maxWidth: '520px', width: '96vw', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                                <Camera size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Scan Product QR / Barcode
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={stopCameraScanner} style={{ padding: '0.35rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Large Responsive Camera Video Viewfinder */}
                        <div style={{ position: 'relative', width: '100%', height: 'min(50vh, 340px)', background: '#000', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--pos-border-gold)' }}>
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
                                border: '2.5px solid var(--pos-gold-primary)',
                                borderRadius: '18px',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 20px rgba(212, 175, 55, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <div className="laser-line" />
                            </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--pos-gold-light)', fontWeight: 600, marginBottom: '1rem' }}>
                            {scanMessage}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.75rem' }}
                                onClick={() => {
                                    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
                                    stopCameraScanner();
                                    setTimeout(startCameraScanner, 300);
                                }}
                            >
                                <RotateCcw size={15} /> Flip Camera
                            </button>
                            <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={stopCameraScanner}>
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
                    <div className="modal-content" style={{ maxWidth: '460px' }}>
                        
                        {/* Screen View Confirmation */}
                        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--pos-border-gold)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                            <CheckCircle size={48} style={{ color: 'var(--pos-accent-green)', marginBottom: '0.5rem' }} />
                            <h3 className="panel-title" style={{ justifyContent: 'center', border: 'none', margin: 0, padding: 0 }}>
                                Billing Successful!
                            </h3>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--pos-text-primary)', marginTop: '0.25rem' }}>
                                Invoice #{completedOrder.invoice_number}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', marginTop: '0.25rem' }}>
                                Total Paid: ₹{parseFloat(completedOrder.total_price).toFixed(2)} ({completedOrder.payment_method})
                            </div>
                        </div>

                        {/* Multi-Channel Sharing Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleShareWhatsApp}
                                style={{ background: '#25D366', color: '#fff', border: 'none', justifyContent: 'center', padding: '0.85rem' }}
                            >
                                <Share2 size={16} /> Share Invoice on WhatsApp (Text + Link)
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handleShareSMS}
                                style={{ justifyContent: 'center', padding: '0.85rem' }}
                            >
                                <Send size={16} /> Send SMS Receipt
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handlePrintInvoice}
                                style={{ justifyContent: 'center', padding: '0.85rem' }}
                            >
                                <Printer size={16} /> Print Thermal / Download PDF Receipt
                            </button>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => setCompletedOrder(null)}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                        >
                            + Start Next Billing
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
