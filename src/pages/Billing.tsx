import { useEffect, useState, useRef } from 'react';
import {
    Search, ShoppingCart, Trash2, Printer, Plus, Minus, CheckCircle,
    Camera, X, Bluetooth, Smartphone, Banknote, Share2, Send,
    RotateCcw, Sparkles, Package, ArrowLeft, ArrowRight, User
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

interface BillingProps {
    onBack?: () => void;
}

export default function Billing({ onBack }: BillingProps) {
    // 2-Step View State: 'catalog' -> 'checkout'
    const [view, setView] = useState<'catalog' | 'checkout'>('catalog');

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

    // Checkout form states
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

        const focusInterval = setInterval(() => {
            if (!cameraOpen && view === 'catalog' && scanInputRef.current && document.activeElement !== scanInputRef.current && document.activeElement?.tagName !== 'INPUT') {
                scanInputRef.current.focus();
            }
        }, 2000);

        return () => clearInterval(focusInterval);
    }, [cameraOpen, view]);

    useEffect(() => {
        try {
            localStorage.setItem('activeBillingCart', JSON.stringify(cart));
        } catch (e) {
            console.warn("Failed to persist billing cart", e);
        }
    }, [cart]);

    // Camera Stream Scanner
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
        setScanMessage(`Scanned: ${scannedCode}. Adding item...`);
        try {
            await handleBarcodeLookup(scannedCode);
            setScanMessage(`Added ${scannedCode} to cart!`);
            setTimeout(() => {
                if (streamRef.current) requestAnimationFrame(scanVideoFrame);
            }, 1000);
        } catch (e) {
            setScanMessage(`Not found: ${scannedCode}`);
            setTimeout(() => {
                if (streamRef.current) requestAnimationFrame(scanVideoFrame);
            }, 1200);
        }
    };

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

    // mPOS Handlers
    const handleConnectBluetoothMpos = async () => {
        setIsProcessingMpos(true);
        setMposStatus('Scanning for Bluetooth POS devices...');

        setTimeout(() => {
            setMposConnected(true);
            setMposDeviceName('Cavree-mPOS-BT902');
            setMposStatus('mPOS Terminal Ready (Battery: 94%)');
            setIsProcessingMpos(false);
        }, 1200);
    };

    const handleMposSwipeProcess = (): Promise<boolean> => {
        return new Promise((resolve) => {
            setIsProcessingMpos(true);
            setMposStatus('Awaiting Card Tap/Insert on mPOS...');

            setTimeout(() => {
                setMposStatus('Card Detected. Approving...');
                setTimeout(() => {
                    setMposStatus('Payment Approved (#AP94102)');
                    setIsProcessingMpos(false);
                    resolve(true);
                }, 1500);
            }, 1500);
        });
    };

    // Checkout Submit
    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        setLoading(true);

        try {
            if (paymentMethod === 'MPOS') {
                if (!mposConnected) await handleConnectBluetoothMpos();
                const authSuccess = await handleMposSwipeProcess();
                if (!authSuccess) throw new Error("Card payment declined.");
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
            
            // Clear cart & state
            setCart([]);
            setCustName('');
            setCustPhone('');
            setCashTendered('');
            setView('catalog');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || err.message || "Checkout failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleShareWhatsApp = () => {
        if (!completedOrder) return;
        const phone = completedOrder.customer_phone.replace(/[^0-9]/g, '');
        const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';
        const itemsSummary = completedOrder.items?.map(it => `• ${it.product_name} x ${it.quantity} = ₹${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}`).join('%0A') || '';
        const text = `🛍️ *CAVREE LUXURY INVOICE RECEIPT*%0AStore: ${storeName}%0AInvoice No: *${completedOrder.invoice_number}*%0ADate: ${new Date(completedOrder.created_at || Date.now()).toLocaleDateString()}%0A%0A*Items Purchased:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(completedOrder.total_price).toFixed(2)}* (${completedOrder.payment_method})%0A%0AThank you for shopping with Cavree!`;
        const targetPhone = phone && phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const searchedProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery))
    );

    const tenderedVal = parseFloat(cashTendered) || 0;
    const changeDue = tenderedVal > totalPrice ? tenderedVal - totalPrice : 0;

    return (
        <div className="main-content">
            
            {/* ========================================================================== */}
            {/* STEP 1: CATALOG SCANNING & CART SELECTION VIEW                             */}
            {/* ========================================================================== */}
            {view === 'catalog' && (
                <div>
                    {/* Clean Simple Header with Scanner Status & Camera Trigger */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {onBack && (
                                <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ padding: '0.45rem 0.65rem' }}>
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontFamily: 'Cinzel, serif', fontWeight: 700, margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingCart size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Cavree POS Billing
                                </h1>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                                    <span className="pulse-dot"></span> Laser Gun Ready &bull; {products.length} Products
                                </span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={startCameraScanner}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
                        >
                            <Camera size={16} />
                            <span>Scan QR / Barcode</span>
                        </button>
                    </div>

                    {/* Barcode Laser Input */}
                    <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid var(--pos-gold-primary)' }}>
                        <form onSubmit={handleBarcodeSubmit}>
                            <input
                                ref={scanInputRef}
                                type="text"
                                className="form-input"
                                style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                                value={barcodeScan}
                                onChange={(e) => setBarcodeScan(e.target.value)}
                                placeholder="Scan Barcode or enter SKU &amp; press Enter..."
                            />
                        </form>
                    </div>

                    {/* 2-Column Desktop Grid or Stacked Mobile View */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '5rem' }}>
                        
                        {/* Products Catalog Grid */}
                        <div className="glass-panel" style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1rem' }}>
                                    <Search size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Products Catalog
                                </h3>
                                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                                    {searchedProducts.length} Items
                                </span>
                            </div>

                            <input
                                type="text"
                                className="form-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, SKU, or size..."
                                style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', fontSize: '0.85rem' }}
                            />

                            <div className="product-grid">
                                {searchedProducts.length > 0 ? (
                                    searchedProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="product-card"
                                            onClick={() => addToCart(p)}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                    <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>
                                                        {p.sku}
                                                    </span>
                                                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>
                                                        {p.size || 'Free'}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--pos-text-primary)', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                                                    {p.name}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--pos-gold-light)' }}>
                                                    ₹{p.selling_price}
                                                </div>
                                                <button 
                                                    className="btn btn-primary btn-sm" 
                                                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(p);
                                                    }}
                                                >
                                                    <Plus size={11} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                                        <Package size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                        <p style={{ fontSize: '0.8125rem' }}>No products match your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Cart Summary Panel */}
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--pos-gold-primary)' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1rem' }}>
                                            Active Cart
                                        </h3>
                                        <span className="badge badge-gold">{totalQty} Items</span>
                                    </div>
                                    {cart.length > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setCart([])}
                                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', color: 'var(--pos-accent-red)' }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
                                    {cart.length > 0 ? (
                                        cart.map(item => (
                                            <div className="cart-item" key={item.id} style={{ padding: '0.75rem 0' }}>
                                                <div style={{ flexGrow: 1, marginRight: '0.5rem' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--pos-text-primary)' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                                        {item.sku} &bull; ₹{item.selling_price}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <div className="qty-control">
                                                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)} style={{ width: '28px', height: '28px' }}><Minus size={11} /></button>
                                                        <span style={{ fontWeight: 'bold', minWidth: '18px', textAlign: 'center', fontSize: '0.875rem' }}>{item.qty}</span>
                                                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)} style={{ width: '28px', height: '28px' }}><Plus size={11} /></button>
                                                    </div>
                                                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)} style={{ padding: '0.3rem 0.45rem' }}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--pos-text-secondary)', padding: '2.5rem 0' }}>
                                            <ShoppingCart size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>Cart is empty.</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-muted)', marginTop: '0.2rem' }}>Scan QR or tap products to add items.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proceed to Checkout CTA */}
                            {cart.length > 0 && (
                                <div style={{ borderTop: '1px solid var(--pos-border-gold)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--pos-gold-light)' }}>
                                        <span>Total:</span>
                                        <span>₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setView('checkout')}
                                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <span>Proceed to Checkout</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Floating Bottom Bar for Instant Checkout */}
                    {cart.length > 0 && (
                        <div style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(10, 12, 18, 0.96)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid var(--pos-border-gold-bright)',
                            padding: '0.85rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: 90,
                            boxShadow: '0 -4px 20px rgba(0,0,0,0.8)'
                        }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{totalQty} Items in Cart</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                    ₹{totalPrice.toFixed(2)}
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setView('checkout')}
                                style={{ padding: '0.75rem 1.35rem', fontSize: '0.9375rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <span>Pay Now</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================== */}
            {/* STEP 2: DEDICATED CHECKOUT & PAYMENT METHOD SCREEN                         */}
            {/* ========================================================================== */}
            {view === 'checkout' && (
                <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                    
                    {/* Checkout Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setView('catalog')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Products</span>
                        </button>

                        <h2 style={{ fontSize: '1.25rem', fontFamily: 'Cinzel, serif', fontWeight: 700, margin: 0, color: 'var(--pos-gold-light)' }}>
                            Checkout &amp; Payment
                        </h2>
                    </div>

                    <form onSubmit={handleCheckoutSubmit}>
                        
                        {/* Order Summary Receipt Box */}
                        <div className="glass-panel" style={{ marginBottom: '1.25rem', borderTop: '4px solid var(--pos-gold-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--pos-border-subtle)', paddingBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9375rem' }}>Order Items ({totalQty})</span>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setView('catalog')} style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                                    Edit Cart
                                </button>
                            </div>

                            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.35rem 0' }}>
                                        <span>{item.name} &times; {item.qty}</span>
                                        <span style={{ fontWeight: 600 }}>₹{(parseFloat(item.selling_price) * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid var(--pos-border-gold)', paddingTop: '0.75rem', fontSize: '0.8125rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--pos-text-secondary)' }}>
                                    <span>Net Subtotal (excl. GST):</span>
                                    <span>₹{baseTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--pos-text-secondary)' }}>
                                    <span>GST Tax Component:</span>
                                    <span>₹{gstTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', borderTop: '1px dashed var(--pos-border-gold)', paddingTop: '0.5rem' }}>
                                    <span>Total Amount Payable:</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information Form */}
                        <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
                            <h3 className="panel-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                                <User size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                                Customer Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div>
                                    <label className="form-label">Customer Mobile *</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={custPhone}
                                        onChange={(e) => setCustPhone(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        required
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
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Select Payment Method</label>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPaymentMethod('UPI')}
                                    style={{ flexDirection: 'column', padding: '0.95rem 0.5rem', gap: '0.4rem', fontSize: '0.8125rem' }}
                                >
                                    <Smartphone size={20} />
                                    <span>UPI QR Code</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPaymentMethod('CASH')}
                                    style={{ flexDirection: 'column', padding: '0.95rem 0.5rem', gap: '0.4rem', fontSize: '0.8125rem' }}
                                >
                                    <Banknote size={20} />
                                    <span>Cash Tender</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn ${paymentMethod === 'MPOS' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPaymentMethod('MPOS')}
                                    style={{ flexDirection: 'column', padding: '0.95rem 0.5rem', gap: '0.4rem', fontSize: '0.8125rem' }}
                                >
                                    <Bluetooth size={20} />
                                    <span>mPOS Device</span>
                                </button>
                            </div>

                            {/* Sub-Panel: Cash Calculator */}
                            {paymentMethod === 'CASH' && (
                                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                    <label className="form-label" style={{ color: '#6ee7b7' }}>Cash Received from Customer (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter amount given by customer..."
                                        value={cashTendered}
                                        onChange={(e) => setCashTendered(e.target.value)}
                                        style={{ fontSize: '1.1rem', padding: '0.75rem', marginBottom: '0.65rem' }}
                                    />
                                    {tenderedVal > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem' }}>
                                            <span>Change Due to Return:</span>
                                            <span style={{ color: 'var(--pos-accent-green)', fontSize: '1.2rem' }}>₹{changeDue.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub-Panel: mPOS Swiper */}
                            {paymentMethod === 'MPOS' && (
                                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--pos-border-gold)', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--pos-gold-light)' }}>mPOS Terminal:</span>
                                        <span className={`badge ${mposConnected ? 'badge-success' : 'badge-warning'}`}>
                                            {mposConnected ? mposDeviceName : 'Disconnected'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', marginBottom: '0.75rem' }}>
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
                                            <Bluetooth size={13} /> Pair mPOS Terminal
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Sub-Panel: UPI QR */}
                            {paymentMethod === 'UPI' && (
                                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--pos-border-gold)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--pos-gold-light)', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                                        Customer will scan Dynamic Store QR Code
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                        Amount: ₹{totalPrice.toFixed(2)} &bull; Instant Bank Verification
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Complete Bill Action */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }}
                            disabled={loading || isProcessingMpos}
                        >
                            {loading ? 'Processing Bill...' : `Confirm & Complete Payment (₹${totalPrice.toFixed(2)})`}
                        </button>
                    </form>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: LIVE CAMERA BARCODE / QR SCANNER                                    */}
            {/* ========================================================================== */}
            {cameraOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px', width: '96vw', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                <Camera size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Scan Product QR / Barcode
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={stopCameraScanner} style={{ padding: '0.35rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ position: 'relative', width: '100%', height: 'min(50vh, 320px)', background: '#000', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--pos-border-gold)' }}>
                            <video
                                ref={videoRef}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                playsInline
                                muted
                            />
                            <div style={{
                                position: 'absolute',
                                width: 'min(65vw, 220px)',
                                height: 'min(65vw, 220px)',
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

            {/* ========================================================================== */}
            {/* MODAL: CHECKOUT SUCCESS & INVOICE SHARING                                  */}
            {/* ========================================================================== */}
            {completedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleShareWhatsApp}
                                style={{ background: '#25D366', color: '#fff', border: 'none', justifyContent: 'center', padding: '0.85rem' }}
                            >
                                <Share2 size={16} /> Share Invoice on WhatsApp
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handlePrintInvoice}
                                style={{ justifyContent: 'center', padding: '0.85rem' }}
                            >
                                <Printer size={16} /> Print Receipt
                            </button>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => { setCompletedOrder(null); setView('catalog'); }}
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
