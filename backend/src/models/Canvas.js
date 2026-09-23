import mongoose from 'mongoose';

const shapeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['rect', 'circle', 'text']
    },
    x: {
      type: Number,
      required: true,
      default: 0
    },
    y: {
      type: Number,
      required: true,
      default: 0
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    radius: {
      type: Number
    },
    rotation: {
      type: Number,
      default: 0
    },
    fill: {
      type: String,
      default: '#3b82f6'
    },
    text: {
      type: String
    },
    fontSize: {
      type: Number
    }
  },
  { _id: false }
);

const canvasSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Canvas name is required'],
      trim: true,
      default: 'Untitled Canvas',
      maxlength: [100, 'Canvas name cannot exceed 100 characters']
    },
    shapes: {
      type: [shapeSchema],
      default: []
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Canvas', canvasSchema, 'canvases');
