import React, { useEffect, useState, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Printer, Plus, Minus, CheckCircle } from 'lucide-react';
import { billingService, catalogService } from '../services/api';
import '../styles/website.css';

export default function Billing() {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [barcodeScan, setBarcodeScan] = useState('');
    
    // Checkout form
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, CASH
    const [loading, setLoading] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any | null>(null);

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
        
        // Auto-focus the barcode scanning field so Type-C scanner typing goes directly here
        const focusInterval = setInterval(() => {
            if (scanInputRef.current && document.activeElement !== scanInputRef.current) {
                scanInputRef.current.focus();
            }
        }, 1200);

        return () => clearInterval(focusInterval);
    }, []);

    // Handle Barcode Scanner Input
    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeScan.trim();
        if (!code) return;

        try {
            const res = await billingService.lookupBarcode(code);
            const product = res.data;
            addToCart(product);
        } catch (err) {
            alert(`Product with barcode "${code}" not found!`);
        } finally {
            setBarcodeScan('');
        }
    };

    const addToCart = (product: any) => {
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

    // Calculations
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.selling_price) * item.qty, 0);
    
    // Compute Cost and GST breakdown
    const baseTotal = cart.reduce((sum, item) => {
        const gstFactor = 1.0 + (parseFloat(item.gst_percentage) / 100.0);
        const basePrice = parseFloat(item.selling_price) / gstFactor;
        return sum + basePrice * item.qty;
    }, 0);
    const gstTotal = totalPrice - baseTotal;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        setLoading(true);

        try {
            const checkoutPayload = {
                customer_name: custName || "Walk-in Customer",
                customer_phone: custPhone || "0000000000",
                payment_method: paymentMethod,
                payment_status: 'SUCCESS', // Automatically settled on scanner checkout
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.qty
                }))
            };

            const res = await billingService.checkout(checkoutPayload);
            setCompletedOrder(res.data);
            
            // Clear checkout context
            setCart([]);
            setCustName('');
            setCustPhone('');
        } catch (err) {
            console.error(err);
            alert("Checkout failed. Check server log/stock counts.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Filter search items
    const searchedProducts = searchQuery.trim() === ''
        ? []
        : products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="main-content">
            <div className="pos-layout">
                
                {/* Left Panel: Catalog Searching & Barcode Listening */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Scanner Input Panel */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <ShoppingCart size={18} style={{ color: 'var(--accent-blue)' }} />
                            Type-C Laser Scanner Scanner input
                        </h3>
                        <form onSubmit={handleBarcodeSubmit}>
                            <input
                                ref={scanInputRef}
                                type="text"
                                className="form-input"
                                style={{ fontSize: '1.125rem', padding: '1rem', border: '1px solid var(--accent-blue)' }}
                                value={barcodeScan}
                                onChange={(e) => setBarcodeScan(e.target.value)}
                                placeholder="POINT SCANNER GUN AND SCAN CLOTHES..."
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                Scanner gun OTG auto-submit focused. Keyboard popup blocked.
                            </p>
                        </form>
                    </div>

                    {/* Manual Search Catalog */}
                    <div className="glass-panel" style={{ flexGrow: 1 }}>
                        <h3 className="panel-title">
                            <Search size={18} style={{ color: 'var(--accent-purple)' }} />
                            Search Products manually
                        </h3>
                        <input
                            type="text"
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type product name or SKU..."
                            style={{ marginBottom: '1rem' }}
                        />

                        {searchQuery && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                                {searchedProducts.length > 0 ? (
                                    searchedProducts.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {p.sku} | Size: {p.size || 'Free'}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>₹{p.selling_price}</div>
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
                        <h3 className="panel-title">Active Billing Cart</h3>
                        
                        <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <div className="cart-item" key={item.id}>
                                        <div style={{ flexGrow: 1, marginRight: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9375rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                SZ: {item.size || 'FREE'} | GST: {item.gst_percentage}%
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
                                                ₹{item.selling_price} x {item.qty}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="qty-control">
                                                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                                                <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                                            </div>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)} style={{ padding: '0.35rem' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
                                    No items scanned. Ready for input scan.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Summary & Checkout */}
                    {cart.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Items Count:</span>
                                <span>{totalQty} units</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Base Price (excl. GST):</span>
                                <span>₹{baseTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Tax (GST):</span>
                                <span>₹{gstTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--accent-green)' }}>
                                <span>Total Price:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Customer and Checkout Details */}
                            <form onSubmit={handleCheckout}>
                                <div className="form-group">
                                    <label className="form-label">Customer Mobile</label>
                                    <input type="text" className="form-input" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="e.g. 9876543210" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Customer Name</label>
                                    <input type="text" className="form-input" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="e.g. Rahul Sharma" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Mode</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('UPI')}
                                        >
                                            UPI
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('CARD')}
                                        >
                                            Card
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setPaymentMethod('CASH')}
                                        >
                                            Cash
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }} disabled={loading}>
                                    {loading ? 'Processing Checkout...' : 'Generate Invoice & Checkout'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Invoice Modal Dialog */}
            {completedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '420px' }}>
                        
                        {/* Interactive Screen View */}
                        <div className="screen-receipt-view" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={44} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                            <h3 className="panel-title" style={{ justifyContent: 'center', border: 'none', margin: 0, padding: 0 }}>Checkout Successful</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Invoice No: {completedOrder.invoice_number}</p>
                        </div>

                        {/* Print Receipt Template */}
                        <div className="print-area" style={{ fontFamily: 'monospace', color: 'black', background: 'white', padding: '1rem', borderRadius: '4px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>CAVREE RETAIL STORE</h2>
                                <p style={{ fontSize: '0.75rem' }}>Indiranagar, Bangalore, KA</p>
                                <p style={{ fontSize: '0.75rem' }}>Ph: 9876543210</p>
                            </div>
                            <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                <div><strong>Invoice:</strong> {completedOrder.invoice_number}</div>
                                <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
                                <div><strong>Cashier:</strong> {localStorage.getItem('username')}</div>
                            </div>
                            <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
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
                            <div style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                <div>Total: ₹{parseFloat(completedOrder.total_price).toFixed(2)}</div>
                                <div style={{ fontSize: '0.6875rem', fontWeight: 'normal' }}>Paid via {completedOrder.payment_method}</div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem' }}>
                                <p>Thank you for shopping with Cavree!</p>
                                <p>Visit us again!</p>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                            <button className="btn btn-secondary" onClick={() => setCompletedOrder(null)}>New Billing</button>
                            <button className="btn btn-primary" onClick={handlePrintInvoice}>
                                <Printer size={16} /> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
