import express from 'express';
import { saveLetter, getLastLetter } from '../controllers/futureLetterController.js';

const router = express.Router();

router.post('/save', saveLetter);
router.get('/last/:childId', getLastLetter);

export default router;