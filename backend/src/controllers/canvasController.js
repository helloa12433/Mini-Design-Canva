import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

// Helper: validate shapes array
const validateShapes = (shapes) => {
  if (!Array.isArray(shapes)) {
    return 'Shapes must be an array';
  }

  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    if (!s || typeof s !== 'object') {
      return `Shape at index ${i} is not a valid object`;
    }
    if (!s.id || typeof s.id !== 'string') {
      return `Shape at index ${i} is missing a valid string 'id'`;
    }
    if (!['rect', 'circle', 'text'].includes(s.type)) {
      return `Shape at index ${i} has invalid type '${s.type}'. Allowed: rect, circle, text`;
    }
    if (typeof s.x !== 'number' || typeof s.y !== 'number') {
      return `Shape at index ${i} requires numeric 'x' and 'y' coordinates`;
    }
    if (s.rotation !== undefined && typeof s.rotation !== 'number') {
      return `Shape at index ${i} 'rotation' must be a number`;
    }
    if (s.fill !== undefined && typeof s.fill !== 'string') {
      return `Shape at index ${i} 'fill' must be a string`;
    }

    // Type specific checks
    if (s.type === 'rect') {
      if (typeof s.width !== 'number' || typeof s.height !== 'number') {
        return `Shape at index ${i} ('rect') requires numeric 'width' and 'height'`;
      }
    } else if (s.type === 'circle') {
      if (typeof s.radius !== 'number') {
        return `Shape at index ${i} ('circle') requires numeric 'radius'`;
      }
    } else if (s.type === 'text') {
      if (typeof s.text !== 'string') {
        return `Shape at index ${i} ('text') requires a string 'text' property`;
      }
      if (s.fontSize !== undefined && typeof s.fontSize !== 'number') {
        return `Shape at index ${i} ('text') 'fontSize' must be a number`;
      }
    }
  }

  return null;
};

// @desc    Create a new canvas
// @route   POST /api/canvases
// @access  Private
export const createCanvas = async (req, res, next) => {
  try {
    const { name, shapes = [] } = req.body;

    if (name && (typeof name !== 'string' || name.length > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Canvas name must be a string with maximum 100 characters'
      });
    }

    const validationError = validateShapes(shapes);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    const canvas = await Canvas.create({
      name: name?.trim() || 'Untitled Canvas',
      shapes,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      data: canvas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all canvases for the authenticated user
// @route   GET /api/canvases
// @access  Private
export const getCanvases = async (req, res, next) => {
  try {
    const canvases = await Canvas.find({ owner: req.user._id })
      .select('name shapes createdAt updatedAt')
      .sort({ updatedAt: -1 });

    const metadata = canvases.map((c) => ({
      _id: c._id,
      name: c.name,
      shapeCount: c.shapes.length,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific canvas by ID
// @route   GET /api/canvases/:id
// @access  Private
export const getCanvasById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid canvas ID format'
      });
    }

    const canvas = await Canvas.findById(id);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        error: 'Canvas not found'
      });
    }

    // Ownership check
    if (canvas.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access this canvas'
      });
    }

    res.status(200).json({
      success: true,
      data: canvas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing canvas
// @route   PUT /api/canvases/:id
// @access  Private
export const updateCanvas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, shapes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid canvas ID format'
      });
    }

    const canvas = await Canvas.findById(id);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        error: 'Canvas not found'
      });
    }

    // Ownership check
    if (canvas.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to update this canvas'
      });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Canvas name must be a string up to 100 characters'
        });
      }
      canvas.name = name.trim() || 'Untitled Canvas';
    }

    if (shapes !== undefined) {
      const validationError = validateShapes(shapes);
      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError
        });
      }
      canvas.shapes = shapes;
    }

    const updatedCanvas = await canvas.save();

    res.status(200).json({
      success: true,
      data: updatedCanvas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a canvas
// @route   DELETE /api/canvases/:id
// @access  Private
export const deleteCanvas = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid canvas ID format'
      });
    }

    const canvas = await Canvas.findById(id);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        error: 'Canvas not found'
      });
    }

    // Ownership check
    if (canvas.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this canvas'
      });
    }

    await canvas.deleteOne();

    res.status(200).json({
      success: true,
      data: { message: 'Canvas deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};
