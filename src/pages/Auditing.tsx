import React, { useEffect, useState, useRef } from 'react';
import {
    ClipboardCheck, Search, CheckCircle, ArrowLeft,
    Save, AlertTriangle, Package, Check, RefreshCw,
    Scan, Sparkles
} from 'lucide-react';
import { catalogService, orderService } from '../services/api';
import '../styles/website.css';

interface AuditProduct {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    size?: string;
    selling_price: string;
    system_stock: number;
    physical_count: number;
}

interface AuditingProps {
    onBack: () => void;
}

export default function Auditing({ onBack }: AuditingProps) {
    const [auditItems, setAuditItems] = useState<AuditProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scanInput, setScanInput] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'discrepancies' | 'matches'>('all');
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [auditSuccessReceipt, setAuditSuccessReceipt] = useState<any | null>(null);

    const scanInputRef = useRef<HTMLInputElement>(null);
    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';

    const loadStoreStock = async () => {
        setLoading(true);
        try {
            const res = await catalogService.getProducts();
            const products = res.data;
            const items: AuditProduct[] = products.map((p: any) => {
                const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
                const stockQty = franchiseInv.quantity !== undefined ? franchiseInv.quantity : (p.stock !== undefined ? p.stock : 0);
                return {
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    barcode: p.barcode,
                    size: p.size,
                    selling_price: p.selling_price,
                    system_stock: stockQty,
                    physical_count: stockQty
                };
            });
            setAuditItems(items);
        } catch (err) {
            console.error("Failed to load store stock for auditing", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreStock();
    }, []);

    const handleCountChange = (productId: number, val: string) => {
        const parsed = parseInt(val, 10);
        const count = isNaN(parsed) ? 0 : Math.max(0, parsed);
        setAuditItems(prev => prev.map(item => 
            item.id === productId ? { ...item, physical_count: count } : item
        ));
    };

    const handleIncrement = (productId: number, delta: number) => {
        setAuditItems(prev => prev.map(item => 
            item.id === productId ? { ...item, physical_count: Math.max(0, item.physical_count + delta) } : item
        ));
    };

    // Quick Barcode Scan Handler
    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = scanInput.trim().toLowerCase();
        if (!code) return;

        const target = auditItems.find(it => 
            (it.barcode && it.barcode.toLowerCase() === code) ||
            it.sku.toLowerCase() === code ||
            it.name.toLowerCase().includes(code)
        );

        if (target) {
            handleIncrement(target.id, 1);
            setHighlightedId(target.id);
            setScanInput('');
            setTimeout(() => setHighlightedId(null), 2500);
        } else {
            alert(`No product found for barcode or SKU: "${scanInput}"`);
            setScanInput('');
        }
    };

    // Calculations
    const totalVariances = auditItems.filter(it => it.physical_count !== it.system_stock);
    const shortageItems = auditItems.filter(it => it.physical_count < it.system_stock);
    const surplusItems = auditItems.filter(it => it.physical_count > it.system_stock);
    const matchItems = auditItems.filter(it => it.physical_count === it.system_stock);
    const totalDiscrepancyUnits = auditItems.reduce((sum, it) => sum + (it.physical_count - it.system_stock), 0);

    const handleSubmitAudit = async () => {
        if (!window.confirm(`Submit audit report for ${auditItems.length} products (${totalVariances.length} discrepancies) to Super Admin for verification?`)) {
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                items: auditItems.map(it => ({
                    product_id: it.id,
                    physical_count: it.physical_count
                })),
                notes: `Shelf audit conducted by store staff. Identified ${shortageItems.length} shortages and ${surplusItems.length} surpluses.`
            };

            const res = await orderService.submitAudit(payload);
            setAuditSuccessReceipt(res.data);
        } catch (err: any) {
            console.error("Audit submission failed", err);
            alert(err.response?.data?.error || "Failed to submit audit report.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter Items
    const filteredItems = auditItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.barcode && item.barcode.includes(searchQuery));

        if (!matchesSearch) return false;

        if (filterMode === 'discrepancies') return item.physical_count !== item.system_stock;
        if (filterMode === 'matches') return item.physical_count === item.system_stock;
        return true;
    });

    return (
        <div className="main-content">
            
            {/* Header with Back Button and Quick Submission */}
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
                            <ClipboardCheck size={22} style={{ color: 'var(--pos-accent-green)' }} />
                            Store Inventory Audit &amp; Verification
                        </h1>
                        <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                            Verify shelf inventory for <strong style={{ color: 'var(--pos-text-primary)' }}>{storeName}</strong> and submit live discrepancy report.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={loadStoreStock}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmitAudit}
                        disabled={submitting || auditItems.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                    >
                        <Save size={16} />
                        <span>{submitting ? 'Submitting Report...' : 'Submit Audit Report'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Barcode Scanner Input */}
            <div className="glass-panel" style={{ padding: '0.85rem 1.15rem', marginBottom: '1.25rem', borderLeft: '4px solid var(--pos-gold-primary)' }}>
                <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <Scan size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                    <input
                        ref={scanInputRef}
                        type="text"
                        className="form-input"
                        placeholder="Scan barcode or enter SKU to +1 count item..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        style={{ flexGrow: 1, padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.6rem 1rem' }}>
                        + Count Item
                    </button>
                </form>
            </div>

            {/* 3 Summary Statistic Cards (2 Columns on Mobile with Reduced Size) */}
            <div className="kpi-grid">
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Catalog SKUs</span>
                        <Package size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-light)' }}>
                        {auditItems.length}
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>{matchItems.length} matching perfectly</span>
                </div>

                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Discrepant Items</span>
                        <AlertTriangle size={16} style={{ color: totalVariances.length > 0 ? '#fde047' : 'var(--pos-accent-green)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: totalVariances.length > 0 ? '#fde047' : 'var(--pos-accent-green)' }}>
                        {totalVariances.length}
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>
                        {shortageItems.length} shortages &bull; {surplusItems.length} surplus
                    </span>
                </div>

                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="kpi-label" style={{ color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Net Variance</span>
                        <Sparkles size={16} style={{ color: 'var(--pos-accent-green)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: totalDiscrepancyUnits === 0 ? 'var(--pos-accent-green)' : (totalDiscrepancyUnits < 0 ? 'var(--pos-accent-red)' : 'var(--pos-gold-light)') }}>
                        {totalDiscrepancyUnits > 0 ? `+${totalDiscrepancyUnits}` : totalDiscrepancyUnits} <span style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>units</span>
                    </div>
                    <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Physical vs ERP ledger</span>
                </div>
            </div>

            {/* Audit Verification Table */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    
                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button
                            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterMode('all')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            All Products ({auditItems.length})
                        </button>
                        <button
                            className={`btn btn-sm ${filterMode === 'discrepancies' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterMode('discrepancies')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: totalVariances.length > 0 ? '#fde047' : undefined }}
                        >
                            ⚠️ Discrepancies ({totalVariances.length})
                        </button>
                        <button
                            className={`btn btn-sm ${filterMode === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterMode('matches')}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            ✅ Matches ({matchItems.length})
                        </button>
                    </div>

                    {/* Search Filter Input */}
                    <div style={{ position: 'relative', minWidth: '240px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Filter product or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8125rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--pos-text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>Loading catalog for physical count...</p>
                ) : filteredItems.length > 0 ? (
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th style={{ textAlign: 'center' }}>Price</th>
                                    <th style={{ textAlign: 'center' }}>System Stock</th>
                                    <th style={{ textAlign: 'center' }}>Physical Count</th>
                                    <th style={{ textAlign: 'center' }}>Verification Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => {
                                    const diff = item.physical_count - item.system_stock;
                                    const isHighlighted = highlightedId === item.id;

                                    return (
                                        <tr key={item.id} style={{
                                            transition: 'background 0.3s ease',
                                            background: isHighlighted ? 'rgba(212, 175, 55, 0.25)' : undefined
                                        }}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)', fontSize: '0.9375rem' }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                                    {item.sku} {item.size ? `• Size: ${item.size}` : ''} {item.barcode ? `• Barcode: ${item.barcode}` : ''}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontSize: '0.9375rem' }}>
                                                ₹{parseFloat(item.selling_price).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--pos-text-secondary)' }}>
                                                <span style={{ fontSize: '1rem', color: 'var(--pos-text-primary)' }}>{item.system_stock}</span> units
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.physical_count}
                                                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                        className="form-input"
                                                        style={{ width: '58px', textAlign: 'center', padding: '0.35rem', fontSize: '0.9375rem', fontWeight: 'bold' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {diff === 0 ? (
                                                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                                                        <Check size={12} /> Match
                                                    </span>
                                                ) : diff < 0 ? (
                                                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                                                        <AlertTriangle size={12} /> {diff} Shortage
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                                                        <Sparkles size={12} /> +{diff} Surplus
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                        <Package size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                        <p>No products found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Audit Submission Receipt Modal */}
            {auditSuccessReceipt && (
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
                        maxWidth: '520px',
                        width: '100%',
                        border: '2px solid var(--pos-gold-primary)',
                        padding: '2rem',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.25)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid var(--pos-accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--pos-accent-green)' }}>
                                <CheckCircle size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                Audit Report Submitted
                            </h2>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                Reference #{auditSuccessReceipt.audit_number}
                            </span>
                        </div>

                        {/* Audit Details Summary Box */}
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '12px', padding: '1.15rem', border: '1px solid var(--pos-border-subtle)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Branch Store:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>{auditSuccessReceipt.franchise_name || storeName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Auditor:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>{auditSuccessReceipt.auditor_username || 'Store Staff'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Status:</span>
                                <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Pending Super Admin Review</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--pos-border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span>Verified Items:</span>
                                <span><strong>{auditSuccessReceipt.total_items_audited}</strong> products</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.875rem' }}>
                                <span style={{ color: auditSuccessReceipt.shortage_count > 0 ? '#ef4444' : 'var(--pos-accent-green)' }}>
                                    Shortages Identified:
                                </span>
                                <strong style={{ color: auditSuccessReceipt.shortage_count > 0 ? '#ef4444' : 'var(--pos-accent-green)' }}>
                                    {auditSuccessReceipt.shortage_count} SKUs
                                </strong>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', textAlign: 'center', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                            Your stock ledger has been recorded and submitted to the Super Admin. Super Admin will review discrepancies and reconcile the central ERP stock.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setAuditSuccessReceipt(null);
                                    loadStoreStock();
                                }}
                                style={{ flex: 1 }}
                            >
                                Close &amp; Return
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={onBack}
                                style={{ flex: 1 }}
                            >
                                Back to Store Hub
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
