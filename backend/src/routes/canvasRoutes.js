import express from 'express';
import {
  createCanvas,
  getCanvases,
  getCanvasById,
  updateCanvas,
  deleteCanvas
} from '../controllers/canvasController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All canvas routes require authentication
router.use(protect);

router.route('/')
  .post(createCanvas)
  .get(getCanvases);

router.route('/:id')
  .get(getCanvasById)
  .put(updateCanvas)
  .delete(deleteCanvas);

export default router;
