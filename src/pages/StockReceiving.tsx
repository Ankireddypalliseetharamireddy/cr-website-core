import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    Package, ArrowLeft, Barcode, CheckCircle, AlertTriangle,
    Camera, RefreshCw, Check, ShieldCheck, Box, Search, VideoOff,
    Sparkles, Volume2, VolumeX, ArrowRight, ShoppingCart, Clock,
    Layers, Tag, Info, Zap, Eye, Truck
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { transferService } from '../services/transferService';
import '../styles/website.css';

interface StockReceivingProps {
    onBack: () => void;
    onNavigateToBilling?: () => void;
}

interface SerialItem {
    serial_number: string;
    status: string;
    is_received: boolean;
}

interface TransferItem {
    id: number;
    transfer_number: string;
    product: number;
    product_name: string;
    sku?: string;
    product_barcode?: string;
    product_image?: string | null;
    selling_price?: string | number;
    cost_price?: string | number;
    category_name?: string;
    brand_name?: string;
    size?: string;
    color?: string;
    quantity: number;
    status: string;
    transfer_date: string;
    from_location?: string;
    to_franchise_name?: string;
    scanned_count?: number;
    serials?: SerialItem[];
}

interface ScannedProductInfo {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    serial_number: string;
    selling_price: string;
    cost_price?: string;
    size?: string;
    color?: string;
    category?: string;
    brand?: string;
    image?: string | null;
}

interface ScanLogEntry {
    barcode: string;
    product_name: string;
    timestamp: string;
    status: 'success' | 'already_received' | 'error';
    message: string;
    serial_number?: string;
    price?: string;
}

