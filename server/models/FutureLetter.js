import mongoose from 'mongoose';

const futureLetterSchema = new mongoose.Schema({
  childId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Child', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Створюємо модель
const FutureLetter = mongoose.model('FutureLetter', futureLetterSchema);

// ВАЖЛИВО: Саме цей рядок виправляє помилку "does not provide an export named 'default'"
export default FutureLetter;