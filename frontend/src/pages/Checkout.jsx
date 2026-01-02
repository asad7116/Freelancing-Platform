import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    CheckCircle,
    AlertCircle,
    DollarSign,
    User,
    ArrowLeft,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import '../styles/checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            setSuccess(true);
            const pid = query.get('proposalId');
            if (pid) {
                // If we have a successful payment, refresh the list
                fetchPendingPayments();
            }
        }
        if (query.get('canceled')) {
            setError('Payment was canceled. You can try again when ready.');
        }

        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/proposals/client/pending-payments', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setPendingPayments(data.pendingPayments);
            } else {
                setError(data.message || 'Failed to fetch pending payments');
            }
        } catch (err) {
            console.error('Error fetching pending payments:', err);
            setError('Error loading payments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (proposalId) => {
        try {
            setProcessingId(proposalId);
            setError('');

            const response = await fetch(`http://localhost:4000/api/proposals/${proposalId}/create-checkout-session`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.url) {
                // Redirect to Stirpe Checkout
                window.location.href = data.url;
            } else {
                setError(data.message || 'Failed to initiate payment');
                setProcessingId(null);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('Payment process failed. Please try again.');
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="checkout-container">
                <div className="checkout-loading">
                    <div className="spinner"></div>
                    <p>Loading pending payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your payments for approved work</p>
            </div>

            {error && (
                <div className="checkout-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="checkout-success">
                    <CheckCircle size={20} />
                    <span>Payment successful! The freelancer will be notified to confirm receipt.</span>
                </div>
            )}

            <div className="checkout-layout">
                <div className="checkout-list-section">
                    <h2>Pending Payments ({pendingPayments.length})</h2>

                    {pendingPayments.length === 0 ? (
                        <div className="empty-payments">
                            <ShieldCheck size={48} />
                            <h3>All caught up!</h3>
                            <p>You have no pending payments at the moment.</p>
                            <button
                                onClick={() => navigate('/client/overview')}
                                className="btn-primary"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="payments-grid">
                            {pendingPayments.map((item) => (
                                <div key={item.id} className="payment-card">
                                    <div className="payment-info">
                                        <div className="project-details">
                                            <h3>{item.job_title}</h3>
                                            <div className="freelancer-name">
                                                <User size={14} />
                                                <span>{item.freelancer_name}</span>
                                            </div>
                                        </div>
                                        <div className="payment-amount">
                                            <span className="label">Amount to Pay</span>
                                            <span className="value">${item.amount}</span>
                                        </div>
                                    </div>

                                    <div className="payment-actions">
                                        <button
                                            className={`btn-pay-now ${processingId === item.id ? 'processing' : ''}`}
                                            onClick={() => handlePay(item.id)}
                                            disabled={processingId !== null}
                                        >
                                            {processingId === item.id ? (
                                                <>
                                                    <div className="mini-spinner"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    Pay Now
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="btn-view-details"
                                            onClick={() => navigate(`/client/proposals/${item.id}`)}
                                            disabled={processingId !== null}
                                        >
                                            View Details
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="checkout-sidebar">
                    <div className="payment-summary-card">
                        <h3>Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${pendingPayments.reduce((acc, curr) => acc + curr.amount, 0)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Service Fee (5%)</span>
                            <span>${(pendingPayments.reduce((acc, curr) => acc + curr.amount, 0) * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total Amount</span>
                            <span>${(pendingPayments.reduce((acc, curr) => acc + curr.amount, 0) * 1.05).toFixed(2)}</span>
                        </div>

                        <div className="secure-payment-info">
                            <ShieldCheck size={16} />
                            <span>Secure Payment processed by Stripe/PayPal</span>
                        </div>
                    </div>

                    <button
                        className="btn-back-dashboard"
                        onClick={() => navigate('/client/overview')}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
