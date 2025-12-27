import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
                        <AlertCircle className="text-red-500 h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full transform transition-all animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-50 p-4 rounded-full inline-block mb-6">
                        <CheckCircle className="text-green-500 h-16 w-16" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                    <p className="text-gray-600 mb-8 text-lg">Your response has been successfully recorded.</p>
                    <a
                        href="/"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Create your own form
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-8 border-blue-600">
                    <div className="px-8 py-10 border-b border-gray-100">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{form.title}</h1>
                        <p className="text-lg text-gray-500 leading-relaxed">{form.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
                        {form.fields.map(field => (
                            <div key={field.id || field._id} className="space-y-3">
                                <label className="block text-base font-semibold text-gray-800">
                                    {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        className="w-full border-gray-300 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700"
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.type === 'textarea' && (
                                    <textarea
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        rows={4}
                                        className="w-full border-gray-300 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 resize-none"
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.type === 'number' && (
                                    <input
                                        type="number"
                                        required={field.required}
                                        className="w-full border-gray-300 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700"
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.type === 'select' && (
                                    <div className="relative">
                                        <select
                                            required={field.required}
                                            className="w-full border-gray-300 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 appearance-none bg-white"
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                        >
                                            <option value="">Select an option</option>
                                            {field.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                )}

                                {field.type === 'radio' && (
                                    <div className="space-y-3 pt-1">
                                        {field.options?.map(opt => (
                                            <label key={opt} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                                                <input
                                                    type="radio"
                                                    name={field.id}
                                                    value={opt}
                                                    required={field.required}
                                                    checked={answers[field.id] === opt}
                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                                />
                                                <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'checkbox' && (
                                    <div className="space-y-3 pt-1">
                                        {field.options?.map(opt => {
                                            const currentValues = answers[field.id] || [];
                                            const valueArray = Array.isArray(currentValues) ? currentValues : [];
                                            const isChecked = valueArray.includes(opt);
                                            
                                            return (
                                                <label key={opt} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                                                    <input
                                                        type="checkbox"
                                                        name={field.id}
                                                        value={opt}
                                                        checked={isChecked}
                                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                        onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                                    />
                                                    <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900">{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Response'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-8 text-gray-400 text-sm">
                    Powered by AI Form Builder
                </div>
            </div>
        </div>
    );
};

export default FormRenderer;
