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

// Generate form fields using Claude (default) with automatic Grok fallback
router.post('/ai/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        if (!process.env.CLAUDE_API_KEY) {
            // If no Claude key, try Grok directly
            if (process.env.GROK_API_KEY) {
                return await tryGrokAPI(prompt, res);
            }
            return res.status(503).json({ error: 'Claude API Key missing in backend' });
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
            
            // Safely stringify error (might fail on circular references)
            let errorString = '';
            let errorMessage = '';
            try {
                errorString = JSON.stringify(err).toLowerCase();
                errorMessage = err.error?.error?.message || err.message || err.toString() || '';
            } catch (e) {
                errorMessage = err.message || err.toString() || String(err);
                errorString = errorMessage.toLowerCase();
            }
            
            const statusCode = err.status || err.statusCode || 500;
            
            console.error("Error status:", statusCode);
            console.error("Error message:", errorMessage);
            console.error("Grok API Key available:", !!process.env.GROK_API_KEY);
            
            // Check if it's a credit error (400 status OR contains credit message)
            const isCreditError = (
                statusCode === 400 && (
                    errorMessage.toLowerCase().includes('credit balance') || 
                    errorMessage.toLowerCase().includes('credit') ||
                    errorString.includes('credit balance') ||
                    errorString.includes('credit')
                )
            ) || (
                errorMessage.toLowerCase().includes('credit balance') || 
                errorMessage.toLowerCase().includes('credit') ||
                errorString.includes('credit balance') ||
                errorString.includes('credit')
            );
            
            console.log("Is credit error?", isCreditError);
            
            // If Claude fails due to credit issues OR any 400 error, automatically try Grok
            if ((isCreditError || statusCode === 400) && process.env.GROK_API_KEY) {
                console.log("Claude API error detected, automatically falling back to Grok API...");
                try {
                    return await tryGrokAPI(prompt, res, true); // true = isFallback
                } catch (grokErr) {
                    console.error("Grok fallback also failed:", grokErr);
                    // Continue to error response below
                }
            }
            
            // Handle other Claude API errors
            if (statusCode === 401) {
                return res.status(503).json({ 
                    error: 'Claude API authentication failed', 
                    message: 'Invalid or missing Claude API key. Please check your CLAUDE_API_KEY in the .env file.'
                });
            }
            
            // If any error and Grok is available, try Grok as fallback
            if (process.env.GROK_API_KEY) {
                console.log("Claude API failed, trying Grok as fallback...");
                try {
                    return await tryGrokAPI(prompt, res, true);
                } catch (grokErr) {
                    console.error("Grok fallback also failed:", grokErr);
                    // Continue to error response below
                }
            }
            
            res.status(500).json({ 
                error: 'Failed to generate form', 
                details: errorMessage,
                message: 'An error occurred while generating the form. Please try again or create the form manually.'
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

// Helper function to call Grok API
async function tryGrokAPI(prompt, res, isFallback = false) {
    if (!process.env.GROK_API_KEY) {
        return res.status(503).json({ 
            error: 'Grok API Key missing',
            message: 'Grok API key is not configured. Please set GROK_API_KEY in your .env file.'
        });
    }

    try {
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
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
            throw new Error(errorData.error?.message || `Grok API error: ${grokResponse.status}`);
        }

        const data = await grokResponse.json();
        const textResponse = data.choices[0]?.message?.content || '';
        
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
            provider: 'grok',
            fallback: isFallback,
            message: isFallback ? 'Claude API credits low, used Grok API instead' : undefined
        });
    } catch (err) {
        console.error("Grok API Error:", err);
        
        if (isFallback) {
            // If Grok also fails during fallback, return error
            return res.status(500).json({ 
                error: 'Both Claude and Grok API failed', 
                details: err.message,
                message: 'Failed to generate form with both AI providers. Please try again or create the form manually.'
            });
        }
        
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

// AI-Generated Form Suggestion
router.post('/ai/generate-form', async (req, res) => {
    try {
        const { topic, description, numQuestions = 5 } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
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

        if (!process.env.CLAUDE_API_KEY) {
            // If no Claude key, try Grok directly
            if (process.env.GROK_API_KEY) {
                return tryGrokAPIForForm(topic, description, numQuestions, res);
            }
            return res.status(503).json({ error: 'Claude API Key missing in backend' });
        }

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
            console.error("Error details:", JSON.stringify(error, null, 2));
            console.error("Error status:", error.status);
            console.error("Error statusCode:", error.statusCode);
            
            // Check for credit error in multiple ways (Anthropic error structure can vary)
            const errorMessage = error.error?.error?.message || error.message || error.toString() || '';
            const errorString = JSON.stringify(error).toLowerCase();
            const statusCode = error.status || error.statusCode || 500;
            
            // Check if it's a credit error (400 status OR contains credit message)
            const isCreditError = (
                statusCode === 400 && (
                    errorMessage.toLowerCase().includes('credit balance') || 
                    errorMessage.toLowerCase().includes('credit') ||
                    errorString.includes('credit balance') ||
                    errorString.includes('credit')
                )
            ) || (
                errorMessage.toLowerCase().includes('credit balance') || 
                errorMessage.toLowerCase().includes('credit') ||
                errorString.includes('credit balance') ||
                errorString.includes('credit')
            );
            
            console.log("Status code:", statusCode, "Is credit error?", isCreditError, "Grok available?", !!process.env.GROK_API_KEY);
            
            // If Claude fails due to credit issues OR any 400 error, automatically try Grok
            if ((isCreditError || statusCode === 400) && process.env.GROK_API_KEY) {
                console.log("Claude API error detected, automatically falling back to Grok API...");
                return tryGrokAPIForForm(topic, description, numQuestions, res, true);
            }
            
            // Handle other Claude API errors
            if (statusCode === 401) {
                return res.status(503).json({ 
                    error: 'Claude API authentication failed', 
                    message: 'Invalid or missing Claude API key. Please check your CLAUDE_API_KEY in the .env file.'
                });
            }
            
            // If any error and Grok is available, try Grok as fallback
            if (process.env.GROK_API_KEY) {
                console.log("Claude API failed, trying Grok as fallback...");
                return tryGrokAPIForForm(topic, description, numQuestions, res, true);
            }
            
            throw error; // Re-throw if no fallback available
        }
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate form with AI',
            details: error.message,
            message: 'An error occurred while generating the form. Please try again or create the form manually.'
        });
    }
});

