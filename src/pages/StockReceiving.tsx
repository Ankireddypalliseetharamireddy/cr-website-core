import React, { useEffect, useState, useRef } from 'react';
import {
    Package, ArrowLeft, Barcode, CheckCircle, AlertTriangle,
    Camera, RefreshCw, Check, ShieldCheck, Box, Search, VideoOff
} from 'lucide-react';
import { transferService } from '../services/transferService';
import '../styles/website.css';

interface StockReceivingProps {
    onBack: () => void;
}

interface TransferItem {
    id: number;
    transfer_number: string;
    product: number;
    product_name: string;
    quantity: number;
    status: string;
    transfer_date: string;
}

interface ScanLogEntry {
    barcode: string;
    product_name: string;
    timestamp: string;
    status: 'success' | 'already_received' | 'error';
    message: string;
}

export default function StockReceiving({ onBack }: StockReceivingProps) {
    const [transfers, setTransfers] = useState<TransferItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferItem | null>(null);
    const [scannedCount, setScannedCount] = useState<number>(0);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; text: string } | null>(null);
    const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'received'>('pending');

    // Live Camera Scanner State
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);

    const scanInputRef = useRef<HTMLInputElement>(null);
    const storeName = localStorage.getItem('franchiseId') || 'Branch Store';

    const loadTransfers = async () => {
        setLoading(true);
        try {
            const res = await transferService.getTransfers();
            const allTransfers: TransferItem[] = res.data || [];
            setTransfers(allTransfers);

            // Auto-select first in-transit transfer if none selected
            if (!selectedTransfer) {
                const firstPending = allTransfers.find(t => t.status === 'IN_TRANSIT' || t.status === 'APPROVED');
                if (firstPending) {
                    setSelectedTransfer(firstPending);
                }
            }
        } catch (err) {
            console.error("Failed to load transfers for stock receiving", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransfers();
    }, []);

    useEffect(() => {
        if (selectedTransfer) {
            setScannedCount(0);
            setScanLogs([]);
            setScanMessage(null);
            setTimeout(() => {
                scanInputRef.current?.focus();
            }, 200);
        }
    }, [selectedTransfer?.id]);

    // Play quick audible feedback beep on barcode scan
    const playBeep = (isSuccess: boolean) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = isSuccess ? 'sine' : 'sawtooth';
                osc.frequency.setValueAtTime(isSuccess ? 880 : 220, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isSuccess ? 0.15 : 0.3));
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + (isSuccess ? 0.15 : 0.3));
            }
        } catch {
            // AudioContext not supported
        }
    };

    // Process scanned barcode
    const handleProcessBarcode = async (codeToScan: string) => {
        const code = codeToScan.trim();
        if (!code || !selectedTransfer) return;

        setSubmitting(true);
        try {
            const res = await transferService.scanReceiveItem(selectedTransfer.id, code);
            const data = res.data;

            if (data.status === 'already_received') {
                playBeep(false);
                setScanMessage({
                    type: 'warning',
                    text: `⚠️ ${data.message}`
                });
                setScanLogs(prev => [{
                    barcode: code,
                    product_name: selectedTransfer.product_name,
                    timestamp: new Date().toLocaleTimeString(),
                    status: 'already_received',
                    message: 'Already received earlier'
                }, ...prev]);
            } else {
                playBeep(true);
                const nextCount = scannedCount + 1;
                setScannedCount(nextCount);
                setScanMessage({
                    type: 'success',
                    text: `✓ Verified & Received: ${data.message}`
                });
                setScanLogs(prev => [{
                    barcode: code,
                    product_name: selectedTransfer.product_name,
                    timestamp: new Date().toLocaleTimeString(),
                    status: 'success',
                    message: 'Received & Added to Branch'
                }, ...prev]);

                if (data.transfer_status === 'RECEIVED' || nextCount >= selectedTransfer.quantity) {
                    setScanMessage({
                        type: 'success',
                        text: `🎉 Consignment completely verified! All ${selectedTransfer.quantity} pieces are now active for billing.`
                    });
                    loadTransfers();
                }
            }
        } catch (err: any) {
            playBeep(false);
            const errMsg = err.response?.data?.error || `Failed to receive barcode: ${code}`;
            setScanMessage({
                type: 'error',
                text: `✕ ${errMsg}`
            });
            setScanLogs(prev => [{
                barcode: code,
                product_name: selectedTransfer.product_name,
                timestamp: new Date().toLocaleTimeString(),
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

    // Finalize entire consignment (accept remaining units)
    const handleFinalizeAll = async () => {
        if (!selectedTransfer) return;
        if (!confirm(`Mark all ${selectedTransfer.quantity} units of "${selectedTransfer.product_name}" as received in this branch?`)) return;

        try {
            await transferService.updateTransferStatus(selectedTransfer.id, 'RECEIVED');
            alert(`Consignment ${selectedTransfer.transfer_number} marked as fully received! All units are ready for billing.`);
            loadTransfers();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to mark transfer as received.");
        }
    };

    // Camera Barcode Scanning Loop
    const startCamera = async () => {
        if (!('BarcodeDetector' in window)) {
            alert("Camera barcode detector is not supported in this browser. Please use a physical barcode gun or enter the barcode.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraActive(true);

            // Initialize detector
            const BarcodeDetectorClass = (window as any).BarcodeDetector;
            detectorRef.current = new BarcodeDetectorClass({
                formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a']
            });

            requestAnimationFrame(scanVideoFrame);
        } catch (err) {
            console.error("Camera access error", err);
            alert("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const scanVideoFrame = async () => {
        if (!videoRef.current || !detectorRef.current || !streamRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
                const barcodes = await detectorRef.current.detect(videoRef.current);
                if (barcodes.length > 0) {
                    const rawVal = barcodes[0].rawValue;
                    if (rawVal) {
                        handleProcessBarcode(rawVal);
                        setTimeout(() => {
                            if (streamRef.current) requestAnimationFrame(scanVideoFrame);
                        }, 1200);
                        return;
                    }
                }
            } catch {
                // Ignore detector frame error
            }
        }

        if (streamRef.current) {
            requestAnimationFrame(scanVideoFrame);
        }
    };

    const pendingTransfers = transfers.filter(t => t.status === 'IN_TRANSIT' || t.status === 'APPROVED');
    const completedTransfers = transfers.filter(t => t.status === 'RECEIVED');

    return (
        <div className="website-container" style={{ padding: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
            {/* Top Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onBack}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.8rem' }}
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--pos-gold-light)' }}>
                                Inbound Stock Receiving Terminal
                            </h2>
                            <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                {storeName}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>
                            Scan incoming 1D barcodes to accept shipments into branch inventory. Counter billing only permits scanned &amp; received items.
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={loadTransfers}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        <span>Refresh Consignments</span>
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
                {/* LEFT SIDEBAR: Incoming Shipments Feed */}
                <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Box size={16} style={{ color: 'var(--pos-gold-light)' }} />
                            Shipments
                        </h3>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                                className={`btn btn-sm ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('pending')}
                                style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                            >
                                In Transit ({pendingTransfers.length})
                            </button>
                            <button
                                className={`btn btn-sm ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('received')}
                                style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                            >
                                Received ({completedTransfers.length})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--pos-text-secondary)' }}>
                            <RefreshCw className="spin" size={20} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.8rem' }}>Loading transfer consignments...</p>
                        </div>
                    ) : (activeTab === 'pending' ? pendingTransfers : completedTransfers).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--pos-text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <Package size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                {activeTab === 'pending' ? 'No incoming consignments in transit.' : 'No completed consignments found.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '550px', overflowY: 'auto' }}>
                            {(activeTab === 'pending' ? pendingTransfers : completedTransfers).map(t => {
                                const isSelected = selectedTransfer?.id === t.id;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTransfer(t)}
                                        style={{
                                            padding: '0.85rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: `1px solid ${isSelected ? 'var(--pos-gold-primary)' : 'var(--pos-border-subtle)'}`,
                                            background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                                {t.transfer_number}
                                            </span>
                                            <span className={`badge ${t.status === 'RECEIVED' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                                                {t.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--pos-text-primary)', marginBottom: '0.2rem' }}>
                                            {t.product_name}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                            <span>Consignment Qty: <strong>{t.quantity} pcs</strong></span>
                                            <span>{new Date(t.transfer_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Security Notice */}
                    <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <ShieldCheck size={16} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.75rem', color: '#93c5fd', lineHeight: '1.35' }}>
                            <strong>Billing Policy:</strong> Pieces must be scanned in this terminal before counter cashiers can sell them.
                        </div>
                    </div>
                </div>

                {/* RIGHT WORKSPACE: Active Barcode Receiving Station */}
                <div>
                    {selectedTransfer ? (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            {/* Selected Shipment Summary Banner */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--pos-border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Active Inbound Consignment
                                    </div>
                                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--pos-gold-light)' }}>
                                        {selectedTransfer.product_name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--pos-text-secondary)', marginTop: '0.25rem' }}>
                                        <span>Consignment #: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedTransfer.transfer_number}</strong></span>
                                        <span>&bull;</span>
                                        <span>Expected Quantity: <strong style={{ color: '#fff' }}>{selectedTransfer.quantity} units</strong></span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge ${selectedTransfer.status === 'RECEIVED' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                                        {selectedTransfer.status === 'RECEIVED' ? '✓ Stocked in Branch' : 'In Transit (Scanning...)'}
                                    </span>
                                </div>
                            </div>

                            {/* Receiving Progress Meter */}
                            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--pos-border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--pos-text-primary)' }}>
                                        Receiving Verification Progress
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--pos-accent-green)' }}>
                                        {scannedCount} of {selectedTransfer.quantity} Scanned ({Math.min(100, Math.round((scannedCount / selectedTransfer.quantity) * 100))}%)
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${Math.min(100, Math.round((scannedCount / selectedTransfer.quantity) * 100))}%`,
                                            background: 'linear-gradient(90deg, #10b981, #059669)',
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* BARCODE SCANNER INPUT BOX */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <form onSubmit={handleFormSubmit}>
                                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Barcode size={18} style={{ color: 'var(--pos-gold-light)' }} />
                                            Scan Product 1D Barcode or Piece Serial
                                        </span>
                                        <button
                                            type="button"
                                            onClick={cameraActive ? stopCamera : startCamera}
                                            className="btn btn-secondary btn-sm"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                                        >
                                            {cameraActive ? <VideoOff size={13} /> : <Camera size={13} />}
                                            <span>{cameraActive ? 'Stop Camera' : 'Scan via Camera'}</span>
                                        </button>
                                    </label>

                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <input
                                            ref={scanInputRef}
                                            type="text"
                                            className="form-input"
                                            placeholder="Aim handheld barcode gun or type code (e.g. CR0001-SN000001 or 890123...)"
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            disabled={submitting || selectedTransfer.status === 'RECEIVED'}
                                            style={{
                                                fontSize: '1rem',
                                                padding: '0.75rem 1rem',
                                                fontFamily: 'monospace',
                                                borderColor: scanMessage?.type === 'error' ? '#ef4444' : (scanMessage?.type === 'success' ? '#10b981' : undefined)
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={submitting || !barcodeInput.trim() || selectedTransfer.status === 'RECEIVED'}
                                            style={{ padding: '0 1.5rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}
                                        >
                                            {submitting ? 'Verifying...' : 'Verify Scan'}
                                        </button>
                                    </div>
                                </form>

                                {/* Camera Viewfinder Container */}
                                {cameraActive && (
                                    <div style={{ marginTop: '1rem', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--pos-gold-primary)', background: '#000', textAlign: 'center' }}>
                                        <video ref={videoRef} style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }} muted playsInline />
                                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>
                                            Camera Scanner Active &bull; Center barcode in view
                                        </div>
                                    </div>
                                )}

                                {/* Scan Result Feedback Banner */}
                                {scanMessage && (
                                    <div
                                        style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: scanMessage.type === 'success'
                                                ? 'rgba(16, 185, 129, 0.15)'
                                                : (scanMessage.type === 'warning'
                                                    ? 'rgba(245, 158, 11, 0.15)'
                                                    : 'rgba(239, 68, 68, 0.15)'),
                                            border: `1px solid ${scanMessage.type === 'success' ? '#10b981' : (scanMessage.type === 'warning' ? '#f59e0b' : '#ef4444')}`,
                                            color: scanMessage.type === 'success' ? '#6ee7b7' : (scanMessage.type === 'warning' ? '#fde047' : '#fca5a5')
                                        }}
                                    >
                                        {scanMessage.text}
                                    </div>
                                )}
                            </div>

                            {/* Scanned Items Log in this session */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pos-text-secondary)' }}>
                                        Recent Scan History in this Consignment
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                        {scanLogs.length} attempts recorded
                                    </span>
                                </div>

                                {scanLogs.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', color: 'var(--pos-text-secondary)', fontSize: '0.8rem' }}>
                                        No items scanned yet in this session. Start scanning incoming barcodes above.
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--pos-border-subtle)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                                        <table className="glass-table" style={{ margin: 0, fontSize: '0.8rem' }}>
                                            <thead>
                                                <tr>
                                                    <th>Barcode / Serial #</th>
                                                    <th>Product</th>
                                                    <th>Time</th>
                                                    <th>Result</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {scanLogs.map((log, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{log.barcode}</td>
                                                        <td>{log.product_name}</td>
                                                        <td style={{ color: 'var(--pos-text-secondary)' }}>{log.timestamp}</td>
                                                        <td>
                                                            <span className={`badge ${log.status === 'success' ? 'badge-success' : (log.status === 'already_received' ? 'badge-warning' : 'badge-danger')}`} style={{ fontSize: '0.7rem' }}>
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

                            {/* Manual Consignment Acceptance Action */}
                            <div style={{ borderTop: '1px solid var(--pos-border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                                    Need to verify the whole crate after physical quality check?
                                </span>
                                {selectedTransfer.status !== 'RECEIVED' && (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleFinalizeAll}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem' }}
                                    >
                                        <Check size={14} />
                                        <span>Accept All Remaining ({selectedTransfer.quantity})</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--pos-text-secondary)' }}>
                            <Box size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <h4 style={{ margin: 0, color: 'var(--pos-text-primary)' }}>No Consignment Selected</h4>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                Select an in-transit consignment from the left sidebar to start scanning and receiving items.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
