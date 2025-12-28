const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    id: String,
    type: { type: String, required: true }, // 'text', 'choice', 'checkbox', etc.
    label: { type: String, required: true },
    placeholder: String,
    options: [String], // for radio/select
    required: { type: Boolean, default: false }
});

const FormSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    fields: [FieldSchema],
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Form', FormSchema);
