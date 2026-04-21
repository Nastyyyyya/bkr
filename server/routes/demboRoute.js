import express from 'express';
import { 
  saveDemboResult, 
  getDemboResultsByChild, 
  getDemboAnalytics 
} from '../controllers/demboController.js';

const demboRouter = express.Router();

demboRouter.post('/dembo-save', saveDemboResult);
demboRouter.get('/dembo-results/:childId', getDemboResultsByChild);
demboRouter.get('/dembo-analytics/:childId', getDemboAnalytics); // Це те, що викликає фронтенд

export default demboRouter;