export default function StockReceiving({ onBack, onNavigateToBilling }: StockReceivingProps) {
    const [transfers, setTransfers] = useState<TransferItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferItem | null>(null);
    const [scannedCount, setScannedCount] = useState<number>(0);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'received'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Live Scanned HUD Card State
    const [lastScannedItem, setLastScannedItem] = useState<{
        type: 'success' | 'already_received' | 'error';
        message: string;
        product?: ScannedProductInfo;
        rawCode: string;
        timestamp: string;
    } | null>(null);

    // Live Camera Scanner State via Html5Qrcode
    const [cameraActive, setCameraActive] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

    const scanInputRef = useRef<HTMLInputElement>(null);
    const storeName = localStorage.getItem('franchiseId') || 'Branch Store';
    const userRole = (localStorage.getItem('role') || '').toUpperCase();
    const isFranchiseAdmin = userRole === 'FRANCHISE_ADMIN';

    // Sound Synthesizer
    const playAudioChime = (type: 'success' | 'warning' | 'complete') => {
        if (!soundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            if (type === 'success') {
                // High pleasant two-tone chime (880Hz -> 1320Hz)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            } else if (type === 'complete') {
                // Celebration fanfare: 4 ascending harmonious tones
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.35);
                });
            } else {
                // Low error buzz (sawtooth 220Hz)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.28);
            }
        } catch {
            // Audio context not allowed or supported
        }
    };

    const loadTransfers = async (keepSelection = true) => {
        setLoading(true);
        try {
            const res = await transferService.getTransfers();
            const allTransfers: TransferItem[] = res.data || [];
            setTransfers(allTransfers);

            if (selectedTransfer && keepSelection) {
                const refreshed = allTransfers.find(t => t.id === selectedTransfer.id);
                if (refreshed) {
                    setSelectedTransfer(refreshed);
                    setScannedCount(refreshed.scanned_count || (refreshed.status === 'RECEIVED' ? refreshed.quantity : 0));
                    return;
                }
            }

            if (!selectedTransfer && allTransfers.length > 0) {
                const firstPending = allTransfers.find(t => t.status === 'IN_TRANSIT' || t.status === 'APPROVED');
                const target = firstPending || allTransfers[0];
                setSelectedTransfer(target);
                setScannedCount(target.scanned_count || (target.status === 'RECEIVED' ? target.quantity : 0));
            }
        } catch (err) {
            console.error("Failed to load transfers for stock receiving", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransfers(false);
    }, []);

    // When selecting a new transfer, sync scannedCount and focus barcode gun input
    useEffect(() => {
        if (selectedTransfer) {
            const initialCount = selectedTransfer.scanned_count !== undefined
                ? selectedTransfer.scanned_count
                : (selectedTransfer.status === 'RECEIVED' ? selectedTransfer.quantity : 0);

            setScannedCount(initialCount);
            setLastScannedItem(null);
            setTimeout(() => {
                scanInputRef.current?.focus();
            }, 200);
        }
    }, [selectedTransfer?.id]);

    // Handle Barcode & Piece Serial Processing
    const handleProcessBarcode = async (codeToScan: string) => {
        const code = codeToScan.trim();
        if (!code || !selectedTransfer) return;

        setSubmitting(true);
        try {
            const res = await transferService.scanReceiveItem(selectedTransfer.id, code);
            const data = res.data;
            const nowStr = new Date().toLocaleTimeString();

            if (data.status === 'already_received') {
                playAudioChime('warning');
                setLastScannedItem({
                    type: 'already_received',
                    message: data.message,
                    product: data.product,
                    rawCode: code,
                    timestamp: nowStr
                });
                setScanLogs(prev => [{
                    barcode: code,
                    product_name: selectedTransfer.product_name,
                    timestamp: nowStr,
                    status: 'already_received',
                    message: data.message,
                    serial_number: data.serial_number
                }, ...prev]);
            } else {
                const updatedCount = data.scanned_count !== undefined ? data.scanned_count : (scannedCount + 1);
                setScannedCount(updatedCount);

                const isComplete = data.is_complete || updatedCount >= selectedTransfer.quantity;
                if (isComplete) {
                    playAudioChime('complete');
                } else {
                    playAudioChime('success');
                }

                setLastScannedItem({
                    type: 'success',
                    message: data.message,
                    product: data.product,
                    rawCode: code,
                    timestamp: nowStr
                });

                setScanLogs(prev => [{
                    barcode: code,
                    product_name: data.product?.name || selectedTransfer.product_name,
                    timestamp: nowStr,
                    status: 'success',
                    message: data.message,
                    serial_number: data.serial_number || code,
                    price: data.product?.selling_price
                }, ...prev]);

                // Update local transfer manifest state
                setSelectedTransfer(prev => {
                    if (!prev) return null;
                    const updatedSerials = prev.serials ? prev.serials.map(s => {
                        if (s.serial_number.toLowerCase() === code.toLowerCase() ||
                            (data.serial_number && s.serial_number.toLowerCase() === data.serial_number.toLowerCase())) {
                            return { ...s, status: 'AVAILABLE', is_received: true };
                        }
                        return s;
                    }) : [];

                    return {
                        ...prev,
                        scanned_count: updatedCount,
                        status: isComplete ? 'RECEIVED' : prev.status,
                        serials: updatedSerials
                    };
                });

                if (isComplete) {
                    loadTransfers(true);
                }
            }
        } catch (err: any) {
            playAudioChime('warning');
            const nowStr = new Date().toLocaleTimeString();
            const errMsg = err.response?.data?.error || `Failed to receive barcode: ${code}`;
            setLastScannedItem({
                type: 'error',
                message: errMsg,
                rawCode: code,
                timestamp: nowStr
            });
            setScanLogs(prev => [{
                barcode: code,
                product_name: selectedTransfer.product_name,
                timestamp: nowStr,
                status: 'error',
                message: errMsg
            }, ...prev]);
        } finally {
            setSubmitting(false);
            setBarcodeInput('');
            scanInputRef.current?.focus();
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleProcessBarcode(barcodeInput);
    };

    // Bulk Accept All Remaining Units
    const handleFinalizeAll = async () => {
        if (!selectedTransfer) return;
        if (!confirm(`Mark all ${selectedTransfer.quantity} units of "${selectedTransfer.product_name}" as fully received in this branch?`)) return;

        try {
            await transferService.updateTransferStatus(selectedTransfer.id, 'RECEIVED');
            playAudioChime('complete');
            alert(`Consignment ${selectedTransfer.transfer_number} marked as fully received! All units are ready for billing.`);
            loadTransfers(true);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to mark transfer as received.");
        }
    };

    // Camera Barcode Scanner via Html5Qrcode
    const startCamera = async () => {
        setCameraActive(true);
        setTimeout(async () => {
            const containerId = "stock-receiving-camera-box";
            const container = document.getElementById(containerId);
            if (!container) return;

            try {
                if (html5QrCodeRef.current) {
                    try {
                        if (html5QrCodeRef.current.isScanning) {
                            await html5QrCodeRef.current.stop();
                        }
                    } catch {}
                    html5QrCodeRef.current.clear();
                }

                const qrScanner = new Html5Qrcode(containerId, {
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.QR_CODE,
                    ],
                    verbose: false
                });
                html5QrCodeRef.current = qrScanner;

                await qrScanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 22,
                        qrbox: { width: 340, height: 140 },
                        aspectRatio: 1.333333
                    },
                    (decodedText) => {
                        const now = Date.now();
                        if (
                            decodedText &&
                            (decodedText !== lastScanRef.current.code || now - lastScanRef.current.time > 2000)
                        ) {
                            lastScanRef.current = { code: decodedText, time: now };
                            handleProcessBarcode(decodedText);
                        }
                    },
                    () => {}
                );
            } catch (err: any) {
                console.error("Camera start failed:", err);
                setCameraActive(false);
                const msg = err?.message || String(err);
                if (msg.includes("Permission denied") || msg.includes("NotAllowedError")) {
                    alert("Camera permission was denied. Please click the lock/camera icon in your address bar and allow camera access.");
                } else if (msg.includes("NotFoundError") || msg.includes("DevicesNotFoundError")) {
                    alert("No camera device detected on your hardware.");
                } else {
                    alert(`Camera could not open: ${msg}`);
                }
            }
        }, 150);
    };

    const stopCamera = async () => {
        try {
            if (html5QrCodeRef.current) {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            }
        } catch (e) {
            console.error("Error stopping camera", e);
        } finally {
            html5QrCodeRef.current = null;
            setCameraActive(false);
        }
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                try {
                    if (html5QrCodeRef.current.isScanning) {
                        html5QrCodeRef.current.stop();
                    }
                    html5QrCodeRef.current.clear();
                } catch {}
            }
        };
    }, []);

    // Filter Transfers
    const filteredTransfers = useMemo(() => {
        return transfers.filter(t => {
            const matchesTab = activeTab === 'pending'
                ? (t.status === 'IN_TRANSIT' || t.status === 'APPROVED')
                : (t.status === 'RECEIVED');

            if (!matchesTab) return false;
            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();
            return (
                t.transfer_number.toLowerCase().includes(q) ||
                t.product_name.toLowerCase().includes(q) ||
                (t.sku && t.sku.toLowerCase().includes(q))
            );
        });
    }, [transfers, activeTab, searchQuery]);

    const pendingCount = transfers.filter(t => t.status === 'IN_TRANSIT' || t.status === 'APPROVED').length;
    const receivedCount = transfers.filter(t => t.status === 'RECEIVED').length;

    // Active Shipment Calculations
    const isCompleted = selectedTransfer
        ? (selectedTransfer.status === 'RECEIVED' || scannedCount >= selectedTransfer.quantity)
        : false;

    const remainingToScan = selectedTransfer ? Math.max(0, selectedTransfer.quantity - scannedCount) : 0;
    const progressPercent = selectedTransfer ? Math.min(100, Math.round((scannedCount / selectedTransfer.quantity) * 100)) : 0;
    const totalConsignmentValue = selectedTransfer && selectedTransfer.selling_price
        ? (parseFloat(String(selectedTransfer.selling_price)) * selectedTransfer.quantity)
        : 0;
    const receivedConsignmentValue = selectedTransfer && selectedTransfer.selling_price
        ? (parseFloat(String(selectedTransfer.selling_price)) * scannedCount)
        : 0;

    return (
        <div style={{ padding: '1.25rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* ========================================================================== */}
            {/* 1. EXECUTIVE RECEIVING COMMAND HEADER                                       */}
            {/* ========================================================================== */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.95), rgba(12, 14, 22, 0.98))',
                border: '1px solid var(--pos-border-gold)',
                borderRadius: '16px',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 0.9rem',
                            fontWeight: 600,
                            borderRadius: '10px'
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Store Hub</span>
                    </button>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--pos-gold-light)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isFranchiseAdmin ? (
                                    <>
                                        <Truck size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                                        Inbound Consignment Tracking
                                    </>
                                ) : (
                                    <>
                                        <Package size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                                        Inbound Stock Receiving Terminal
                                    </>
                                )}
                            </h1>
                            <span className="badge badge-gold" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'radarPulse 2s infinite' }} />
                                {storeName}
                            </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>
                            {isFranchiseAdmin 
                                ? "Monitor real-time transit status of consignments dispatched to your store. Physical stock check-in is performed by store staff."
                                : "Scan incoming 1D barcodes or receive consignments into branch inventory. Only received pieces are unlocked for POS counter billing."
                            }
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Audio Sound Toggle (Store Staff Only) */}
                    {!isFranchiseAdmin && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            title={soundEnabled ? "Audio chime active (Click to mute)" : "Audio muted (Click to unmute)"}
                            style={{ padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
                        >
                            {soundEnabled ? <Volume2 size={15} style={{ color: '#10b981' }} /> : <VolumeX size={15} style={{ color: '#ef4444' }} />}
                            <span>{soundEnabled ? 'Audio Chime ON' : 'Audio MUTED'}</span>
                        </button>
                    )}

                    {/* Refresh Consignments */}
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => loadTransfers(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        <span>Sync Shipments</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================== */}
            {/* 2. MAIN SPLIT INTERFACE                                                    */}
            {/* ========================================================================== */}
            <div style={{ display: 'grid', gridTemplateColumns: '370px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* -------------------------------------------------------------------------- */}
                {/* LEFT SIDEBAR: Consignments & Inbound Pipeline                             */}
                {/* -------------------------------------------------------------------------- */}
                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--pos-text-primary)' }}>
                            <Box size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                            Shipments Feed
                        </h3>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                                className={`btn btn-sm ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('pending')}
                                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                            >
                                In Transit ({pendingCount})
                            </button>
                            <button
                                className={`btn btn-sm ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('received')}
                                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                            >
                                Stocked ({receivedCount})
                            </button>
                        </div>
                    </div>

                    {/* Consignment Live Search */}
                    <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pos-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Filter by TRF #, Product or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem 0.5rem 2rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--pos-border-subtle)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.8rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Shipments List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--pos-text-secondary)' }}>
                            <RefreshCw className="spin" size={22} style={{ marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                            <p style={{ fontSize: '0.825rem' }}>Loading inbound pipeline...</p>
                        </div>
                    ) : filteredTransfers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--pos-text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                            <Package size={36} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                {searchQuery ? 'No shipments match your search filter.' : activeTab === 'pending' ? 'No incoming consignments in transit.' : 'No completed consignments found.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '620px', overflowY: 'auto', paddingRight: '2px' }}>
                            {filteredTransfers.map(t => {
                                const isSelected = selectedTransfer?.id === t.id;
                                const isDone = t.status === 'RECEIVED';
                                const curScanned = t.scanned_count || (isDone ? t.quantity : 0);
                                const pct = Math.min(100, Math.round((curScanned / t.quantity) * 100));

                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTransfer(t)}
                                        style={{
                                            padding: '0.85rem 1rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: isSelected
                                                ? '1px solid var(--pos-gold-primary)'
                                                : '1px solid var(--pos-border-subtle)',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(20, 24, 36, 0.95) 100%)'
                                                : 'rgba(255,255,255,0.02)',
                                            boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.2)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 800, color: isSelected ? '#FFF3B3' : 'var(--pos-gold-light)' }}>
                                                {t.transfer_number}
                                            </span>
                                            <span className={`badge ${isDone ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                                                {isDone ? '✓ Stored' : 'In Transit'}
                                            </span>
                                        </div>

                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--pos-text-primary)', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.product_name}
                                        </div>

                                        {/* Progress Bar in Sidebar Card */}
                                        <div style={{ marginBottom: '0.45rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--pos-text-secondary)', marginBottom: '0.2rem' }}>
                                                <span>Progress: <strong style={{ color: isDone ? '#10b981' : '#fff' }}>{curScanned} / {t.quantity} pcs</strong></span>
                                                <span style={{ fontWeight: 700, color: isDone ? '#10b981' : 'var(--pos-gold-light)' }}>{pct}%</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${pct}%`,
                                                    background: isDone ? '#10b981' : 'linear-gradient(90deg, #D4AF37, #F5E6A3)',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                            <span>SKU: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{t.sku || 'N/A'}</strong></span>
                                            <span>{new Date(t.transfer_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Consignment Status / Security Badge */}
                    <div style={{
                        marginTop: '1.25rem',
                        padding: '0.85rem',
                        background: isFranchiseAdmin ? 'rgba(212, 175, 55, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                        border: isFranchiseAdmin ? '1px solid var(--pos-border-gold)' : '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '0.6rem',
                        alignItems: 'flex-start'
                    }}>
                        {isFranchiseAdmin ? (
                            <Eye size={18} style={{ color: 'var(--pos-gold-primary)', flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                            <ShieldCheck size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <div style={{ fontSize: '0.75rem', color: isFranchiseAdmin ? 'var(--pos-gold-light)' : '#bfdbfe', lineHeight: '1.4' }}>
                            {isFranchiseAdmin ? (
                                <span><strong>Franchise Read-Only View:</strong> Consignment tracking only. Store receiving staff will inspect and accept units into shelf inventory.</span>
                            ) : (
                                <span><strong>Store Billing Rule:</strong> Pieces must be received in this terminal before counter cashiers can sell them.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* -------------------------------------------------------------------------- */}
                {/* RIGHT WORKSPACE: Receiving Command Console                                 */}
                {/* -------------------------------------------------------------------------- */}
                <div>
                    {selectedTransfer ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* ================================================================== */}
                            {/* A. CONSIGNMENT HERO CARD & VALUATION BANNER                        */}
                            {/* ================================================================== */}
                            <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem' }}>
                                    
                                    {/* Left: Product Media & Specs */}
                                    <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'center' }}>
                                        {selectedTransfer.product_image ? (
                                            <img
                                                src={selectedTransfer.product_image}
                                                alt={selectedTransfer.product_name}
                                                style={{ width: '84px', height: '84px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--pos-border-gold)' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '84px',
                                                height: '84px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(13, 15, 21, 0.9))',
                                                border: '2px solid var(--pos-border-gold)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--pos-gold-light)'
                                            }}>
                                                <Package size={28} style={{ color: 'var(--pos-gold-primary)', marginBottom: '2px' }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>CAVREE</span>
                                            </div>
                                        )}

                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                                                    {selectedTransfer.transfer_number}
                                                </span>
                                                {selectedTransfer.category_name && (
                                                    <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
                                                        {selectedTransfer.category_name}
                                                    </span>
                                                )}
                                                {selectedTransfer.brand_name && (
                                                    <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
                                                        {selectedTransfer.brand_name}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--pos-gold-light)' }}>
                                                {selectedTransfer.product_name}
                                            </h2>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>
                                                <span>SKU: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedTransfer.sku || 'N/A'}</strong></span>
                                                <span>&bull;</span>
                                                {selectedTransfer.product_barcode && (
                                                    <>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Barcode size={14} style={{ color: 'var(--pos-gold-light)' }} />
                                                            Master Barcode: <strong style={{ color: '#FFF3B3', fontFamily: 'monospace' }}>{selectedTransfer.product_barcode}</strong>
                                                        </span>
                                                        <span>&bull;</span>
                                                    </>
                                                )}
                                                {selectedTransfer.size && <span>Size: <strong style={{ color: '#fff' }}>{selectedTransfer.size}</strong> &bull;</span>}
                                                {selectedTransfer.color && <span>Color: <strong style={{ color: '#fff' }}>{selectedTransfer.color}</strong></span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Valuation Metric */}
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                                        <span className={`badge ${isCompleted ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.825rem', padding: '0.35rem 0.85rem' }}>
                                            {isCompleted ? '✓ Consignment Fully Stocked' : '● In Transit (Awaiting Scans)'}
                                        </span>
                                        {selectedTransfer.selling_price && (
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                                                ₹{parseFloat(String(selectedTransfer.selling_price)).toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', fontWeight: 400 }}>MRP / Unit</span>
                                            </div>
                                        )}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                            Consignment Value: <strong style={{ color: '#fff' }}>₹{totalConsignmentValue.toLocaleString()}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ================================================================== */}
                            {/* B. EXECUTIVE KPI PROGRESS BAR                                      */}
                            {/* ================================================================== */}
                            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--pos-border-subtle)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Units</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                                            {selectedTransfer.quantity} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--pos-text-secondary)' }}>pcs</span>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified &amp; Stocked</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                                            {scannedCount} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6ee7b7' }}>pcs</span>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#F3E5AB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining in Transit</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pos-gold-light)', marginTop: '0.2rem' }}>
                                            {remainingToScan} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#F3E5AB' }}>pcs</span>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--pos-border-subtle)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stocked Value</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                                            ₹{receivedConsignmentValue.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Glowing Multi-Step Progress Meter */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.8rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--pos-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Zap size={15} style={{ color: isCompleted ? '#10b981' : 'var(--pos-gold-primary)' }} />
                                            Verification Progress
                                        </span>
                                        <span style={{ fontWeight: 800, color: isCompleted ? '#10b981' : 'var(--pos-gold-light)' }}>
                                            {scannedCount} of {selectedTransfer.quantity} Pieces Stocked ({progressPercent}%)
                                        </span>
                                    </div>
                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', padding: '1px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progressPercent}%`,
                                            borderRadius: '5px',
                                            background: isCompleted
                                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                                : 'linear-gradient(90deg, #D4AF37 0%, #F5E6A3 60%, #10b981 100%)',
                                            boxShadow: isCompleted ? '0 0 12px rgba(16, 185, 129, 0.6)' : '0 0 10px rgba(212, 175, 55, 0.4)',
                                            transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* ================================================================== */}
                            {/* C. EXECUTIVE TRACKING PIPELINE (FRANCHISE ADMIN) OR SCANNER CONSOLE */}
                            {/* ================================================================== */}
                            {isFranchiseAdmin ? (
                                <div className="glass-panel" style={{
                                    padding: '1.5rem',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(20, 24, 36, 0.95) 100%)',
                                    border: '1px solid var(--pos-border-gold)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--pos-border-gold)', color: 'var(--pos-gold-primary)' }}>
                                            <Eye size={22} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--pos-gold-light)' }}>
                                                Executive Consignment Transit Monitor
                                            </h3>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                                                Franchise read-only tracking view &bull; Physical receiving &amp; barcode checks handled by store receiving desk
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual 3-Stage Shipment Tracker */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: '1rem',
                                        background: 'rgba(0,0,0,0.35)',
                                        padding: '1.15rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--pos-border-subtle)'
                                    }}>
                                        {/* Stage 1 */}
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                                                <Check size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Step 1: Dispatched</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Central Warehouse HQ</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>{new Date(selectedTransfer.transfer_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {/* Stage 2 */}
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                background: isCompleted ? '#10b981' : 'var(--pos-gold-primary)',
                                                color: '#000',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                flexShrink: 0
                                            }}>
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: isCompleted ? '#6ee7b7' : 'var(--pos-gold-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Step 2: Transit</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Dest: {storeName}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>{isCompleted ? 'Consignment Delivered' : 'In Transit on Road'}</div>
                                            </div>
                                        </div>

                                        {/* Stage 3 */}
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                background: isCompleted ? '#10b981' : 'rgba(255,255,255,0.08)',
                                                color: isCompleted ? '#000' : 'var(--pos-text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                flexShrink: 0
                                            }}>
                                                {isCompleted ? <CheckCircle size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: isCompleted ? '#6ee7b7' : 'var(--pos-text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Step 3: Branch Inward</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isCompleted ? '#10b981' : '#fff' }}>
                                                    {isCompleted ? '✓ Shelf Stocked' : 'Pending Store Inward'}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                                    {isCompleted ? 'Unlocked for Billing' : 'Store staff will accept upon arrival'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1.15rem', padding: '0.85rem 1rem', background: 'rgba(212, 175, 55, 0.06)', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.8rem', color: 'var(--pos-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <Info size={16} style={{ color: 'var(--pos-gold-primary)', flexShrink: 0 }} />
                                        <span>
                                            Consignment <strong>{selectedTransfer.transfer_number}</strong> represents <strong>{selectedTransfer.quantity} units</strong> of <strong>{selectedTransfer.product_name}</strong>. Physical inventory intake and shelf stocking are executed by store staff at the receiving desk.
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', border: '1px solid var(--pos-border-gold-bright)' }}>
                                    <form onSubmit={handleFormSubmit}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pos-gold-light)' }}>
                                                <Barcode size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                                Barcode &amp; Piece Serial Gun Scanner
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '6px',
                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                    color: '#6ee7b7',
                                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    marginLeft: '0.5rem'
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'radarPulse 2s infinite' }} />
                                                    SCANNER READY
                                                </span>
                                            </label>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={cameraActive ? stopCamera : startCamera}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                                                >
                                                    {cameraActive ? <VideoOff size={14} style={{ color: '#ef4444' }} /> : <Camera size={14} style={{ color: 'var(--pos-gold-light)' }} />}
                                                    <span>{cameraActive ? 'Stop Camera' : 'Scan via Camera'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Illuminated Input Row */}
                                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <input
                                                    ref={scanInputRef}
                                                    type="text"
                                                    className="form-input"
                                                    placeholder={isCompleted ? "Consignment fully stocked! No pending pieces." : "Aim handheld barcode gun or enter code (e.g. CR0001-00001 or 890123...)"}
                                                    value={barcodeInput}
                                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                                    disabled={submitting || isCompleted}
                                                    style={{
                                                        fontSize: '1.05rem',
                                                        padding: '0.85rem 1.15rem',
                                                        fontFamily: 'monospace',
                                                        letterSpacing: '0.05em',
                                                        background: 'rgba(0, 0, 0, 0.45)',
                                                        borderColor: 'var(--pos-border-gold-bright)',
                                                        borderRadius: '10px'
                                                    }}
                                                    autoFocus
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={submitting || !barcodeInput.trim() || isCompleted}
                                                style={{
                                                    padding: '0 1.8rem',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: 800,
                                                    fontSize: '0.925rem',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <RefreshCw className="spin" size={16} />
                                                        <span>Verifying...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        <span>Verify Scan</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Camera Scanner Viewfinder */}
                                    {cameraActive && (
                                        <div style={{
                                            marginTop: '1.25rem',
                                            position: 'relative',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            border: '2px solid var(--pos-gold-primary)',
                                            background: '#0a0d14',
                                            padding: '0.85rem',
                                            textAlign: 'center',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                                                <span style={{ fontSize: '0.825rem', color: 'var(--pos-gold-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <Camera size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                                                    Camera Barcode Reader Active &bull; Align Barcode Center
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={stopCamera}
                                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                                >
                                                    <VideoOff size={13} />
                                                    <span>Close Camera</span>
                                                </button>
                                            </div>

                                            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '0 auto', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div className="viewfinder-reticle">
                                                    <div className="reticle-corner reticle-tl" />
                                                    <div className="reticle-corner reticle-tr" />
                                                    <div className="reticle-corner reticle-bl" />
                                                    <div className="reticle-corner reticle-br" />
                                                </div>
                                                <div className="laser-beam" />
                                                <div id="stock-receiving-camera-box" style={{ width: '100%', minHeight: '220px' }} />
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', marginTop: '0.65rem', marginBottom: 0 }}>
                                                Supports 1D piece serials (Code 128, EAN-13, UPC) and box QR codes.
                                            </p>
                                        </div>
                                    )}

                                    {/* Live Scanned Item Verification HUD Card */}
                                    {lastScannedItem && (
                                        <div
                                            className={`scanned-hud-card ${lastScannedItem.type}`}
                                            style={{
                                                marginTop: '1.25rem',
                                                padding: '1.15rem 1.4rem',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    {lastScannedItem.product?.image ? (
                                                        <img
                                                            src={lastScannedItem.product.image}
                                                            alt={lastScannedItem.product.name}
                                                            style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--pos-border-gold)' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '64px',
                                                            height: '64px',
                                                            borderRadius: '10px',
                                                            background: lastScannedItem.type === 'success'
                                                                ? 'rgba(16, 185, 129, 0.2)'
                                                                : lastScannedItem.type === 'already_received'
                                                                    ? 'rgba(245, 158, 11, 0.2)'
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: `1px solid ${lastScannedItem.type === 'success' ? '#10b981' : lastScannedItem.type === 'already_received' ? '#f59e0b' : '#ef4444'}`
                                                        }}>
                                                            {lastScannedItem.type === 'success' && <CheckCircle size={28} style={{ color: '#10b981' }} />}
                                                            {lastScannedItem.type === 'already_received' && <AlertTriangle size={28} style={{ color: '#f59e0b' }} />}
                                                            {lastScannedItem.type === 'error' && <AlertTriangle size={28} style={{ color: '#ef4444' }} />}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                                                            <span className={`badge ${lastScannedItem.type === 'success' ? 'badge-success' : lastScannedItem.type === 'already_received' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>
                                                                {lastScannedItem.type === 'success' ? '✓ PIECE VERIFIED & STOCKED' : lastScannedItem.type === 'already_received' ? '⚠️ DUPLICATE SCAN' : '✕ SCAN REJECTED'}
                                                            </span>
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                                                {lastScannedItem.timestamp}
                                                            </span>
                                                        </div>

                                                        <h4 style={{ margin: '0.15rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                                                            {lastScannedItem.product?.name || selectedTransfer.product_name}
                                                        </h4>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--pos-text-secondary)', marginTop: '0.2rem' }}>
                                                            <span>Scanned Code: <strong style={{ color: '#FFF3B3', fontFamily: 'monospace' }}>{lastScannedItem.product?.serial_number || lastScannedItem.rawCode}</strong></span>
                                                            {lastScannedItem.product?.sku && (
                                                                <>
                                                                    <span>&bull;</span>
                                                                    <span>SKU: <strong style={{ color: '#fff' }}>{lastScannedItem.product.sku}</strong></span>
                                                                </>
                                                            )}
                                                            {lastScannedItem.product?.selling_price && (
                                                                <>
                                                                    <span>&bull;</span>
                                                                    <span>MRP: <strong style={{ color: '#10b981' }}>₹{lastScannedItem.product.selling_price}</strong></span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: lastScannedItem.type === 'success' ? '#6ee7b7' : lastScannedItem.type === 'already_received' ? '#fde047' : '#fca5a5' }}>
                                                        {lastScannedItem.message}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', marginTop: '0.25rem' }}>
                                                        Verified for Branch Store Inventory
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ================================================================== */}
                            {/* F. CONSIGNMENT SERIALS MANIFEST (PIECE-BY-PIECE CHECKLIST)         */}
                            {/* ================================================================== */}
                            <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pos-text-primary)' }}>
                                            <Layers size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                            Consignment Piece Manifest
                                        </h3>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                                            Every physical item in this consignment has an assigned 1D barcode serial.
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
                                            <CheckCircle size={14} /> {scannedCount} Stocked
                                        </span>
                                        <span>&bull;</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--pos-gold-light)', fontWeight: 600 }}>
                                            <Clock size={14} /> {remainingToScan} Pending
                                        </span>
                                    </div>
                                </div>

                                {/* Piece Cards Grid */}
                                {selectedTransfer.serials && selectedTransfer.serials.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                                        gap: '0.75rem',
                                        maxHeight: '280px',
                                        overflowY: 'auto',
                                        paddingRight: '4px'
                                    }}>
                                        {selectedTransfer.serials.map((piece, idx) => {
                                            const isRcv = piece.is_received || piece.status === 'AVAILABLE' || idx < scannedCount;
                                            return (
                                                <div
                                                    key={piece.serial_number || idx}
                                                    className={`piece-manifest-card ${isRcv ? 'received' : ''}`}
                                                    style={{
                                                        padding: '0.75rem 0.85rem',
                                                        borderRadius: '10px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                                            Piece #{idx + 1}
                                                        </span>
                                                        <span className={`badge ${isRcv ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                                                            {isRcv ? '✓ Received' : 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div style={{ fontSize: '0.825rem', fontFamily: 'monospace', fontWeight: 700, color: isRcv ? '#6ee7b7' : 'var(--pos-gold-light)', marginBottom: '0.35rem' }}>
                                                        {piece.serial_number}
                                                    </div>

                                                    {!isFranchiseAdmin && !isRcv && !isCompleted && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleProcessBarcode(piece.serial_number)}
                                                            disabled={submitting}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.25rem 0.5rem',
                                                                fontSize: '0.7rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.3rem',
                                                                marginTop: '0.25rem'
                                                            }}
                                                        >
                                                            <Barcode size={12} />
                                                            <span>Quick Scan</span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Fallback when serials are generated as numeric quantity */
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                                        gap: '0.75rem',
                                        maxHeight: '280px',
                                        overflowY: 'auto'
                                    }}>
                                        {Array.from({ length: selectedTransfer.quantity }).map((_, idx) => {
                                            const isRcv = idx < scannedCount || isCompleted;
                                            const syntheticSerial = `CR${String(selectedTransfer.product).padStart(4, '0')}-${String(idx + 1).padStart(5, '0')}`;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`piece-manifest-card ${isRcv ? 'received' : ''}`}
                                                    style={{
                                                        padding: '0.75rem 0.85rem',
                                                        borderRadius: '10px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>
                                                            Piece #{idx + 1}
                                                        </span>
                                                        <span className={`badge ${isRcv ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                                                            {isRcv ? '✓ Received' : 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div style={{ fontSize: '0.825rem', fontFamily: 'monospace', fontWeight: 700, color: isRcv ? '#6ee7b7' : 'var(--pos-gold-light)', marginBottom: '0.35rem' }}>
                                                        {syntheticSerial}
                                                    </div>

                                                    {!isFranchiseAdmin && !isRcv && !isCompleted && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleProcessBarcode(syntheticSerial)}
                                                            disabled={submitting}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.25rem 0.5rem',
                                                                fontSize: '0.7rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.3rem',
                                                                marginTop: '0.25rem'
                                                            }}
                                                        >
                                                            <Barcode size={12} />
                                                            <span>Quick Scan</span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ================================================================== */}
                            {/* G. CONSIGNMENT COMPLETED CELEBRATION BANNER                        */}
                            {/* ================================================================== */}
                            {isCompleted && (
                                <div className="celebration-banner" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem', border: '1px solid #10b981' }}>
                                        <Sparkles size={28} style={{ color: 'var(--pos-gold-primary)' }} />
                                    </div>
                                    <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#FFF3B3' }}>
                                        Consignment Fully Received &amp; Stocked!
                                    </h3>
                                    <p style={{ margin: '0 auto 1.25rem auto', maxWidth: '580px', fontSize: '0.85rem', color: 'var(--pos-text-secondary)' }}>
                                        All {selectedTransfer.quantity} units of <strong>{selectedTransfer.product_name}</strong> have been accepted into {storeName} shelf inventory. They are now unlocked and ready for checkout at the POS Billing Terminal.
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
                                        {onNavigateToBilling && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={onNavigateToBilling}
                                                style={{ padding: '0.65rem 1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <ShoppingCart size={16} />
                                                <span>Proceed to POS Billing</span>
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => loadTransfers(false)}
                                            style={{ padding: '0.65rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                                        >
                                            <Package size={16} />
                                            <span>Receive Next Shipment</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ================================================================== */}
                            {/* H. RECENT SCAN AUDIT LOG FEED (STORE STAFF ONLY)                   */}
                            {/* ================================================================== */}
                            {!isFranchiseAdmin && (
                                <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--pos-text-primary)' }}>
                                            Session Scan Log ({scanLogs.length} Scans)
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                            Real-time hardware gun events
                                        </span>
                                    </div>

                                    {scanLogs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '1.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', color: 'var(--pos-text-secondary)', fontSize: '0.825rem' }}>
                                            No items scanned yet in this session. Aim your barcode gun at any piece sticker above.
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--pos-border-subtle)', borderRadius: '10px' }}>
                                            <table className="glass-table" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>Barcode / Serial #</th>
                                                        <th>Product Name</th>
                                                        <th>Time</th>
                                                        <th>Result Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scanLogs.map((log, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--pos-gold-light)' }}>
                                                                {log.serial_number || log.barcode}
                                                            </td>
                                                            <td style={{ fontWeight: 600 }}>{log.product_name}</td>
                                                            <td style={{ color: 'var(--pos-text-secondary)' }}>{log.timestamp}</td>
                                                            <td>
                                                                <span className={`badge ${log.status === 'success' ? 'badge-success' : log.status === 'already_received' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                                    {log.message}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ================================================================== */}
                            {/* I. EMERGENCY BULK ACCEPTANCE (STORE STAFF ONLY)                    */}
                            {/* ================================================================== */}
                            {!isCompleted && !isFranchiseAdmin && (
                                <div style={{
                                    borderTop: '1px solid var(--pos-border-subtle)',
                                    paddingTop: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pos-text-secondary)', fontSize: '0.78rem' }}>
                                        <Info size={15} style={{ color: 'var(--pos-gold-primary)' }} />
                                        <span>Need to accept the entire delivery crate after physical quality inspection?</span>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleFinalizeAll}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem' }}
                                    >
                                        <Check size={14} />
                                        <span>Accept All Remaining ({remainingToScan} Units)</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px', color: 'var(--pos-text-secondary)' }}>
                            <Box size={44} style={{ opacity: 0.35, marginBottom: '0.85rem', color: 'var(--pos-gold-primary)' }} />
                            <h3 style={{ margin: 0, color: 'var(--pos-text-primary)' }}>No Consignment Selected</h3>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '420px', margin: '0.4rem auto 0 auto' }}>
                                Select an in-transit consignment from the left sidebar feed to begin scanning barcodes and receiving stock.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
