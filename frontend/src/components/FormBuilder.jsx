import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';
import { Plus, Trash, GripVertical, Wand2, Save, ArrowLeft, Type, AlignLeft, Hash, CheckSquare, CircleDot, ChevronDown, Eye, Settings2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FIELD_TYPES = [
    { type: 'text', label: 'Short Text', icon: <Type size={18} />, description: 'Names, titles, etc.' },
    { type: 'textarea', label: 'Long Text', icon: <AlignLeft size={18} />, description: 'Comments, feedback' },
    { type: 'number', label: 'Number', icon: <Hash size={18} />, description: 'Quantities, ages' },
    { type: 'radio', label: 'Single Choice', icon: <CircleDot size={18} />, description: 'Select one option' },
    { type: 'checkbox', label: 'Multiple Choice', icon: <CheckSquare size={18} />, description: 'Select many options' },
    { type: 'select', label: 'Dropdown', icon: <ChevronDown size={18} />, description: 'Menu selection' }
];

const SortableField = ({ field, index, updateField, removeField }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-visible mb-4"
        >
            {/* Handle & Actions */}
            <div className="absolute -left-12 top-0 h-full flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 bg-white border shadow-sm rounded-full text-gray-500 hover:text-blue-600 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={16} />
                </div>
                <button
                    onClick={() => removeField(field.id)}
                    className="p-2 bg-white border shadow-sm rounded-full text-red-500 hover:bg-red-50 hover:border-red-200"
                >
                    <Trash size={16} />
                </button>
            </div>

            <div className="p-6 border-l-4 border-transparent group-hover:border-blue-500 transition-colors rounded-l-xl">
                <div className="flex gap-6 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Label</label>
                        <input
                            value={field.label}
                            onChange={(e) => updateField(field.id, 'label', e.target.value)}
                            className="w-full text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent transition-colors placeholder-gray-300"
                            placeholder="Enter question..."
                        />
                    </div>
                    {(field.type === 'text' || field.type === 'textarea') && (
                        <div className="w-1/3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Placeholder</label>
                            <input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                                className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-blue-500 outline-none py-2 bg-transparent transition-colors"
                                placeholder="Type holder..."
                            />
                        </div>
                    )}
                </div>

                {/* Dynamic Content Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    {field.type === 'textarea' && <div className="h-20 bg-white border border-gray-200 rounded w-full"></div>}
                    {field.type === 'text' && <div className="h-10 bg-white border border-gray-200 rounded w-full"></div>}
                    {field.type === 'number' && <div className="h-10 bg-white border border-gray-200 rounded w-32"></div>}

                    {['radio', 'checkbox', 'select'].includes(field.type) && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-gray-500">Options (comma separated)</label>
                                <span className="text-[10px] text-gray-400 italic">Separate with commas</span>
                            </div>
                            <input
                                value={field.options?.join(', ')}
                                onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white shadow-sm"
                                placeholder="Option 1, Option 2, Option 3"
                            />
                            <div className="flex gap-2 flex-wrap mt-2">
                                {field.options?.filter(o => o).map((opt, i) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium shadow-sm">{opt}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600 cursor-pointer select-none">Required Field</label>
                        <button
                            onClick={() => updateField(field.id, 'required', !field.required)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${field.required ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.required ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormBuilder = () => {
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiProvider, setAiProvider] = useState('claude'); // 'claude' or 'grok' - default is claude
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('build'); // 'build' or 'ai'
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.FORM(id));
            setTitle(res.data.title);
            setDescription(res.data.description);
            setFields(res.data.fields);
        } catch (err) {
            console.error(err);
            alert('Failed to load form for editing');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const addField = (type) => {
        setFields([...fields, {
            id: Date.now().toString(),
            type,
            label: `New ${type}`,
            placeholder: '',
            options: ['Option 1', 'Option 2'],
            required: false
        }]);
    };

    const updateField = (id, key, value) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const generateWithAI = async () => {
        if (!aiPrompt) return;
        setLoading(true);
        try {
            // Use Claude by default, Grok if selected
            const endpoint = aiProvider === 'grok' ? API_ENDPOINTS.AI_GENERATE_GROK : API_ENDPOINTS.AI_GENERATE;
            const res = await axios.post(endpoint, { prompt: aiPrompt }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.data.fields) {
                // Ensure all fields have IDs (fallback if AI doesn't provide them)
                const fieldsWithIds = res.data.fields.map((field, index) => ({
                    ...field,
                    id: field.id || `ai-generated-${Date.now()}-${index}`
                }));
                setFields([...fields, ...fieldsWithIds]);
                setAiPrompt('');
                setActiveTab('build'); // Switch back to see result
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to generate form';
            const details = err.response?.data?.details || '';
            const providerName = aiProvider === 'grok' ? 'Grok' : 'Claude';
            
            if (err.response?.status === 503) {
                if (aiProvider === 'grok' && (errorMessage.includes('Grok API Key') || errorMessage.includes('GROK_API_KEY'))) {
                    const detailsMsg = err.response?.data?.details || '';
                    alert(`⚠️ Grok API Key Not Configured\n\n${errorMessage}\n\n${detailsMsg}\n\nTo fix this:\n1. Go to Render Dashboard\n2. Select your backend service\n3. Go to Environment tab\n4. Add GROK_API_KEY with your Grok API key\n5. Redeploy\n\nOr switch back to Claude (Default) for now.`);
                } else {
                    alert(`${providerName} API Error: ${errorMessage}\n\n${details || `Please check your ${providerName} API configuration or create the form manually.`}`);
                }
            } else {
                alert(`${providerName} API Error: ${errorMessage}\n\n${details || 'Ensure backend is running and try again.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const saveForm = async () => {
        if (fields.length === 0) {
            alert('Please add at least one field to your form.');
            return;
        }
        
        if (!title || title.trim() === '') {
            alert('Please enter a form title.');
            return;
        }
        
        setLoading(true);
        try {
            const formData = { title, description, fields };
            
            // Log for debugging
            console.log('Saving form to:', isEditing ? API_ENDPOINTS.FORM(id) : API_ENDPOINTS.FORMS);
            console.log('Form data:', { title, description, fieldsCount: fields.length });
            
            let res;
            if (isEditing) {
                res = await axios.put(API_ENDPOINTS.FORM(id), formData, {
                    timeout: 30000, // 30 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                res = await axios.post(API_ENDPOINTS.FORMS, formData, {
                    timeout: 30000, // 30 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            if (res.data && res.data._id) {
                navigate(`/form/${res.data._id}`);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Save form error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to save form';
            const isNetworkError = !err.response;
            const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
            
            if (isTimeout) {
                alert(`Request timed out after 30 seconds.

This usually means the backend is starting up (Render free tier takes ~30 seconds).

Current API URL: ${API_ENDPOINTS.BASE}

Please wait 30-60 seconds and try again. If the issue persists, check your Vercel environment variables.`);
            } else if (isNetworkError) {
                alert(`Network error: Unable to connect to server.

Current API URL: ${API_ENDPOINTS.BASE}

Possible issues:
• Backend server is starting (wait 30 seconds)
• Backend URL is incorrect
• Check Vercel environment variable VITE_API_URL

Expected URL: https://ai-generated-survey-and-form-builder.onrender.com`);
            } else if (err.response?.status === 404) {
                alert('Form not found. Please refresh and try again.');
            } else if (err.response?.status === 500) {
                alert('Server error: ' + errorMessage + '\n\nPlease try again later or check backend logs.');
            } else {
                alert('Failed to save form: ' + errorMessage + '\n\nPlease check:\n- Backend is running\n- All required fields are filled\n- Try again in a few moments');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 flex-col">
            {/* Top Navigation */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center z-10 shadow-sm backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-bold text-xl text-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 w-64 transition cursor-pointer hover:bg-gray-50"
                            placeholder="Form Title"
                        />
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-sm text-gray-500 bg-transparent outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 w-96 block mt-1 hover:bg-gray-50"
                            placeholder="Add a description..."
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={saveForm}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all shadow-md active:transform active:scale-95 font-medium disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? 'Saving...' : (isEditing ? 'Update Form' : 'Publish Form')}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 bg-white border-r flex flex-col shadow-inner z-0">
                    <div className="p-4 border-b">
                        <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                            <button
                                onClick={() => setActiveTab('build')}
                                className={`flex-1 py-1.5 rounded-md transition-all ${activeTab === 'build' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Components
                            </button>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex-1 py-1.5 rounded-md transition-all flex justify-center items-center gap-1.5 ${activeTab === 'ai' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Wand2 size={14} /> AI Magic
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'build' ? (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Basic Fields</p>
                                {FIELD_TYPES.map(ft => (
                                    <button
                                        key={ft.type}
                                        onClick={() => addField(ft.type)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm flex items-center gap-3 transition-all duration-200 group bg-white"
                                    >
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            {ft.icon}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700 block text-sm">{ft.label}</span>
                                            <span className="text-xs text-gray-400">{ft.description}</span>
                                        </div>
                                        <Plus size={16} className="ml-auto opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                                    <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                        <Wand2 size={18} className="text-purple-600" /> AI Generator
                                    </h3>
                                    
                                    {/* AI Provider Toggle */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-purple-800 mb-2 block">AI Provider</label>
                                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-purple-200">
                                            <button
                                                onClick={() => setAiProvider('claude')}
                                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                                    aiProvider === 'claude' 
                                                        ? 'bg-purple-600 text-white shadow-sm' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Claude (Default)
                                            </button>
                                            <button
                                                onClick={() => setAiProvider('grok')}
                                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all relative ${
                                                    aiProvider === 'grok' 
                                                        ? 'bg-blue-600 text-white shadow-sm' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                                title="Grok API requires GROK_API_KEY to be set in Render environment variables"
                                            >
                                                Grok (Testing)
                                            </button>
                                        </div>
                                        {aiProvider === 'grok' && (
                                            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                                                ⚠️ Note: Grok API requires GROK_API_KEY to be configured in Render environment variables.
                                            </p>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-purple-700 mb-4 leading-relaxed">
                                        Describe what you need, and {aiProvider === 'grok' ? 'Grok' : 'Claude'} will generate the entire form structure for you instantly.
                                    </p>

                                    <textarea
                                        className="w-full border border-purple-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[120px] shadow-inner bg-white"
                                        placeholder="e.g., A registration form for a coding hackathon including experience level and dietary preferences..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />

                                    <button
                                        onClick={generateWithAI}
                                        disabled={loading}
                                        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 font-medium flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>Generate Form</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Canvas */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20">
                        {fields.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center">
                                <div className="bg-blue-50 p-6 rounded-full block mb-6">
                                    <Plus className="h-12 w-12 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Build your form</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                    Drag and drop components from the sidebar or use AI to get a head start.
                                </p>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className="text-purple-600 font-medium hover:text-purple-800 flex items-center gap-1"
                                >
                                    Try AI Generation →
                                </button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map(f => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field, index) => (
                                        <SortableField
                                            key={field.id}
                                            field={field}
                                            index={index}
                                            updateField={updateField}
                                            removeField={removeField}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FormBuilder;
