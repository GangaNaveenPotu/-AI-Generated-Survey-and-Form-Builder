# Example: Creating a Customer Feedback Form with AI

This guide will walk you through creating a customer feedback form using the AI generation feature, submitting test responses, and analyzing the results.

## Step 1: Create a New Form

1. Start the application by running both the backend and frontend servers if they're not already running:

   ```bash
   # In the backend directory
   npm start

   # In a new terminal, in the frontend directory
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Click on "Create New Form"

## Step 2: Generate Form with AI

1. In the form builder, click the "AI Generate Form" button

2. Enter the following prompt:
   ```
   Customer feedback form for an e-commerce website with 5-7 questions
   ```

3. Adjust the number of questions to 6 using the slider

4. Click "Generate Form"

5. The AI will generate form fields similar to:
   - Customer Name (text, required)
   - Email Address (email, required)
   - How would you rate your shopping experience? (rating 1-5, required)
   - What did you purchase? (text)
   - How satisfied are you with your purchase? (scale 1-10)
   - What could we improve? (textarea)
   - Would you recommend us to others? (yes/no)

6. Click "Save Form" and give it a title like "E-commerce Customer Feedback"

## Step 3: Submit Test Responses

1. From the dashboard, click "View" on your new form

2. Submit several test responses with different ratings and feedback

3. Example responses:
   - **Response 1 (Positive):**
     - Name: John Doe
     - Email: john@example.com
     - Rating: 5
     - Purchased: Wireless Headphones
     - Satisfaction: 9
     - Improvements: Faster shipping options
     - Recommend: Yes

   - **Response 2 (Neutral):**
     - Name: Jane Smith
     - Email: jane@example.com
     - Rating: 3
     - Purchased: Smartphone Case
     - Satisfaction: 6
     - Improvements: Better product descriptions
     - Recommend: Maybe

   - **Response 3 (Negative):**
     - Name: Bob Johnson
     - Email: bob@example.com
     - Rating: 2
     - Purchased: Bluetooth Speaker
     - Satisfaction: 4
     - Improvements: Product quality and customer service
     - Recommend: No

## Step 4: Analyze the Results

1. From the dashboard, click "Analytics" for your form

2. You'll see:
   - Total number of responses
   - Completion rate
   - Response distribution for each question

3. Explore the visualizations:
   - Pie charts showing response distribution
   - Bar graphs of ratings and satisfaction scores
   - Text responses for open-ended questions

4. Export the data as CSV for further analysis by clicking "Export to CSV"

## Step 5: Customize and Iterate

1. Go back to the form builder to make adjustments based on the feedback:
   - Add more specific questions
   - Make certain fields required/optional
   - Change question types for better data collection

2. Continue collecting responses to improve your form over time

## Example API Usage

### Create a form programmatically

```javascript
const response = await fetch('http://localhost:5000/api/v1/forms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Event Registration',
    description: 'Register for our upcoming workshop',
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: 'Full Name',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true
      },
      {
        id: 'workshop',
        type: 'select',
        label: 'Select Workshop',
        options: ['React Fundamentals', 'Node.js Basics', 'UI/UX Design'],
        required: true
      }
    ]
  })
});
```

### Submit a response

```javascript
const response = await fetch('http://localhost:5000/api/v1/forms/YOUR_FORM_ID/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    answers: {
      fullName: 'Alex Johnson',
      email: 'alex@example.com',
      workshop: 'React Fundamentals'
    }
  })
});
```

## Next Steps

- Share your form with real users by deploying the application
- Set up email notifications for new form submissions
- Integrate with other tools using webhooks
- Add user authentication for form management