// Helper function to call Grok API for generate-form endpoint
async function tryGrokAPIForForm(topic, description, numQuestions, res, isFallback = false) {
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

        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
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
            throw new Error(errorData.error?.message || `Grok API error: ${grokResponse.status}`);
        }

        const data = await grokResponse.json();
        const content = data.choices[0]?.message?.content || '';
        let fields = [];
        
        try {
            // Try to extract JSON from code blocks if present
            const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
            fields = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        } catch (error) {
            console.error('Error parsing Grok response:', error);
            return res.status(500).json({ 
                error: 'Failed to parse Grok AI response',
                details: error.message,
                rawResponse: content
            });
        }

        return res.json({ 
            success: true, 
            fields, 
            provider: 'grok',
            fallback: isFallback,
            message: isFallback ? 'Claude API credits low, used Grok API instead' : undefined
        });
    } catch (err) {
        console.error("Grok API Error:", err);
        
        if (isFallback) {
            return res.status(500).json({ 
                error: 'Both Claude and Grok API failed', 
                details: err.message,
                message: 'Failed to generate form with both AI providers. Please try again or create the form manually.'
            });
        }
        
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
    const { prompt } = req.body;
    if (!process.env.GROK_API_KEY) {
        return res.status(503).json({ 
            error: 'Grok API Key missing in backend',
            message: 'Please set GROK_API_KEY in your .env file for testing.'
        });
    }

    try {
        // Grok API uses OpenAI-compatible endpoint
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
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
            throw new Error(errorData.error?.message || `Grok API error: ${grokResponse.status}`);
        }

        const data = await grokResponse.json();
        const textResponse = data.choices[0]?.message?.content || '';
        
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

        res.json({ fields, provider: 'grok' });
    } catch (err) {
        console.error("Grok API Error:", err);
        
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
        
        res.status(500).json({ 
            error: 'Failed to generate form with Grok', 
            details: err.message,
            message: 'An error occurred while generating the form with Grok API. Please try again or use Claude API.'
        });
    }
});

// --- ANALYTICS ROUTES ---

module.exports = router;
