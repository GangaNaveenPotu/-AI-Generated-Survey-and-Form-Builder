# 🗑️ How to Remove Grok API Support (After Testing)

If you want to remove Grok API support after testing, follow these steps:

## Backend Changes

### 1. Remove Grok Endpoint
**File:** `backend/routes/api.js`

Delete or comment out the `/ai/generate-grok` route (around line 260-310):
```javascript
// Remove this entire route:
router.post('/ai/generate-grok', async (req, res) => {
    // ... entire route code ...
});
```

### 2. Remove Environment Variable (Optional)
**File:** `backend/.env`

Remove or comment out:
```env
GROK_API_KEY=your_grok_api_key_here
```

## Frontend Changes

### 1. Remove Grok Endpoint
**File:** `frontend/src/config/api.js`

Remove this line:
```javascript
AI_GENERATE_GROK: `${API_BASE_URL}/api/v1/ai/generate-grok`, // Remove this
```

### 2. Remove Provider Toggle
**File:** `frontend/src/components/FormBuilder.jsx`

1. Remove the state:
```javascript
// Remove this line:
const [aiProvider, setAiProvider] = useState('claude');
```

2. Remove the provider toggle UI (the button group around line 400-420)

3. Update `generateWithAI` function to always use Claude:
```javascript
// Change from:
const endpoint = aiProvider === 'grok' ? API_ENDPOINTS.AI_GENERATE_GROK : API_ENDPOINTS.AI_GENERATE;

// To:
const endpoint = API_ENDPOINTS.AI_GENERATE;
```

4. Remove provider name from error messages (change `providerName` references back to just "Claude")

## Documentation

### Update README.md
Remove references to `GROK_API_KEY` in:
- Environment Variables section
- Backend .env example

---

**That's it!** After these changes, the app will only use Claude API, and all Grok-related code will be removed.

