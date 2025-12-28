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
            className="group bg-white border border-[#E2E8F0] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-visible mb-4"
        >
            {/* Handle & Actions */}
            <div className="absolute -left-12 top-0 h-full flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 bg-white border border-[#E2E8F0] shadow-sm rounded-full text-[#64748B] hover:text-[#6366F1] cursor-grab active:cursor-grabbing"
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

            <div className="p-6 border-l-4 border-transparent group-hover:border-[#6366F1] transition-colors rounded-l-xl">
                <div className="flex gap-6 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Label</label>
                        <input
                            value={field.label}
                            onChange={(e) => updateField(field.id, 'label', e.target.value)}
                            className="w-full text-lg font-medium text-[#0F172A] border-b border-[#E2E8F0] focus:border-[#6366F1] outline-none py-1 bg-transparent transition-colors placeholder-[#94A3B8]"
                            placeholder="Enter question..."
                        />
                    </div>
                    {(field.type === 'text' || field.type === 'textarea') && (
                        <div className="w-1/3">
                            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Placeholder</label>
                            <input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                                className="w-full text-sm text-[#64748B] border-b border-[#E2E8F0] focus:border-[#6366F1] outline-none py-2 bg-transparent transition-colors placeholder-[#94A3B8]"
                                placeholder="Type holder..."
                            />
                        </div>
                    )}
                </div>

                {/* Dynamic Content Preview */}
                <div className="bg-[#F1F5F9] rounded-lg p-4 border border-[#E2E8F0]">
                    {field.type === 'textarea' && <div className="h-20 bg-white border border-[#E2E8F0] rounded w-full"></div>}
                    {field.type === 'text' && <div className="h-10 bg-white border border-[#E2E8F0] rounded w-full"></div>}
                    {field.type === 'number' && <div className="h-10 bg-white border border-[#E2E8F0] rounded w-32"></div>}

                    {['radio', 'checkbox', 'select'].includes(field.type) && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-[#64748B]">Options (comma separated)</label>
                                <span className="text-[10px] text-[#64748B] italic">Separate with commas</span>
                            </div>
                            <input
                                value={field.options?.join(', ')}
                                onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full border border-[#E2E8F0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all bg-white text-[#0F172A] shadow-sm placeholder-[#94A3B8]"
                                placeholder="Option 1, Option 2, Option 3"
                            />
                            <div className="flex gap-2 flex-wrap mt-2">
                                {field.options?.filter(o => o).map((opt, i) => (
                                    <span key={i} className="text-xs bg-[#EEF2FF] text-[#6366F1] border border-[#6366F1] px-2.5 py-1 rounded-full font-medium shadow-sm">{opt}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-[#E2E8F0] pt-3">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-[#0F172A] cursor-pointer select-none">Required Field</label>
                        <button
                            onClick={() => updateField(field.id, 'required', !field.required)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${field.required ? 'bg-[#6366F1]' : 'bg-[#CBD5E1]'}`}
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
    const [aiProvider, setAiProvider] = useState('claude'); // 'claude' or 'gemini' - default is claude
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
            navigate('/');
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
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Your session has expired. Please log in again.');
                navigate('/signin', { state: { from: window.location.pathname } });
                return;
            }

            // Use Claude by default, Gemini if selected
            const endpoint = aiProvider === 'gemini' ? API_ENDPOINTS.AI_GENERATE_GEMINI : API_ENDPOINTS.AI_GENERATE;
            const res = await axios.post(endpoint, { prompt: aiPrompt }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const providerName = aiProvider === 'gemini' ? 'Gemini' : 'Claude';

            if (err.response?.status === 503) {
                if (aiProvider === 'gemini' && (errorMessage.includes('Gemini API Key') || errorMessage.includes('GEMINI_API_KEY'))) {
                    const detailsMsg = err.response?.data?.details || '';
                    alert(`⚠️ Gemini API Key Not Configured\n\n${errorMessage}\n\n${detailsMsg}\n\nTo fix this:\n1. Go to Render Dashboard\n2. Select your backend service\n3. Go to Environment tab\n4. Add GEMINI_API_KEY with your Gemini API key\n5. Redeploy\n\nOr switch back to Claude (Default) for now.`);
                } else {
                    alert(`${providerName} API Error: ${errorMessage}\n\n${details || `Please check your ${providerName} API configuration or create the form manually.`}`);
                }
            } else if (err.response?.status === 401) {
                localStorage.removeItem('token');
                alert('Your session has expired. Please log in again.');
                navigate('/signin', { state: { from: window.location.pathname } });
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
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Your session has expired. Please log in again.');
                navigate('/signin', { state: { from: '/' } });
                return;
            }

            const formData = {
                title: title.trim(),
                description: description ? description.trim() : '',
                fields: fields.map(field => ({
                    ...field,
                    label: field.label || 'Untitled Field',
                    required: field.required || false,
                    options: field.options || []
                }))
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 30000
            };

            console.log('Saving form with data:', formData);

            const url = isEditing ? API_ENDPOINTS.FORM(id) : API_ENDPOINTS.FORMS;
            const method = isEditing ? 'put' : 'post';

            const response = await axios[method](url, formData, config);

            if (response.data && response.data._id) {
                alert('Form saved successfully!');
                // Force a hard refresh of the dashboard
                navigate('/', { replace: true });
                window.location.reload(); // Temporary solution to force refresh
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Save form error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save form';

            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                alert('Your session has expired. Please log in again.');
                navigate('/signin', { state: { from: window.location.pathname } });
            } else {
                alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Top Navigation - 30% Secondary (Light) */}
            <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex justify-between items-center z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-[#64748B] hover:text-[#0F172A] transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-bold text-xl text-[#0F172A] bg-transparent outline-none focus:ring-2 focus:ring-[#6366F1] rounded px-2 -ml-2 w-64 transition cursor-pointer hover:bg-[#F1F5F9] placeholder-[#94A3B8]"
                            placeholder="Form Title"
                        />
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-sm text-[#64748B] bg-transparent outline-none focus:ring-2 focus:ring-[#6366F1] rounded px-2 -ml-2 w-96 block mt-1 hover:bg-[#F1F5F9] placeholder-[#94A3B8]"
                            placeholder="Add a description..."
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={saveForm}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#22D3EE] text-white px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 font-semibold"
                    >
                        <Save size={18} /> {loading ? 'Saving...' : (isEditing ? 'Update Form' : 'Publish Form')}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - 30% Secondary (Light) */}
                <aside className="w-80 bg-white border-r border-[#E2E8F0] flex flex-col shadow-md z-0">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <div className="bg-[#F1F5F9] p-1 rounded-xl flex text-sm font-medium">
                            <button
                                onClick={() => setActiveTab('build')}
                                className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'build' ? 'bg-white shadow-md text-[#0F172A] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                            >
                                Components
                            </button>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex-1 py-2 rounded-lg transition-all flex justify-center items-center gap-1.5 ${activeTab === 'ai' ? 'bg-[#6366F1] text-white shadow-lg font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                            >
                                <Wand2 size={14} /> AI Magic
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'build' ? (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Basic Fields</p>
                                {FIELD_TYPES.map(ft => (
                                    <button
                                        key={ft.type}
                                        onClick={() => addField(ft.type)}
                                        className="w-full text-left p-3 border border-[#E2E8F0] rounded-xl hover:border-[#6366F1] hover:bg-[#F1F5F9] hover:shadow-md flex items-center gap-3 transition-all duration-200 group bg-white"
                                    >
                                        <div className="p-2 bg-[#F1F5F9] rounded-lg text-[#64748B] group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                                            {ft.icon}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-[#0F172A] block text-sm">{ft.label}</span>
                                            <span className="text-xs text-[#64748B]">{ft.description}</span>
                                        </div>
                                        <Plus size={16} className="ml-auto opacity-0 group-hover:opacity-100 text-[#6366F1] transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-[#F1F5F9] p-4 rounded-xl border border-[#6366F1]">
                                    <h3 className="font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                                        <Wand2 size={18} className="text-[#6366F1]" /> AI Generator
                                    </h3>

                                    {/* AI Provider Toggle */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-[#64748B] mb-2 block">AI Provider</label>
                                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-[#E2E8F0]">
                                            <button
                                                onClick={() => setAiProvider('claude')}
                                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${aiProvider === 'claude'
                                                        ? 'bg-[#6366F1] text-white shadow-sm'
                                                        : 'text-[#64748B] hover:bg-[#F1F5F9]'
                                                    }`}
                                            >
                                                Claude (Default)
                                            </button>
                                            <button
                                                onClick={() => setAiProvider('gemini')}
                                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all relative ${aiProvider === 'gemini'
                                                        ? 'bg-[#22D3EE] text-white shadow-sm'
                                                        : 'text-[#64748B] hover:bg-[#F1F5F9]'
                                                    }`}
                                                title="Gemini API requires GEMINI_API_KEY to be set in Render environment variables"
                                            >
                                                Gemini
                                            </button>
                                        </div>
                                        {aiProvider === 'gemini' && (
                                            <p className="text-xs text-[#22D3EE] mt-2 bg-[#ECFEFF] p-2 rounded border border-[#22D3EE]">
                                                ⚠️ Note: Gemini API requires GEMINI_API_KEY to be configured in Render environment variables.
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-sm text-[#64748B] mb-4 leading-relaxed">
                                        Describe what you need, and {aiProvider === 'gemini' ? 'Gemini' : 'Claude'} will generate the entire form structure for you instantly.
                                    </p>

                                    <textarea
                                        className="w-full border border-[#E2E8F0] p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none min-h-[120px] shadow-inner bg-white text-[#0F172A] placeholder-[#94A3B8]"
                                        placeholder="e.g., A registration form for a coding hackathon including experience level and dietary preferences..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />

                                    <button
                                        onClick={generateWithAI}
                                        disabled={loading}
                                        className="w-full mt-3 bg-[#6366F1] hover:bg-[#22D3EE] text-white p-3 rounded-lg transition-all disabled:opacity-70 font-medium flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
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

                {/* Canvas - 60% Neutral Background */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20">
                        {fields.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-[#6366F1] shadow-lg flex flex-col items-center">
                                <div className="bg-[#EEF2FF] p-6 rounded-full block mb-6 shadow-md">
                                    <Plus className="h-12 w-12 text-[#6366F1]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Build your form</h3>
                                <p className="text-[#64748B] max-w-sm mx-auto mb-6 text-base">
                                    Drag and drop components from the sidebar or use AI to get a head start.
                                </p>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className="text-[#6366F1] font-semibold hover:text-[#22D3EE] flex items-center gap-2 text-base transition-colors"
                                >
                                    ✨ Try AI Generation →
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
