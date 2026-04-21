import express from 'express';
import { saveWilsonResult, getWilsonHistory } from '../controllers/wilsonController.js';

const wilsonRouter = express.Router();

wilsonRouter.post('/save', saveWilsonResult);
wilsonRouter.get('/history/:childId', getWilsonHistory);

export default wilsonRouter;