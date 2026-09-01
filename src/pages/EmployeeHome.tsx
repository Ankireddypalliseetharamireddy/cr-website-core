import { useEffect, useState } from 'react';
import {
    ShoppingCart, ClipboardCheck, DollarSign, Receipt,
    TrendingUp, Search, Share2, Send, Printer,
    ArrowRight, Package
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

export default function EmployeeHome({ onNavigate }: EmployeeHomeProps) {
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
        
        const text = `🛍️ *CAVREE INVOICE RECEIPT*%0AStore: ${storeName}%0AInvoice No: *${order.invoice_number}*%0ADate: ${new Date(order.created_at).toLocaleDateString()}%0A%0A*Items:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(order.total_price).toFixed(2)}* (${order.payment_method})%0A%0AThank you for shopping at Cavree!`;
        
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

    return (
        <div className="main-content">
            
            {/* Store Greeting Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
                        Store Staff Portal &bull; {storeName}
                    </span>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.25rem 0' }}>
                        Welcome back, {staffName}!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                        Select a quick action below to begin counter billing or start an inventory stock audit.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate('billing')}
                        style={{ padding: '0.875rem 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
                    >
                        <ShoppingCart size={20} />
                        <span>Open POS Billing</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Main Action Hub Modules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* Module 1: Billing & POS */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                    onClick={() => onNavigate('billing')}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)' }}>
                            <ShoppingCart size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Billing &amp; Checkout</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Camera QR &bull; mPOS &bull; UPI</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                        Scan product barcodes with mobile/tablet camera or laser gun, bill customers, and accept payments.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.25rem' }}>
                        <span>Start POS Checkout</span>
                        <ArrowRight size={14} />
                    </div>
                </div>

                {/* Module 2: Store Inventory Auditing */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                    onClick={() => onNavigate('auditing')}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)' }}>
                            <ClipboardCheck size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Store Auditing</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Physical Stock &bull; Variance Check</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                        Verify live shelf inventory against system counts, log discrepancies, and submit store audit reports.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.25rem' }}>
                        <span>Launch Stock Audit</span>
                        <ArrowRight size={14} />
                    </div>
                </div>

                {/* Module 3: Invoices & History */}
                <div
                    className="glass-panel"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    onClick={() => onNavigate('history')}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)' }}>
                            <Receipt size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Sales &amp; Invoices</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receipts &bull; WhatsApp Share</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                        Look up past customer transactions, re-send WhatsApp/SMS receipts, and view daily sales history.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-purple)', fontWeight: 'bold', fontSize: '0.875rem', gap: '0.25rem' }}>
                        <span>View Sales Ledger</span>
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SALES ANALYTICS & HISTORY SECTION          */}
            {/* ========================================== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} style={{ color: 'var(--accent-green)' }} />
                        Store Sales Performance
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        Real-time revenue metrics and invoices generated at {storeName}.
                    </p>
                </div>

                {/* Timeframe Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button
                        className={`btn btn-sm ${timeframe === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('today')}
                    >
                        Today
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('week')}
                    >
                        This Week
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('month')}
                    >
                        This Month
                    </button>
                    <button
                        className={`btn btn-sm ${timeframe === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('all')}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Total Revenue</span>
                        <DollarSign size={16} style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                        ₹{summary ? summary.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Gross sales in {timeframe}</span>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Invoices Generated</span>
                        <Receipt size={16} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {summary ? summary.total_invoices : 0}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Completed checkouts</span>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Items Sold</span>
                        <Package size={16} style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {summary ? summary.items_sold : 0} units
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Total quantity dispatched</span>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <span>Avg Order Value</span>
                        <TrendingUp size={16} style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ₹{summary ? summary.average_order_value.toFixed(2) : '0.00'}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Per transaction</span>
                </div>
            </div>

            {/* Invoices History Table */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 className="panel-title" style={{ margin: 0 }}>
                        Recent Invoices Ledger ({filteredOrders.length})
                    </h3>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by Invoice # or Customer Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading transaction records...</p>
                ) : filteredOrders.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
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
                                        <td style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                                            {order.invoice_number}
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.customer_name || 'Walk-in'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.customer_phone}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-blue">
                                                {order.items?.reduce((s, it) => s + it.quantity, 0) || 0} Units
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-purple">{order.payment_method}</span>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                            ₹{parseFloat(order.total_price).toFixed(2)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    title="Share WhatsApp Receipt"
                                                    onClick={() => handleShareWhatsApp(order)}
                                                    style={{ color: '#25D366', padding: '0.35rem 0.5rem' }}
                                                >
                                                    <Share2 size={13} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    title="Send SMS Receipt"
                                                    onClick={() => handleShareSMS(order)}
                                                    style={{ color: 'var(--accent-blue)', padding: '0.35rem 0.5rem' }}
                                                >
                                                    <Send size={13} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    title="Print Receipt"
                                                    onClick={() => handlePrintOrder(order)}
                                                    style={{ padding: '0.35rem 0.5rem' }}
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
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No transactions recorded for the selected timeframe.
                    </div>
                )}
            </div>

            {/* Hidden Printable Area for History Table Printing */}
            {selectedOrder && (
                <div className="print-area" style={{ fontFamily: 'monospace', color: 'black', background: 'white', padding: '1rem', borderRadius: '4px', display: 'none' }}>
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>CAVREE RETAIL STORE</h2>
                        <p style={{ fontSize: '0.6875rem' }}>{storeName}</p>
                    </div>
                    <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.35rem', marginBottom: '0.35rem', fontSize: '0.6875rem' }}>
                        <div><strong>Invoice:</strong> {selectedOrder.invoice_number}</div>
                        <div><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                        <div><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</div>
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
                                {selectedOrder.items?.map((it: any) => (
                                    <tr key={it.id}>
                                        <td>{it.product_name}</td>
                                        <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>₹{(parseFloat(it.unit_price) * it.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8125rem', fontWeight: 'bold' }}>
                        <div>Total: ₹{parseFloat(selectedOrder.total_price).toFixed(2)}</div>
                        <div style={{ fontSize: '0.625rem', fontWeight: 'normal' }}>Paid via {selectedOrder.payment_method}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
