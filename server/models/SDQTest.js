import mongoose from 'mongoose';

// Схема для питань (з колекції 'tests')
const sdqSchema = new mongoose.Schema({
    name: String,
    description: String,
    questions: Array
});

// Схема для результатів (з колекції 'sdqresults')
const sdqResultSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    scores: {
        emotional: Number,
        conduct: Number,
        hyperactivity: Number,
        peer: Number,
        prosocial: Number,
        total: Number
    },
    status: String,
    date: { type: Date, default: Date.now }
});

export const SDQModel = mongoose.model('SDQ', sdqSchema, 'tests');
export const SDQResultModel = mongoose.model('SDQResult', sdqResultSchema, 'sdqresults');