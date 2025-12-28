import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import API_ENDPOINTS from '../config/api';

const FormRenderer = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.FORM(id));
                setForm(res.data);
            } catch (err) {
                console.error(err);
                setError('Form not found or has been deleted.');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

    const handleChange = (fieldId, value) => {
        setAnswers({ ...answers, [fieldId]: value });
    };

    const handleCheckboxChange = (fieldId, value, checked) => {
        setAnswers(prev => {
            const currentValues = prev[fieldId] || [];
            const valueArray = Array.isArray(currentValues) ? currentValues : [];
            
            if (checked) {
                // Add the value if it's not already in the array
                if (!valueArray.includes(value)) {
                    return { ...prev, [fieldId]: [...valueArray, value] };
                }
            } else {
                // Remove the value from the array
                return { ...prev, [fieldId]: valueArray.filter(v => v !== value) };
            }
            return prev;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const missingFields = form.fields.filter(field => {
            if (!field.required) return false;
            const answer = answers[field.id];
            if (field.type === 'checkbox') {
                const valueArray = Array.isArray(answer) ? answer : [];
                return valueArray.length === 0;
            }
            return !answer || answer === '';
        });

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(API_ENDPOINTS.RESPONSE(id), { answers });
            if (response.status === 201) {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Submission error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Submission failed';
            const isNetworkError = !err.response;
            
            if (isNetworkError) {
                alert('Network error: Unable to connect to server. Please check your internet connection and try again.');
            } else if (err.response?.status === 404) {
                alert('Form not found. The form may have been deleted.');
            } else if (err.response?.status === 500) {
                alert('Server error: ' + errorMessage + '\n\nPlease try again later.');
            } else {
                alert('Submission failed: ' + errorMessage + '\n\nPlease try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)', border: '1px solid #E2E8F0' }}>
                    <div className="animate-spin rounded-full h-10 w-10 border-4" style={{ borderColor: 'rgba(99, 102, 241, 0.2)', borderTopColor: '#6366F1' }}></div>
                    <p style={{ fontSize: '16px', color: '#0F172A', fontWeight: 500 }}>Loading form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: '#F8FAFC' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', maxWidth: '448px', width: '100%', padding: '40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ margin: '0 auto', height: '64px', width: '64px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ height: '32px', width: '32px', color: '#EF4444' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                    </div>
                    <h2 style={{ fontFamily: 'Google Sans, Roboto, Arial, sans-serif', fontSize: '24px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
                        Form unavailable
                    </h2>
                    <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.6' }}>{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: '#F8FAFC' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ margin: '0 auto', height: '80px', width: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}>
                            <svg style={{ height: '48px', width: '48px', color: '#ffffff' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                    </div>
                    <h2 style={{ fontFamily: 'Google Sans, Roboto, Arial, sans-serif', fontSize: '28px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>
                        Your response has been recorded! 🎉
                    </h2>
                    <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '32px', lineHeight: '1.6' }}>
                        Thank you for your response. We appreciate your time.
                    </p>
                    <a
                        href="/"
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#6366F1',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.backgroundColor = '#22D3EE';
                            e.target.style.boxShadow = '0 6px 20px rgba(34, 211, 238, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.backgroundColor = '#6366F1';
                            e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                        }}
                    >
                        Create your own form
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                input::placeholder,
                textarea::placeholder {
                    color: #94A3B8;
                }
            `}</style>
            <div className="min-h-screen" style={{ fontFamily: 'Roboto, Arial, sans-serif', paddingTop: '40px', paddingBottom: '40px', backgroundColor: '#F8FAFC' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
                {/* Form Header - 30% Secondary (Light Gray) */}
                <div style={{ 
                    padding: '32px 32px 24px 32px', 
                    borderBottom: 'none', 
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0', 
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                    borderBottom: '3px solid #6366F1'
                }}>
                    <h1 style={{ fontFamily: 'Google Sans, Roboto, Arial, sans-serif', fontSize: '36px', fontWeight: 600, lineHeight: '135%', marginBottom: '12px', color: '#0F172A' }}>
                        {form.title}
                    </h1>
                    {form.description && (
                        <p style={{ fontSize: '16px', lineHeight: '24px', marginTop: '8px', color: '#64748B' }}>{form.description}</p>
                    )}
                </div>

                {/* Form Content - 30% Secondary (White) */}
                <form onSubmit={handleSubmit} style={{ 
                    borderTop: 'none', 
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0', 
                    borderTop: 'none',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                }}>
                    {form.fields.map((field, index) => (
                        <div key={field.id || field._id} style={{ padding: '28px 32px', borderBottom: '1px solid #E2E8F0' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#0F172A', display: 'block' }}>
                                    {field.label}
                                    {field.required && <span style={{ color: '#22D3EE', marginLeft: '4px', fontWeight: 600 }}>*</span>}
                                </label>
                            </div>

                            {field.type === 'text' && (
                                <div style={{ marginTop: '8px' }}>
                                    <input
                                        type="text"
                                        required={field.required}
                                        placeholder={field.placeholder || ''}
                                        className="w-full bg-transparent"
                                        style={{
                                            border: 'none',
                                            borderBottom: '1px solid #dadce0',
                                            paddingBottom: '4px',
                                            paddingTop: '8px',
                                            fontSize: '14px',
                                            color: '#202124',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'Roboto, Arial, sans-serif'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderBottom = '2px solid #1a73e8';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderBottom = '1px solid #dadce0';
                                        }}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        value={answers[field.id] || ''}
                                    />
                                </div>
                            )}

                            {field.type === 'textarea' && (
                                <div style={{ marginTop: '8px' }}>
                                    <textarea
                                        required={field.required}
                                        placeholder={field.placeholder || ''}
                                        rows={4}
                                        className="w-full resize-none"
                                        style={{
                                            border: '2px solid #E2E8F0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            fontSize: '15px',
                                            color: '#0F172A',
                                            outline: 'none',
                                            fontFamily: 'Roboto, Arial, sans-serif',
                                            transition: 'all 0.3s',
                                            backgroundColor: '#FFFFFF',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '2px solid #6366F1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '2px solid #E2E8F0';
                                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                        }}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        value={answers[field.id] || ''}
                                    />
                                </div>
                            )}

                            {field.type === 'number' && (
                                <div style={{ marginTop: '8px' }}>
                                    <input
                                        type="number"
                                        required={field.required}
                                        className="w-full bg-transparent"
                                        style={{
                                            border: 'none',
                                            borderBottom: '1px solid #dadce0',
                                            paddingBottom: '4px',
                                            paddingTop: '8px',
                                            fontSize: '14px',
                                            color: '#202124',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'Roboto, Arial, sans-serif'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderBottom = '2px solid #1a73e8';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderBottom = '1px solid #dadce0';
                                        }}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        value={answers[field.id] || ''}
                                    />
                                </div>
                            )}

                            {field.type === 'select' && (
                                <div className="relative" style={{ marginTop: '8px' }}>
                                    <select
                                        required={field.required}
                                        className="w-full"
                                        style={{
                                            border: '2px solid #E2E8F0',
                                            borderRadius: '12px',
                                            padding: '12px 40px 12px 12px',
                                            fontSize: '15px',
                                            color: '#0F172A',
                                            backgroundColor: '#FFFFFF',
                                            outline: 'none',
                                            appearance: 'none',
                                            fontFamily: 'Roboto, Arial, sans-serif',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '2px solid #6366F1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '2px solid #E2E8F0';
                                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                        }}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        value={answers[field.id] || ''}
                                    >
                                        <option value="" style={{ color: '#64748B', backgroundColor: '#FFFFFF' }}>-- Select --</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute" style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 10l5 5 5-5z"/>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {field.type === 'radio' && (
                                <div style={{ marginTop: '8px', paddingTop: '4px' }}>
                                    {field.options?.map(opt => (
                                        <label key={opt} className="flex items-center cursor-pointer" style={{ padding: '4px 0', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name={field.id}
                                                value={opt}
                                                required={field.required}
                                                checked={answers[field.id] === opt}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    margin: '0',
                                                    cursor: 'pointer',
                                                    accentColor: '#6366F1'
                                                }}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                            />
                                            <span className="ml-3" style={{ marginLeft: '12px', fontSize: '15px', color: '#0F172A', lineHeight: '24px', fontWeight: 400 }}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {field.type === 'checkbox' && (
                                <div style={{ marginTop: '8px', paddingTop: '4px' }}>
                                    {field.options?.map(opt => {
                                        const currentValues = answers[field.id] || [];
                                        const valueArray = Array.isArray(currentValues) ? currentValues : [];
                                        const isChecked = valueArray.includes(opt);
                                        
                                        return (
                                            <label key={opt} className="flex items-center cursor-pointer" style={{ padding: '4px 0', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name={field.id}
                                                    value={opt}
                                                    checked={isChecked}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        margin: '0',
                                                        cursor: 'pointer',
                                                        accentColor: '#6366F1'
                                                    }}
                                                    onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                                />
                                                <span className="ml-3" style={{ marginLeft: '12px', fontSize: '15px', color: '#0F172A', lineHeight: '24px', fontWeight: 400 }}>{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Button Section - 10% Accent (Electric Indigo) */}
                    <div style={{ padding: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                backgroundColor: submitting ? '#94A3B8' : '#6366F1',
                                color: '#ffffff',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                fontFamily: 'Roboto, Arial, sans-serif',
                                transition: 'all 0.3s',
                                boxShadow: submitting ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                if (!submitting) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.backgroundColor = '#22D3EE';
                                    e.target.style.boxShadow = '0 6px 20px rgba(34, 211, 238, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!submitting) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.backgroundColor = '#6366F1';
                                    e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                                }
                            }}
                        >
                            {submitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit ✨'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer - 30% Secondary */}
                <div style={{ 
                    borderTop: 'none', 
                    padding: '20px 32px', 
                    textAlign: 'center', 
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0', 
                    borderTop: 'none',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                }}>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                        ✨ Created with <span style={{ color: '#6366F1', fontWeight: 600 }}>AI Form Builder</span>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default FormRenderer;
