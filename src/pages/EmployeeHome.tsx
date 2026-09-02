import { useEffect, useState } from 'react';
import {
    ShoppingCart, ClipboardCheck, DollarSign, Receipt,
    TrendingUp, Search, Share2, Send, Printer,
    ArrowRight, Package, Store, Sparkles
} from 'lucide-react';
import { orderService } from '../services/api';
import '../styles/website.css';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
}

interface OrderRecord {
    id: number;
    invoice_number: string;
    customer_name: string;
    customer_phone: string;
    payment_method: string;
    total_price: string;
    created_at: string;
    items: OrderItem[];
}

interface SalesSummary {
    total_revenue: number;
    total_invoices: number;
    items_sold: number;
    average_order_value: number;
    payment_breakdown: Array<{
        payment_method: string;
        count: number;
        total: number;
    }>;
}

interface EmployeeHomeProps {
    onNavigate: (page: 'billing' | 'auditing' | 'history') => void;
    userRole?: string;
}

export default function EmployeeHome({ onNavigate, userRole }: EmployeeHomeProps) {
    const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('today');
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected order for receipt popup
    const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';
    const staffName = localStorage.getItem('username') || 'Store Staff';

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, ordersRes] = await Promise.all([
                orderService.getSalesSummary(timeframe),
                orderService.getOrders({ timeframe: timeframe === 'all' ? undefined : timeframe })
            ]);
            setSummary(summaryRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Failed to load employee dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeframe]);

    const handleShareWhatsApp = (order: OrderRecord) => {
        const phone = order.customer_phone.replace(/[^0-9]/g, '');
        const itemsSummary = order.items?.map(it => `• ${it.product_name} x ${it.quantity} = ₹${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}`).join('%0A') || '';
        
        const text = `🛍️ *CAVREE LUXURY INVOICE RECEIPT*%0AStore: ${storeName}%0AInvoice No: *${order.invoice_number}*%0ADate: ${new Date(order.created_at).toLocaleDateString()}%0A%0A*Items Purchased:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(order.total_price).toFixed(2)}* (${order.payment_method})%0A%0AThank you for shopping at Cavree!`;
        
        const targetPhone = phone && phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    const handleShareSMS = (order: OrderRecord) => {
        const phone = order.customer_phone.replace(/[^0-9]/g, '');
        const body = `Thank you for shopping at ${storeName}! Invoice #${order.invoice_number} for Rs.${parseFloat(order.total_price).toFixed(2)} is paid. Cavree Retail.`;
        window.open(`sms:${phone}?body=${encodeURIComponent(body)}`, '_blank');
    };

    const handlePrintOrder = (order: OrderRecord) => {
        setSelectedOrder(order);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const filteredOrders = orders.filter(o => 
        o.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_phone.includes(searchQuery) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatRole = (r?: string) => {
        if (!r) return 'Store Staff';
        return r.replace(/_/g, ' ');
    };

    return (
        <div className="main-content">
            
            {/* Luxury Store Greeting Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%)',
                border: '1px solid var(--pos-border-gold)',
                borderRadius: '20px',
                padding: '2rem 2.25rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.08)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                        <span className="badge badge-gold">
                            <Store size={12} style={{ marginRight: '0.3rem' }} />
                            {storeName}
                        </span>
                        <span className="badge badge-blue">
                            {formatRole(userRole)}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.25rem 0', color: 'var(--pos-text-primary)' }}>
                        Welcome, <span style={{ background: 'var(--pos-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{staffName}</span>
                    </h1>
                    <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
                        Cavree Luxury POS &amp; Retail Operations Terminal. Select a counter action below to process live customer orders or verify inventory.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate('billing')}
                        style={{ padding: '0.95rem 1.65rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                    >
                        <ShoppingCart size={20} />
                        <span>Launch POS Checkout</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Main Action Hub Modules (3 Luxury Glass Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* Module 1: Billing & POS */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-primary)' }}
                    onClick={() => onNavigate('billing')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'var(--pos-gold-gradient-subtle)', color: 'var(--pos-gold-primary)', border: '1px solid var(--pos-border-gold)' }}>
                            <ShoppingCart size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                Counter Billing &amp; POS
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Laser Gun &bull; Camera QR &bull; mPOS</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--pos-text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                        Instant barcode and QR lookup, live tax calculation, cash change calculator, and multi-channel receipt sharing.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-light)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.35rem' }}>
                        <span>Open Billing Terminal</span>
                        <ArrowRight size={15} />
                    </div>
                </div>

                {/* Module 2: Store Inventory Auditing */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-accent-green)' }}
                    onClick={() => onNavigate('auditing')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--pos-accent-green)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            <ClipboardCheck size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: '#6ee7b7' }}>
                                Store Auditing
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Physical Count &bull; Discrepancy Log</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--pos-text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                        Verify shelf stock against central ERP numbers, scan barcodes, and submit real-time variance audit logs.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-accent-green)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.35rem' }}>
                        <span>Launch Stock Audit</span>
                        <ArrowRight size={15} />
                    </div>
                </div>

                {/* Module 3: Invoices & History */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-champagne)' }}
                    onClick={() => onNavigate('history')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'rgba(222, 194, 157, 0.12)', color: 'var(--pos-gold-champagne)', border: '1px solid var(--pos-border-gold)' }}>
                            <Receipt size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-champagne)' }}>
                                Sales &amp; Invoices
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Receipts &bull; WhatsApp Share</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--pos-text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                        Access transaction logs, re-print thermal slips, and broadcast PDF invoices directly to customer phones.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-champagne)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.35rem' }}>
                        <span>View Sales History</span>
                        <ArrowRight size={15} />
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SALES ANALYTICS & KPI STATS SECTION        */}
            {/* ========================================== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pos-gold-light)' }}>
                        <TrendingUp size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                        Store Sales Performance
                    </h2>
                    <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.2rem 0 0 0' }}>
                        Live gross sales and checkout metrics generated for {storeName}.
                    </p>
                </div>

                {/* Timeframe Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--pos-border-gold)' }}>
                    <button
                        className={`btn btn-sm ${timeframe === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('today')}
                        style={{ padding: '0.35rem 0.75rem' }}
                    >
                        Today
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('week')}
                        style={{ padding: '0.35rem 0.75rem' }}
                    >
                        This Week
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('month')}
                        style={{ padding: '0.35rem 0.75rem' }}
                    >
                        This Month
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('all')}
                        style={{ padding: '0.35rem 0.75rem' }}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* 4 Luxury KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Gross Revenue</span>
                        <DollarSign size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'Cinzel, serif' }}>
                        ₹{summary ? summary.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>Gross store sales in {timeframe}</span>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Invoices Generated</span>
                        <Receipt size={18} style={{ color: 'var(--pos-accent-green)' }} />
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>
                        {summary ? summary.total_invoices : 0}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>Completed checkouts</span>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Items Sold</span>
                        <Package size={18} style={{ color: 'var(--pos-gold-metallic)' }} />
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>
                        {summary ? summary.items_sold : 0} <span style={{ fontSize: '0.9rem', color: 'var(--pos-text-secondary)' }}>units</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>Total quantity dispatched</span>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Avg Order Value</span>
                        <Sparkles size={18} style={{ color: 'var(--pos-gold-champagne)' }} />
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'Cinzel, serif' }}>
                        ₹{summary ? summary.average_order_value.toFixed(2) : '0.00'}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>Per transaction basket</span>
                </div>
            </div>

            {/* Invoices History Table */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                        Recent Invoices Ledger ({filteredOrders.length})
                    </h3>
                    <div style={{ position: 'relative', minWidth: '280px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by Invoice # or Customer Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                        />
                        <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>Loading transaction records...</p>
                ) : filteredOrders.length > 0 ? (
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date &amp; Time</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Payment Mode</th>
                                    <th>Total Amount</th>
                                    <th style={{ textAlign: 'center' }}>Share &amp; Print</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                            {order.invoice_number}
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.customer_name || 'Walk-in'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{order.customer_phone}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-gold">
                                                {order.items?.reduce((s, it) => s + it.quantity, 0) || 0} Units
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-blue">{order.payment_method}</span>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontSize: '0.9375rem' }}>
                                            ₹{parseFloat(order.total_price).toFixed(2)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleShareWhatsApp(order)}
                                                    title="Share Invoice on WhatsApp"
                                                    style={{ padding: '0.35rem 0.6rem' }}
                                                >
                                                    <Share2 size={13} style={{ color: '#25D366' }} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleShareSMS(order)}
                                                    title="Send SMS Receipt"
                                                    style={{ padding: '0.35rem 0.6rem' }}
                                                >
                                                    <Send size={13} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handlePrintOrder(order)}
                                                    title="Print Thermal Receipt"
                                                    style={{ padding: '0.35rem 0.6rem' }}
                                                >
                                                    <Printer size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                        <Receipt size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                        <p>No transaction records found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Hidden Thermal Print Receipt Area */}
            {selectedOrder && (
                <div className="print-area" style={{ display: 'none', fontFamily: 'monospace', color: 'black', background: 'white', padding: '1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                        <h2>CAVREE LUXURY RETAIL</h2>
                        <p>{storeName}</p>
                        <p>Customer: {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
                    </div>
                    <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.5rem' }}>
                        <div>Invoice: {selectedOrder.invoice_number}</div>
                        <div>Date: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    </div>
                    <table style={{ width: '100%', margin: '0.5rem 0' }}>
                        <tbody>
                            {selectedOrder.items.map(it => (
                                <tr key={it.id}>
                                    <td>{it.product_name}</td>
                                    <td>x{it.quantity}</td>
                                    <td>₹{(parseFloat(it.unit_price) * it.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ borderTop: '1px dashed black', paddingTop: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                        <div>Total: ₹{parseFloat(selectedOrder.total_price).toFixed(2)} ({selectedOrder.payment_method})</div>
                    </div>
                </div>
            )}
        </div>
    );
}
