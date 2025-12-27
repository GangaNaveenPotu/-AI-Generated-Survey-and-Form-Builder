import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, BarChart2, PieChart, List, Users, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

// Chart components (you'll need to install these)
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [formRes, responsesRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/v1/forms/${id}`),
                    axios.get(`http://localhost:5000/api/v1/forms/${id}/analytics`)
                ]);
                
                const form = formRes.data;
                const responses = responsesRes.data.responses || [];
                
                // Process response data
                const summary = {
                    totalResponses: responses.length,
                    completionRate: 0,
                    averageTime: 'N/A',
                    questions: form.fields.map(field => ({
                        ...field,
                        responses: responses.map(r => r.answers[field.id])
                    }))
                };
                
                // Calculate completion rate (assuming all questions are required for now)
                if (responses.length > 0) {
                    const completeResponses = responses.filter(r => {
                        return form.fields.every(field => {
                            const answer = r.answers[field.id];
                            return answer !== undefined && answer !== null && answer !== '' && 
                                  (!Array.isArray(answer) || answer.length > 0);
                        });
                    }).length;
                    summary.completionRate = Math.round((completeResponses / responses.length) * 100);
                }
                
                setAnalytics(summary);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [id]);

    const renderQuestionAnalytics = (question) => {
        if (!question.responses || question.responses.length === 0) {
            return <p className="text-gray-500 text-sm">No responses yet</p>;
        }

        const responseCounts = {};
        let totalResponses = 0;

        question.responses.forEach(response => {
            if (response !== undefined && response !== null && response !== '') {
                const key = Array.isArray(response) ? response.join(', ') : String(response);
                responseCounts[key] = (responseCounts[key] || 0) + 1;
                totalResponses++;
            }
        });

        const sortedResponses = Object.entries(responseCounts)
            .map(([value, count]) => ({
                value,
                count,
                percentage: Math.round((count / totalResponses) * 100)
            }))
            .sort((a, b) => b.count - a.count);

        // Prepare data for charts
        const chartData = {
            labels: sortedResponses.map(r => r.value),
            datasets: [
                {
                    label: 'Responses',
                    data: sortedResponses.map(r => r.count),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(244, 63, 94, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(244, 63, 94, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        };

        return (
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3">Response Distribution</h4>
                        <div className="h-64">
                            {sortedResponses.length > 0 ? (
                                <Pie data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-gray-500 text-center mt-16">No data to display</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3">Response Count</h4>
                        <div className="h-64">
                            {sortedResponses.length > 0 ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-gray-500 text-center mt-16">No data to display</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Response
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Count
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Percentage
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedResponses.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.value || '(Empty)'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.percentage}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const exportToCSV = () => {
        if (!analytics) return;
        
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add headers
        const headers = ['Question', 'Response', 'Count', 'Percentage'];
        csvContent += headers.join(',') + '\r\n';
        
        // Add data rows
        analytics.questions.forEach(question => {
            if (question.responses && question.responses.length > 0) {
                const responseCounts = {};
                let totalResponses = 0;
                
                question.responses.forEach(response => {
                    if (response !== undefined && response !== null && response !== '') {
                        const key = Array.isArray(response) ? response.join(', ') : String(response);
                        responseCounts[key] = (responseCounts[key] || 0) + 1;
                        totalResponses++;
                    }
                });
                
                Object.entries(responseCounts).forEach(([value, count]) => {
                    const percentage = Math.round((count / totalResponses) * 100);
                    const row = [
                        `"${question.label}"`,
                        `"${value}"`,
                        count,
                        `${percentage}%`
                    ];
                    csvContent += row.join(',') + '\r\n';
                });
            }
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `form-analytics-${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-500 text-sm">Form ID: {id}</p>
                    </div>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium self-start md:self-center"
                >
                    <Download size={16} /> Export to CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Responses</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {analytics?.totalResponses || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {analytics?.completionRate || 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Time</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {analytics?.averageTime || 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Question Analytics</h2>
                
                {analytics?.questions?.length > 0 ? (
                    <div className="space-y-4">
                        {analytics.questions.map((question, index) => (
                            <div key={question.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left focus:outline-none"
                                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded mr-3">
                                                Q{index + 1}
                                            </span>
                                            <h3 className="text-lg font-medium text-gray-900">{question.label}</h3>
                                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                {question.type}
                                            </span>
                                        </div>
                                        {expandedQuestion === index ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>
                                </button>
                                
                                {expandedQuestion === index && (
                                    <div className="px-6 pb-6 pt-2 border-t border-gray-200">
                                        {renderQuestionAnalytics(question)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        <BarChart2 className="h-12 w-12 text-gray-400 mx-auto" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No questions available</h3>
                        <p className="mt-1 text-gray-500">Add questions to your form to see analytics here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
