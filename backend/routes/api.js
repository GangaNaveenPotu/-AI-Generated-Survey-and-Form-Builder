const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const Anthropic = require('@anthropic-ai/sdk');
const { auth } = require('./auth');

// Initialize Anthropic Client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || 'dummy-key', // Fallback for dev without key
});

// --- FORM ROUTES ---

// Create a new form (protected)
router.post('/forms', auth, async (req, res) => {
    try {
        const { title, description, fields } = req.body;
        
        const newForm = new Form({ 
            title, 
            description, 
            fields,
            user: req.user._id // Associate form with the logged-in user
        });
        
        await newForm.save();
        res.status(201).json(newForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all forms for the authenticated user (protected)
router.get('/forms', auth, async (req, res) => {
    try {
        // Only return forms created by the authenticated user
        const forms = await Form.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a form by ID (public - for viewing/submitting forms)
router.get('/forms/:id', async (req, res) => {
    try {
        const form = await Form.findOne({ _id: req.params.id });
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a form (only if owned by the user) (protected)
router.put('/forms/:id', auth, async (req, res) => {
    try {
        const { title, description, fields } = req.body;
        
        const updatedForm = await Form.findOneAndUpdate(
            { 
                _id: req.params.id,
                user: req.user._id // Only allow update if user owns the form
            },
            { $set: { title, description, fields } },
            { new: true }
        );
        
        if (!updatedForm) {
            return res.status(404).json({ error: 'Form not found or access denied' });
        }
        
        res.json(updatedForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a form (only if owned by the user) (protected)
router.delete('/forms/:id', auth, async (req, res) => {
    try {
        const deletedForm = await Form.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id // Only allow delete if user owns the form
        });
        
        if (!deletedForm) {
            return res.status(404).json({ error: 'Form not found or access denied' });
        }
        
        // Also delete all responses associated with this form
        await Response.deleteMany({ formId: req.params.id });
        
        res.json({ message: 'Form deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RESPONSE ROUTES ---

// Submit a response
router.post('/forms/:id/response', async (req, res) => {
    try {
        const { answers } = req.body;
        const response = new Response({
            formId: req.params.id,
            answers
        });
        await response.save();
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get analytics (basic count for now) (protected)
router.get('/forms/:id/analytics', auth, async (req, res) => {
    try {
        const responses = await Response.find({ formId: req.params.id });
        res.json({
            totalResponses: responses.length,
            responses // Return all responses for detailed view if needed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AI ROUTES ---

// Generate form fields using Claude API only (no fallback) (protected)
router.post('/ai/generate', auth, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        if (!process.env.CLAUDE_API_KEY) {
            return res.status(503).json({ 
                error: 'Claude API Key missing', 
                message: 'Claude API key is not configured. Please set CLAUDE_API_KEY in your Render environment variables or .env file.'
            });
        }

        try {
            const msg = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                messages: [{
                    role: "user", content: `Generate a list of form fields for a form about: "${prompt}". 
                Return ONLY a JSON array of objects. Each object should have:
                - id: string (unique)
                - type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select"
                - label: string
                - placeholder: string (optional)
                - options: array of strings (only for radio/checkbox/select)
                - required: boolean
                Do not include any markdown formatting or explanation.` }]
            });

            // Parse the JSON from the content
            const textResponse = msg.content[0].text;
            // Attempt to clean if specific markdown is present
            const jsonBlock = textResponse.replace(/```json\n?|\n?```/g, '');
            const fields = JSON.parse(jsonBlock);

            return res.json({ fields, provider: 'claude' });
        } catch (err) {
            console.error("Claude API Error:", err);
            
            const errorMessage = err.error?.error?.message || err.message || err.toString() || '';
            const statusCode = err.status || err.statusCode || 500;
            
            // Handle Claude API errors
            if (statusCode === 401) {
                return res.status(503).json({ 
                    error: 'Claude API authentication failed', 
                    message: 'Invalid or missing Claude API key. Please check your CLAUDE_API_KEY in the .env file.'
                });
            }
            
            if (statusCode === 400) {
                return res.status(503).json({ 
                    error: 'Claude API request failed', 
                    message: errorMessage || 'Invalid request to Claude API. Please check your API key and credits.',
                    details: 'If you have low credits, you can try using Gemini API instead by selecting it in the form builder.'
                });
            }
            
            res.status(500).json({ 
                error: 'Failed to generate form with Claude', 
                details: errorMessage,
                message: 'An error occurred while generating the form with Claude API. Please try again or use Gemini API instead.'
            });
        }
    } catch (outerErr) {
        // Catch any unhandled errors
        console.error("Unhandled error in /ai/generate:", outerErr);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: outerErr.message,
            message: 'An unexpected error occurred. Please try again or create the form manually.'
        });
    }
});

// Helper function to call Gemini API (standalone, no fallback)
async function tryGeminiAPI(prompt, res) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API Key not found in environment variables");
        return res.status(503).json({ 
            error: 'Gemini API Key missing',
            message: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your Render environment variables or .env file.',
            details: 'Go to Render Dashboard → Your Backend Service → Environment → Add GEMINI_API_KEY variable'
        });
    }

    try {
        // Try different Gemini model names in order (using available models from API key)
        // Based on available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-flash-latest, gemini-pro-latest
        const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying Gemini model: ${model}`);
                const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Generate a list of form fields for a form about: "${prompt}". 
                            Return ONLY a JSON array of objects. Each object should have:
                            - id: string (unique)
                            - type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select"
                            - label: string
                            - placeholder: string (optional)
                            - options: array of strings (only for radio/checkbox/select)
                            - required: boolean
                            Do not include any markdown formatting or explanation.`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024
                        }
                    })
                });

                if (!geminiResponse.ok) {
                    const errorData = await geminiResponse.json().catch(() => ({}));
                    console.error(`Gemini API Error with model ${model}:`, JSON.stringify(errorData, null, 2));
                    lastError = errorData.error?.message || errorData.message || `Gemini API error: ${geminiResponse.status}`;
                    
                    // Check if it's an invalid API key error - don't try other models
                    const errorMessage = (errorData.error?.message || errorData.message || '').toLowerCase();
                    if (errorMessage.includes('api key') || errorMessage.includes('invalid') || errorMessage.includes('permission denied')) {
                        throw new Error(`Invalid Gemini API key: ${errorData.error?.message || errorData.message || 'Invalid API key'}`);
                    }
                    
                    // If it's a model not found error, try next model
                    if (geminiResponse.status === 400 && (errorData.error?.message?.includes('model') || errorData.error?.message?.includes('not found'))) {
                        console.log(`Model ${model} not available, trying next...`);
                        continue;
                    }
                    throw new Error(lastError);
                }

                const data = await geminiResponse.json();
                const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                if (!textResponse) {
                    console.error("Gemini API returned empty response:", JSON.stringify(data, null, 2));
                    throw new Error('Gemini API returned empty response');
                }
                
                // Parse the JSON from the content
                const jsonBlock = textResponse.replace(/```json\n?|\n?```/g, '').trim();
                let fields;
                try {
                    fields = JSON.parse(jsonBlock);
                } catch (parseErr) {
                    console.error("Failed to parse Gemini response as JSON:", parseErr);
                    console.error("Raw response:", textResponse);
                    throw new Error(`Failed to parse Gemini API response: ${parseErr.message}. Raw response: ${textResponse.substring(0, 200)}`);
                }

                return res.json({ 
                    fields, 
                    provider: 'gemini'
                });
            } catch (modelErr) {
                lastError = modelErr.message;
                // If this is the last model, throw the error
                if (model === models[models.length - 1]) {
                    throw modelErr;
                }
                // Otherwise, continue to next model
                console.log(`Model ${model} failed, trying next...`);
            }
        }
        
        // If all models failed
        throw new Error(lastError || 'All Gemini models failed');
    } catch (err) {
        console.error("Gemini API Error:", err);
        
        const errorMessage = err.message?.toLowerCase() || '';
        
        // Check for invalid API key errors
        if (errorMessage.includes('invalid api key') || errorMessage.includes('invalid gemini api key') || errorMessage.includes('permission denied')) {
            return res.status(503).json({ 
                error: 'Invalid Gemini API Key', 
                message: 'The Gemini API key is incorrect or expired. Please get a new API key from https://aistudio.google.com/app/apikey',
                details: '1. Visit https://aistudio.google.com/app/apikey\n2. Sign in to your Google account\n3. Create a new API key\n4. Update GEMINI_API_KEY in your .env file or Render environment variables'
            });
        }
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            return res.status(503).json({ 
                error: 'Gemini API authentication failed', 
                message: 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY in the .env file.'
            });
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate form with Gemini', 
            details: err.message,
            message: 'An error occurred while generating the form with Gemini API. Please try again.'
        });
    }
}

// AI-Generated Form Suggestion (Claude API only - no fallback) (protected)
router.post('/ai/generate-form', auth, async (req, res) => {
    try {
        const { topic, description, numQuestions = 5 } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        if (!process.env.CLAUDE_API_KEY) {
            return res.status(503).json({ 
                error: 'Claude API Key missing', 
                message: 'Claude API key is not configured. Please set CLAUDE_API_KEY in your Render environment variables or .env file.'
            });
        }

        const prompt = `You are an expert form designer. Create a form with ${numQuestions} questions about "${topic}"${description ? ` with the following details: ${description}` : ''}.
        
        For each field, provide:
        1. A unique ID (use camelCase)
        2. Field type (text, textarea, number, radio, checkbox, select)
        3. A clear and concise label
        4. Placeholder text (if applicable)
        5. Options (for radio, checkbox, select)
        6. Whether the field is required
        
        Format the response as a JSON array of objects with these properties:
        [
            {
                "id": "fieldName",
                "type": "fieldType",
                "label": "Field Label",
                "placeholder": "Example placeholder",
                "options": ["Option 1", "Option 2"],
                "required": true
            }
        ]
        
        Only return the JSON array, no other text.`;

        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            // Extract and parse the JSON response
            const content = response.content[0].text;
            let fields = [];
            
            try {
                // Try to extract JSON from code blocks if present
                const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
                fields = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
            } catch (error) {
                console.error('Error parsing AI response:', error);
                return res.status(500).json({ 
                    error: 'Failed to parse AI response',
                    details: error.message,
                    rawResponse: content
                });
            }

            return res.json({ success: true, fields, provider: 'claude' });
        } catch (error) {
            console.error('Claude API generation error:', error);
            
            const errorMessage = error.error?.error?.message || error.message || error.toString() || '';
            const statusCode = error.status || error.statusCode || 500;
            
            // Handle Claude API errors
            if (statusCode === 401) {
                return res.status(503).json({ 
                    error: 'Claude API authentication failed', 
                    message: 'Invalid or missing Claude API key. Please check your CLAUDE_API_KEY in the .env file.'
                });
            }
            
            if (statusCode === 400) {
                return res.status(503).json({ 
                    error: 'Claude API request failed', 
                    message: errorMessage || 'Invalid request to Claude API. Please check your API key and credits.',
                    details: 'If you have low credits, you can try using Gemini API instead by selecting it in the form builder.'
                });
            }
            
            res.status(500).json({ 
                error: 'Failed to generate form with Claude', 
                details: errorMessage,
                message: 'An error occurred while generating the form with Claude API. Please try again or use Gemini API instead.'
            });
        }
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate form with AI',
            details: error.message,
            message: 'An unexpected error occurred. Please try again or create the form manually.'
        });
    }
});

// Helper function to call Gemini API for generate-form endpoint
async function tryGeminiAPIForForm(topic, description, numQuestions, res) {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
            error: 'Gemini API Key missing',
            message: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.'
        });
    }

    try {
        const prompt = `You are an expert form designer. Create a form with ${numQuestions} questions about "${topic}"${description ? ` with the following details: ${description}` : ''}.
        
        For each field, provide:
        1. A unique ID (use camelCase)
        2. Field type (text, textarea, number, radio, checkbox, select)
        3. A clear and concise label
        4. Placeholder text (if applicable)
        5. Options (for radio, checkbox, select)
        6. Whether the field is required
        
        Format the response as a JSON array of objects with these properties:
        [
            {
                "id": "fieldName",
                "type": "fieldType",
                "label": "Field Label",
                "placeholder": "Example placeholder",
                "options": ["Option 1", "Option 2"],
                "required": true
            }
        ]
        
        Only return the JSON array, no other text.`;

        // Try different Gemini model names in order (using available models from API key)
        // Based on available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-flash-latest, gemini-pro-latest
        const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying Gemini model: ${model}`);
                const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4000
                        }
                    })
                });

                if (!geminiResponse.ok) {
                    const errorData = await geminiResponse.json().catch(() => ({}));
                    console.error(`Gemini API Error with model ${model}:`, JSON.stringify(errorData, null, 2));
                    lastError = errorData.error?.message || errorData.message || `Gemini API error: ${geminiResponse.status}`;
                    
                    // Check if it's an invalid API key error - don't try other models
                    const errorMessage = (errorData.error?.message || errorData.message || '').toLowerCase();
                    if (errorMessage.includes('api key') || errorMessage.includes('invalid') || errorMessage.includes('permission denied')) {
                        throw new Error(`Invalid Gemini API key: ${errorData.error?.message || errorData.message || 'Invalid API key'}`);
                    }
                    
                    // If it's a model not found error, try next model
                    if (geminiResponse.status === 400 && (errorData.error?.message?.includes('model') || errorData.error?.message?.includes('not found'))) {
                        console.log(`Model ${model} not available, trying next...`);
                        continue;
                    }
                    throw new Error(lastError);
                }

                const data = await geminiResponse.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                if (!content) {
                    console.error("Gemini API returned empty response:", JSON.stringify(data, null, 2));
                    throw new Error('Gemini API returned empty response');
                }
                
                let fields = [];
                try {
                    // Try to extract JSON from code blocks if present
                    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
                    const jsonToParse = jsonMatch ? jsonMatch[0] : content;
                    const jsonBlock = jsonToParse.replace(/```json\n?|\n?```/g, '').trim();
                    fields = JSON.parse(jsonBlock);
                } catch (error) {
                    console.error('Error parsing Gemini response:', error);
                    console.error('Raw response:', content);
                    throw new Error(`Failed to parse Gemini AI response: ${error.message}`);
                }

                return res.json({ 
                    success: true, 
                    fields, 
                    provider: 'gemini'
                });
            } catch (modelErr) {
                lastError = modelErr.message;
                // If this is the last model, throw the error
                if (model === models[models.length - 1]) {
                    throw modelErr;
                }
                // Otherwise, continue to next model
                console.log(`Model ${model} failed, trying next...`);
            }
        }
        
        // If all models failed
        throw new Error(lastError || 'All Gemini models failed');
    } catch (err) {
        console.error("Gemini API Error:", err);
        
        const errorMessage = err.message?.toLowerCase() || '';
        
        // Check for invalid API key errors
        if (errorMessage.includes('invalid api key') || errorMessage.includes('invalid gemini api key') || errorMessage.includes('permission denied')) {
            return res.status(503).json({ 
                error: 'Invalid Gemini API Key', 
                message: 'The Gemini API key is incorrect or expired. Please get a new API key from https://aistudio.google.com/app/apikey',
                details: '1. Visit https://aistudio.google.com/app/apikey\n2. Sign in to your Google account\n3. Create a new API key\n4. Update GEMINI_API_KEY in your .env file or Render environment variables'
            });
        }
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            return res.status(503).json({ 
                error: 'Gemini API authentication failed', 
                message: 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY in the .env file.'
            });
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate form with Gemini', 
            details: err.message,
            message: 'An error occurred while generating the form with Gemini API. Please try again.'
        });
    }
}

// Generate form fields using Gemini API (testing - separate endpoint)
// Generate form fields using Gemini API (protected)
router.post('/ai/generate-gemini', auth, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                error: 'Missing prompt',
                message: 'Please provide a prompt for form generation.'
            });
        }
        
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not set in environment variables");
            return res.status(503).json({ 
                error: 'Gemini API Key missing',
                message: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your Render environment variables or .env file.',
                details: 'Go to Render Dashboard → Your Backend Service → Environment → Add GEMINI_API_KEY variable'
            });
        }

        // Use the helper function
        return await tryGeminiAPI(prompt, res);
    } catch (outerErr) {
        console.error("Unexpected error in /ai/generate-gemini endpoint:", outerErr);
        console.error("Error stack:", outerErr.stack);
        return res.status(500).json({ 
            error: 'Unexpected server error', 
            details: outerErr.message,
            stack: process.env.NODE_ENV === 'development' ? outerErr.stack : undefined,
            message: 'An unexpected error occurred. Please check server logs for details.'
        });
    }
});

// Test Gemini API connection
router.get('/ai/test-gemini', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ 
                error: 'Gemini API Key missing',
                message: 'GEMINI_API_KEY is not configured.'
            });
        }

        // First, try to list available models to see what's accessible
        const modelsListResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let availableModels = [];
        if (modelsListResponse.ok) {
            const modelsData = await modelsListResponse.json();
            availableModels = modelsData.models?.map(m => m.name?.replace('models/', '') || m.name) || [];
        }

        // Try a simple generation with available models (based on API key access)
        const modelNames = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
        let testResponse = null;
        let workingModel = null;
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "Say hello"
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 10
                        }
                    })
                });

                if (testResponse.ok) {
                    workingModel = modelName;
                    break;
                } else {
                    const errorData = await testResponse.json().catch(() => ({}));
                    lastError = errorData.error?.message || `Status ${testResponse.status}`;
                    if (testResponse.status === 404) {
                        continue; // Try next model
                    } else {
                        break; // Different error, stop trying
                    }
                }
            } catch (err) {
                lastError = err.message;
                continue;
            }
        }

        if (!testResponse || !testResponse.ok) {

            const errorData = await testResponse.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || errorData.message || lastError || 'Unknown error';
            
            // Check for invalid API key
            if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('permission denied')) {
                return res.status(503).json({
                    error: 'Invalid Gemini API Key',
                    status: testResponse?.status || 500,
                    message: 'The Gemini API key is incorrect, expired, or revoked.',
                    details: errorData,
                    instructions: [
                        '1. Visit https://aistudio.google.com/app/apikey',
                        '2. Sign in to your Google account',
                        '3. Create a new API key',
                        '4. Copy the complete key',
                        '5. Update GEMINI_API_KEY in your .env file or Render environment variables',
                        '6. Restart your server'
                    ]
                });
            }
            
            return res.status(testResponse?.status || 500).json({
                error: 'Gemini API test failed',
                status: testResponse?.status || 500,
                details: errorData,
                message: errorMessage,
                availableModels: availableModels.length > 0 ? availableModels : 'Could not fetch model list',
                triedModels: modelNames
            });
        }

        const responseData = await testResponse.json();
        return res.json({
            success: true,
            message: 'Gemini API connection successful',
            workingModel: workingModel,
            availableModels: availableModels.length > 0 ? availableModels : ['Could not fetch model list'],
            testResponse: responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'Connection successful'
        });
    } catch (err) {
        console.error("Gemini API test error:", err);
        return res.status(500).json({
            error: 'Gemini API test failed',
            details: err.message
        });
    }
});

// --- ANALYTICS ROUTES ---

module.exports = router;
