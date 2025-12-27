import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, ExternalLink, Plus, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching forms from:', API_ENDPOINTS.FORMS);
            
            // Add timeout for API call
            const res = await axios.get(API_ENDPOINTS.FORMS, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Fetch analytics for each form (with timeout and error handling)
            const formsWithCounts = await Promise.all(res.data.map(async f => {
                try {
                    const ana = await axios.get(API_ENDPOINTS.ANALYTICS(f._id), {
                        timeout: 10000 // 10 second timeout for analytics
                    });
                    return { ...f, responseCount: ana.data.totalResponses || 0 };
                } catch (err) {
                    console.warn(`Failed to fetch analytics for form ${f._id}:`, err.message);
                    return { ...f, responseCount: 0 };
                }
            }));
            
            setForms(formsWithCounts);
        } catch (err) {
            console.error('Error fetching forms:', err);
            const isNetworkError = !err.response;
            const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
            const errorMessage = err.response?.data?.error || err.message || 'Failed to load forms';
            
            if (isTimeout) {
                setError(`Request timed out after 30 seconds. This usually means:
                
• The backend server is starting up (Render free tier takes ~30 seconds to wake up)
• The backend URL might be incorrect
• Network connectivity issues

Current API URL: ${API_ENDPOINTS.BASE}

Please wait 30-60 seconds and click Retry, or check your Vercel environment variables.`);
            } else if (isNetworkError) {
                setError(`Unable to connect to backend server.

Current API URL: ${API_ENDPOINTS.BASE}

Possible issues:
• Backend is not running or URL is incorrect
• CORS configuration issue
• Network connectivity problem

Please verify VITE_API_URL in Vercel settings is set to: https://ai-generated-survey-and-form-builder.onrender.com`);
            } else if (err.response?.status === 404) {
                setError(`Backend endpoint not found.

Current API URL: ${API_ENDPOINTS.BASE}

Please verify the backend URL in Vercel environment variables.`);
            } else {
                setError(`Error loading forms: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteForm = async (id) => {
        if (!window.confirm('Are you sure you want to delete this form and all its responses?')) return;
        try {
            await axios.delete(API_ENDPOINTS.FORM(id));
            setForms(forms.filter(f => f._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete form');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm mt-4">Loading forms...</p>
                <p className="text-gray-400 text-xs">If this takes more than 30 seconds, the backend may be starting up</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
                            <p className="mt-2 text-sm text-red-700">{error}</p>
                            <div className="mt-4">
                                <button
                                    onClick={fetchForms}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your forms and view responses.</p>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                    <Plus size={20} /> Create New Form
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Create New Card (optional, or just stick to button above) */}
                {/* We stick to the standard grid for forms */}

                {forms.map(form => (
                    <div
                        key={form._id}
                        className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText size={24} />
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${form.responseCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {form.responseCount} Responses
                            </span>
                        </div>

                        <h3 className="font-bold text-xl text-gray-800 mb-2 truncate" title={form.title}>
                            {form.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 h-10 line-clamp-2">
                            {form.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                                <Link
                                    to={`/edit/${form._id}`}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Form"
                                >
                                    <Edit size={18} />
                                </Link>
                                <Link
                                    to={`/analytics/${form._id}`}
                                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="View Analytics"
                                >
                                    <BarChart3 size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteForm(form._id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Form"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <Link
                                to={`/form/${form._id}`}
                                className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            >
                                Preview <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                ))}

                {forms.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <FileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No forms created yet</h3>
                        <p className="text-gray-500 max-w-md text-center mb-8">
                            Start building your first AI-powered form to collect responses and insights.
                        </p>
                        <Link
                            to="/"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md"
                        >
                            Create Your First Form
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
