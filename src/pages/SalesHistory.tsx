import { useEffect, useState } from 'react';
import {
    Receipt, Search, Share2, Printer, ArrowLeft,
    RefreshCw, DollarSign, Package, Sparkles, Filter,
    Eye, ChevronDown, CheckCircle, Smartphone
} from 'lucide-react';
import { orderService } from '../services/api';
import '../styles/website.css';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
}

interface Order {
    id: number;
    invoice_number: string;
    customer_name: string;
    customer_phone: string;
    payment_method: string;
    payment_status: string;
    total_price: string;
    net_revenue: string;
    created_at: string;
    items: OrderItem[];
}

interface SalesSummary {
    total_revenue: number;
    total_invoices: number;
    items_sold: number;
    average_order_value: number;
    payment_breakdown: Array<{ payment_method: string; count: number; total: number }>;
}

interface SalesHistoryProps {
    onBack: () => void;
}

export default function SalesHistory({ onBack }: SalesHistoryProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('today');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'UPI' | 'CASH' | 'CARD'>('ALL');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';

    const loadSalesData = async () => {
        setLoading(true);
        try {
            const [ordersRes, summaryRes] = await Promise.all([
                orderService.getOrders({ timeframe }),
                orderService.getSalesSummary(timeframe)
            ]);
            setOrders(ordersRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error("Failed to load sales history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSalesData();
    }, [timeframe]);

    const handleShareWhatsApp = (order: Order) => {
        const phone = order.customer_phone.replace(/\D/g, '');
        if (!phone) {
            alert("No customer phone number available for this invoice.");
            return;
        }

        const itemsList = order.items && order.items.length > 0
            ? order.items.map(it => `• ${it.product_name} (x${it.quantity}) - ₹${parseFloat(it.unit_price).toFixed(2)}`).join('\n')
            : '• Store purchase';

        const text = `*CAVREE LUXURY RETAIL*\n` +
            `Invoice: *${order.invoice_number}*\n` +
            `Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}\n\n` +
            `*Items Purchased:*\n${itemsList}\n\n` +
            `*Total Paid: ₹${parseFloat(order.total_price).toFixed(2)}* (${order.payment_method})\n\n` +
            `Thank you for shopping with Cavree! ✨`;

        const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handlePrintInvoice = (order: Order) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        const itemsHtml = order.items && order.items.length > 0
            ? order.items.map(it => `
                <tr>
                    <td style="padding: 4px 0;">${it.product_name}</td>
                    <td style="text-align: center;">${it.quantity}</td>
                    <td style="text-align: right;">₹${parseFloat(it.unit_price).toFixed(2)}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="3">Items</td></tr>';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order.invoice_number}</title>
                    <style>
                        body { font-family: monospace; padding: 20px; font-size: 12px; color: #000; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                    </style>
                </head>
                <body>
                    <div class="center bold" style="font-size: 16px;">CAVREE LUXURY RETAIL</div>
                    <div class="center">${storeName}</div>
                    <hr />
                    <div><strong>Inv #:</strong> ${order.invoice_number}</div>
                    <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
                    <div><strong>Customer:</strong> ${order.customer_name || 'Walk-in'} (${order.customer_phone})</div>
                    <div><strong>Payment:</strong> ${order.payment_method}</div>
                    <hr />
                    <table>
                        <thead>
                            <tr style="border-bottom: 1px solid #000;">
                                <th style="text-align: left;">Item</th>
                                <th>Qty</th>
                                <th style="text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <hr />
                    <div style="display: flex; justify-content: space-between; font-size: 14px;" class="bold">
                        <span>TOTAL PAID:</span>
                        <span>₹${parseFloat(order.total_price).toFixed(2)}</span>
                    </div>
                    <hr />
                    <div class="center" style="margin-top: 15px;">Thank You for Shopping with Cavree!</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    // Filter Orders
    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_phone.includes(searchQuery) ||
            (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;
        if (paymentFilter !== 'ALL' && o.payment_method.toUpperCase() !== paymentFilter) return false;
        return true;
    });

    return (
        <div className="main-content">
            
            {/* Clean Header with Back Button on Left and Timeframe Dropdown on Right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onBack}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.45rem 0.65rem', borderRadius: '10px' }}
                        aria-label="Back"
                        title="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pos-gold-light)' }}>
                            <Receipt size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                            Sales History &amp; Invoices
                        </h1>
                        <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                            Transaction records, digital receipts, and customer billing history for <strong style={{ color: 'var(--pos-text-primary)' }}>{storeName}</strong>.
                        </p>
                    </div>
                </div>

                {/* Timeframe Dropdown Filter at Top Right Corner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={loadSalesData}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-input"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            style={{
                                padding: '0.5rem 2.2rem 0.5rem 0.95rem',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                color: 'var(--pos-gold-light)',
                                background: 'var(--pos-bg-surface)',
                                border: '1px solid var(--pos-border-gold)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                appearance: 'none',
                                WebkitAppearance: 'none'
                            }}
                        >
                            <option value="today">📅 Today</option>
                            <option value="week">📅 This Week</option>
                            <option value="month">📅 This Month</option>
                            <option value="all">📅 All Time</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '0.85rem', pointerEvents: 'none', color: 'var(--pos-gold-light)' }} />
                    </div>
                </div>
            </div>

            {/* 4 Summary Metric Cards (2 Columns on Mobile with Reduced Size) */}
            <div className="kpi-grid">
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Gross Revenue</span>
                        <DollarSign size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-light)' }}>
                        ₹{summary ? summary.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Sales in selected period</span>
                </div>

                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Invoices</span>
                        <Receipt size={16} style={{ color: 'var(--pos-accent-green)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-text-primary)' }}>
                        {summary ? summary.total_invoices : 0}
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Completed checkouts</span>
                </div>

                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Items Sold</span>
                        <Package size={16} style={{ color: 'var(--pos-gold-metallic)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-text-primary)' }}>
                        {summary ? summary.items_sold : 0} <span style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>units</span>
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Total dispatched</span>
                </div>

                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Avg Basket</span>
                        <Sparkles size={16} style={{ color: 'var(--pos-gold-champagne)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-light)' }}>
                        ₹{summary ? summary.average_order_value.toFixed(2) : '0.00'}
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Average invoice value</span>
                </div>
            </div>

            {/* Invoices Ledger Panel */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    
                    {/* Payment Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button
                            className={`btn btn-sm ${paymentFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPaymentFilter('ALL')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            All ({orders.length})
                        </button>
                        <button
                            className={`btn btn-sm ${paymentFilter === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPaymentFilter('UPI')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            ⚡ UPI
                        </button>
                        <button
                            className={`btn btn-sm ${paymentFilter === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPaymentFilter('CASH')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            💵 Cash
                        </button>
                        <button
                            className={`btn btn-sm ${paymentFilter === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPaymentFilter('CARD')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            💳 Card
                        </button>
                    </div>

                    {/* Search Input */}
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by Invoice # or Customer Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8125rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--pos-text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>Loading transaction records...</p>
                ) : filteredOrders.length > 0 ? (
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date &amp; Time</th>
                                    <th>Customer</th>
                                    <th style={{ textAlign: 'center' }}>Units</th>
                                    <th style={{ textAlign: 'center' }}>Payment Mode</th>
                                    <th style={{ textAlign: 'center' }}>Total Amount</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                {order.invoice_number}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                            {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)' }}>{order.customer_name || 'Walk-in'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{order.customer_phone || 'No phone'}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-gold">
                                                {order.items?.reduce((s, it) => s + it.quantity, 0) || 0} Units
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${order.payment_method === 'UPI' ? 'badge-purple' : (order.payment_method === 'CASH' ? 'badge-success' : 'badge-blue')}`}>
                                                {order.payment_method}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontSize: '0.9375rem' }}>
                                            ₹{parseFloat(order.total_price).toFixed(2)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleShareWhatsApp(order)}
                                                    title="Share Invoice on WhatsApp"
                                                    style={{ padding: '0.35rem 0.55rem' }}
                                                >
                                                    <Share2 size={13} style={{ color: '#25D366' }} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handlePrintInvoice(order)}
                                                    title="Print Thermal Slip"
                                                    style={{ padding: '0.35rem 0.55rem' }}
                                                >
                                                    <Printer size={13} style={{ color: 'var(--pos-gold-light)' }} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                    title="View Invoice Details"
                                                    style={{ padding: '0.35rem 0.55rem' }}
                                                >
                                                    <Eye size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                        <Receipt size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                        <p>No invoices found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Invoice Inspection Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="glass-panel" style={{
                        maxWidth: '560px',
                        width: '100%',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--pos-border-gold)',
                        padding: '1.75rem',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--pos-border-subtle)', paddingBottom: '0.75rem' }}>
                            <div>
                                <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>{selectedOrder.invoice_number}</span>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                    Invoice Details
                                </h2>
                                <span style={{ fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                                    {new Date(selectedOrder.created_at).toLocaleString()}
                                </span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(null)} style={{ padding: '0.3rem 0.55rem' }}>
                                ✕ Close
                            </button>
                        </div>

                        {/* Customer & Payment Box */}
                        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', border: '1px solid var(--pos-border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Customer:</span>
                                <strong>{selectedOrder.customer_name || 'Walk-in'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Phone:</span>
                                <strong>{selectedOrder.customer_phone || 'None'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Payment Mode:</span>
                                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{selectedOrder.payment_method}</span>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px' }}>
                            <table className="glass-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                                <thead>
                                    <tr>
                                        <th>Product Item</th>
                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((it) => (
                                            <tr key={it.id}>
                                                <td>{it.product_name}</td>
                                                <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(it.unit_price).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>No item breakdown available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Total Footer */}
                        <div style={{ borderTop: '1px solid var(--pos-border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Total Paid:</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                ₹{parseFloat(selectedOrder.total_price).toFixed(2)}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleShareWhatsApp(selectedOrder)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                            >
                                <Share2 size={15} style={{ color: '#25D366' }} /> WhatsApp
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handlePrintInvoice(selectedOrder)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                            >
                                <Printer size={15} /> Print Slip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
