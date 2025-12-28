const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic Client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || 'dummy-key', // Fallback for dev without key
});

// --- FORM ROUTES ---

// Create a new form
router.post('/forms', async (req, res) => {
    try {
        const { title, description, fields } = req.body;
        const newForm = new Form({ title, description, fields });
        await newForm.save();
        res.status(201).json(newForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all forms (for dashboard)
router.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find().sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a form by ID
router.get('/forms/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a form
router.put('/forms/:id', async (req, res) => {
    try {
        const { title, description, fields } = req.body;
        const updatedForm = await Form.findByIdAndUpdate(
            req.params.id,
            { title, description, fields },
            { new: true }
        );
        if (!updatedForm) return res.status(404).json({ error: 'Form not found' });
        res.json(updatedForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a form
router.delete('/forms/:id', async (req, res) => {
    try {
        const form = await Form.findByIdAndDelete(req.params.id);
        if (!form) return res.status(404).json({ error: 'Form not found' });
        // Also delete associated responses
        await Response.deleteMany({ formId: req.params.id });
        res.json({ message: 'Form and associated responses deleted' });
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

// Get analytics (basic count for now)
router.get('/forms/:id/analytics', async (req, res) => {
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

// Generate form fields using Claude API only (no fallback)
router.post('/ai/generate', async (req, res) => {
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
                    details: 'If you have low credits, you can try using Grok API instead by selecting it in the form builder.'
                });
            }
            
            res.status(500).json({ 
                error: 'Failed to generate form with Claude', 
                details: errorMessage,
                message: 'An error occurred while generating the form with Claude API. Please try again or use Grok API instead.'
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

// Helper function to call Grok API (standalone, no fallback)
async function tryGrokAPI(prompt, res) {
    if (!process.env.GROK_API_KEY) {
        console.error("Grok API Key not found in environment variables");
        return res.status(503).json({ 
            error: 'Grok API Key missing',
            message: 'Grok API key is not configured. Please set GROK_API_KEY in your Render environment variables or .env file.',
            details: 'Go to Render Dashboard → Your Backend Service → Environment → Add GROK_API_KEY variable'
        });
    }

    try {
        // Try different model names in order
        const models = ['grok-2-1212', 'grok-beta', 'grok-2'];
        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying Grok model: ${model}`);
                const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{
                            role: 'user',
                            content: `Generate a list of form fields for a form about: "${prompt}". 
                            Return ONLY a JSON array of objects. Each object should have:
                            - id: string (unique)
                            - type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select"
                            - label: string
                            - placeholder: string (optional)
                            - options: array of strings (only for radio/checkbox/select)
                            - required: boolean
                            Do not include any markdown formatting or explanation.`
                        }],
                        max_tokens: 1024,
                        temperature: 0.7
                    })
                });

                if (!grokResponse.ok) {
                    const errorData = await grokResponse.json().catch(() => ({}));
                    console.error(`Grok API Error with model ${model}:`, JSON.stringify(errorData, null, 2));
                    lastError = errorData.error?.message || errorData.message || `Grok API error: ${grokResponse.status}`;
                    // If it's a model not found error, try next model
                    if (grokResponse.status === 400 && (errorData.error?.message?.includes('model') || errorData.error?.message?.includes('invalid'))) {
                        console.log(`Model ${model} not available, trying next...`);
                        continue;
                    }
                    throw new Error(lastError);
                }

                const data = await grokResponse.json();
                const textResponse = data.choices[0]?.message?.content || '';
                
                if (!textResponse) {
                    console.error("Grok API returned empty response:", JSON.stringify(data, null, 2));
                    throw new Error('Grok API returned empty response');
                }
                
                // Parse the JSON from the content
                const jsonBlock = textResponse.replace(/```json\n?|\n?```/g, '').trim();
                let fields;
                try {
                    fields = JSON.parse(jsonBlock);
                } catch (parseErr) {
                    console.error("Failed to parse Grok response as JSON:", parseErr);
                    console.error("Raw response:", textResponse);
                    throw new Error(`Failed to parse Grok API response: ${parseErr.message}. Raw response: ${textResponse.substring(0, 200)}`);
                }

                return res.json({ 
                    fields, 
                    provider: 'grok'
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
        throw new Error(lastError || 'All Grok models failed');
    } catch (err) {
        console.error("Grok API Error:", err);
        
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            return res.status(503).json({ 
                error: 'Grok API authentication failed', 
                message: 'Invalid or missing Grok API key. Please check your GROK_API_KEY in the .env file.'
            });
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate form with Grok', 
            details: err.message,
            message: 'An error occurred while generating the form with Grok API. Please try again.'
        });
    }
}

// AI-Generated Form Suggestion (Claude API only - no fallback)
router.post('/ai/generate-form', async (req, res) => {
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
                    details: 'If you have low credits, you can try using Grok API instead by selecting it in the form builder.'
                });
            }
            
            res.status(500).json({ 
                error: 'Failed to generate form with Claude', 
                details: errorMessage,
                message: 'An error occurred while generating the form with Claude API. Please try again or use Grok API instead.'
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

// Helper function to call Grok API for generate-form endpoint
async function tryGrokAPIForForm(topic, description, numQuestions, res) {
    if (!process.env.GROK_API_KEY) {
        return res.status(503).json({ 
            error: 'Grok API Key missing',
            message: 'Grok API key is not configured. Please set GROK_API_KEY in your .env file.'
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

        // Try different model names in order
        const models = ['grok-2-1212', 'grok-beta', 'grok-2'];
        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying Grok model: ${model}`);
                const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }],
                        max_tokens: 4000,
                        temperature: 0.7
                    })
                });

                if (!grokResponse.ok) {
                    const errorData = await grokResponse.json().catch(() => ({}));
                    console.error(`Grok API Error with model ${model}:`, JSON.stringify(errorData, null, 2));
                    lastError = errorData.error?.message || errorData.message || `Grok API error: ${grokResponse.status}`;
                    // If it's a model not found error, try next model
                    if (grokResponse.status === 400 && (errorData.error?.message?.includes('model') || errorData.error?.message?.includes('invalid'))) {
                        console.log(`Model ${model} not available, trying next...`);
                        continue;
                    }
                    throw new Error(lastError);
                }

                const data = await grokResponse.json();
                const content = data.choices[0]?.message?.content || '';
                
                if (!content) {
                    console.error("Grok API returned empty response:", JSON.stringify(data, null, 2));
                    throw new Error('Grok API returned empty response');
                }
                
                let fields = [];
                try {
                    // Try to extract JSON from code blocks if present
                    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
                    const jsonToParse = jsonMatch ? jsonMatch[0] : content;
                    const jsonBlock = jsonToParse.replace(/```json\n?|\n?```/g, '').trim();
                    fields = JSON.parse(jsonBlock);
                } catch (error) {
                    console.error('Error parsing Grok response:', error);
                    console.error('Raw response:', content);
                    throw new Error(`Failed to parse Grok AI response: ${error.message}`);
                }

                return res.json({ 
                    success: true, 
                    fields, 
                    provider: 'grok'
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
        throw new Error(lastError || 'All Grok models failed');
    } catch (err) {
        console.error("Grok API Error:", err);
        
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            return res.status(503).json({ 
                error: 'Grok API authentication failed', 
                message: 'Invalid or missing Grok API key. Please check your GROK_API_KEY in the .env file.'
            });
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate form with Grok', 
            details: err.message,
            message: 'An error occurred while generating the form with Grok API. Please try again.'
        });
    }
}

// Generate form fields using Grok API (testing - separate endpoint)
router.post('/ai/generate-grok', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                error: 'Missing prompt',
                message: 'Please provide a prompt for form generation.'
            });
        }
        
        if (!process.env.GROK_API_KEY) {
            console.error("GROK_API_KEY is not set in environment variables");
            return res.status(503).json({ 
                error: 'Grok API Key missing',
                message: 'Grok API key is not configured. Please set GROK_API_KEY in your Render environment variables or .env file.',
                details: 'Go to Render Dashboard → Your Backend Service → Environment → Add GROK_API_KEY variable'
            });
        }

        try {
        // Try different model names in order
        const models = ['grok-2-1212', 'grok-beta', 'grok-2'];
        let lastError = null;
        
        for (const model of models) {
            try {
                console.log(`Trying Grok model: ${model}`);
                const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{
                            role: 'user',
                            content: `Generate a list of form fields for a form about: "${prompt}". 
                            Return ONLY a JSON array of objects. Each object should have:
                            - id: string (unique)
                            - type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select"
                            - label: string
                            - placeholder: string (optional)
                            - options: array of strings (only for radio/checkbox/select)
                            - required: boolean
                            Do not include any markdown formatting or explanation.`
                        }],
                        max_tokens: 1024,
                        temperature: 0.7
                    })
                });

                if (!grokResponse.ok) {
                    const errorData = await grokResponse.json().catch(() => ({}));
                    console.error(`Grok API Error with model ${model}:`, JSON.stringify(errorData, null, 2));
                    lastError = errorData.error?.message || errorData.message || `Grok API error: ${grokResponse.status}`;
                    // If it's a model not found error, try next model
                    if (grokResponse.status === 400 && (errorData.error?.message?.includes('model') || errorData.error?.message?.includes('invalid'))) {
                        console.log(`Model ${model} not available, trying next...`);
                        continue;
                    }
                    throw new Error(lastError);
                }

                const data = await grokResponse.json();
                const textResponse = data.choices[0]?.message?.content || '';
                
                if (!textResponse) {
                    console.error("Grok API returned empty response:", JSON.stringify(data, null, 2));
                    throw new Error('Grok API returned empty response');
                }
                
                // Parse the JSON from the content
                const jsonBlock = textResponse.replace(/```json\n?|\n?```/g, '').trim();
                let fields;
                try {
                    fields = JSON.parse(jsonBlock);
                } catch (parseErr) {
                    console.error("Failed to parse Grok response as JSON:", parseErr);
                    console.error("Raw response:", textResponse);
                    throw new Error(`Failed to parse Grok API response: ${parseErr.message}. Raw response: ${textResponse.substring(0, 200)}`);
                }

                return res.json({ fields, provider: 'grok' });
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
        throw new Error(lastError || 'All Grok models failed');
    } catch (err) {
        console.error("Grok API Error:", err);
        console.error("Error stack:", err.stack);
            
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            return res.status(503).json({ 
                error: 'Grok API authentication failed', 
                message: 'Invalid or missing Grok API key. Please check your GROK_API_KEY in the .env file.'
            });
        }
        
        if (err.message?.includes('429') || err.message?.includes('rate limit')) {
            return res.status(503).json({ 
                error: 'Grok API rate limit exceeded', 
                message: 'Too many requests. Please try again later.'
            });
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate form with Grok', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            message: 'An error occurred while generating the form with Grok API. Please try again or use Claude API.'
        });
    }
    } catch (outerErr) {
        console.error("Unexpected error in /ai/generate-grok endpoint:", outerErr);
        console.error("Error stack:", outerErr.stack);
        return res.status(500).json({ 
            error: 'Unexpected server error', 
            details: outerErr.message,
            stack: process.env.NODE_ENV === 'development' ? outerErr.stack : undefined,
            message: 'An unexpected error occurred. Please check server logs for details.'
        });
    }
});

// Test Grok API connection
router.get('/ai/test-grok', async (req, res) => {
    try {
        if (!process.env.GROK_API_KEY) {
            return res.status(503).json({ 
                error: 'Grok API Key missing',
                message: 'GROK_API_KEY is not configured.'
            });
        }

        // Try a simple API call to test the connection
        const testResponse = await fetch('https://api.x.ai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            }
        });

        if (!testResponse.ok) {
            const errorData = await testResponse.json().catch(() => ({}));
            return res.status(testResponse.status).json({
                error: 'Grok API test failed',
                status: testResponse.status,
                details: errorData
            });
        }

        const models = await testResponse.json();
        return res.json({
            success: true,
            message: 'Grok API connection successful',
            availableModels: models.data?.map(m => m.id) || []
        });
    } catch (err) {
        console.error("Grok API test error:", err);
        return res.status(500).json({
            error: 'Grok API test failed',
            details: err.message
        });
    }
});

// --- ANALYTICS ROUTES ---

module.exports = router;
