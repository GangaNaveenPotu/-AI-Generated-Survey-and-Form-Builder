import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, Plus, Clock, MoreHorizontal, Edit, Trash2, Share2, BarChart } from 'lucide-react';
import API_ENDPOINTS from '../config/api';
import ShareModal from './ShareModal';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchForms = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_ENDPOINTS.FORMS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            // Fetch analytics for each form
            const formsWithCounts = await Promise.all(
                response.data.map(async (form) => {
                    try {
                        const analytics = await axios.get(API_ENDPOINTS.ANALYTICS(form._id), {
                            headers: { 'Authorization': `Bearer ${token}` },
                            timeout: 10000
                        });
                        return { ...form, responseCount: analytics.data.totalResponses || 0 };
                    } catch (err) {
                        console.warn(`Failed to fetch analytics for form ${form._id}:`, err.message);
                        return { ...form, responseCount: 0 };
                    }
                })
            );

            setForms(formsWithCounts);
        } catch (err) {
            console.error('Error fetching forms:', err);
            if (err.response?.status === 401) {
                // Token expired or invalid
                logout();
                navigate('/signin');
                return;
            }
            setError('Failed to load forms. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [user, navigate, logout]);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleDelete = async (formId) => {
        if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_ENDPOINTS.FORMS}/${formId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setForms(forms.filter(form => form._id !== formId));
        } catch (err) {
            console.error('Error deleting form:', err);
            alert('Failed to delete form. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your dashboard</h2>
                    <Link
                        to="/signin"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Forms</h1>
                    <Link
                        to="/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Create New Form
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {forms.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No forms yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new form.</p>
                        <div className="mt-6">
                            <Link
                                to="/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" />
                                New Form
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {forms.map((form) => (
                            <div key={form._id} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{form.title}</h3>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <button
                                                onClick={() => {
                                                    setSelectedForm(form);
                                                    setShareModalOpen(true);
                                                }}
                                                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Share2 className="h-5 w-5" />
                                            </button>
                                            <div className="ml-2 relative">
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    id="options-menu"
                                                    aria-expanded="false"
                                                    aria-haspopup="true"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {form.description || 'No description'}
                                    </p>
                                    <div className="mt-4 flex items-center">
                                        <div className="flex space-x-2 flex-wrap gap-2 w-full">
                                            <Link
                                                to={`/analytics/${form._id}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <BarChart className="-ml-0.5 mr-2 h-4 w-4" />
                                                Analytics ({form.responseCount} {form.responseCount === 1 ? 'response' : 'responses'})
                                            </Link>
                                            <Link
                                                to={`/edit/${form._id}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Edit className="-ml-0.5 mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                            <Link
                                                to={`/form/${form._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <ExternalLink className="-ml-0.5 mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(form._id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="-ml-0.5 mr-2 h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                formId={selectedForm?._id}
                formTitle={selectedForm?.title}
            />
        </div>
    );
};

export default Dashboard;
