// models/Note.js
import mongoose, {Schema} from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenant:{
    type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' 
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound index for efficient tenant-based queries
noteSchema.index({ tenantId: 1, createdAt: -1 });




export const Note = mongoose.model("Note", noteSchema)
