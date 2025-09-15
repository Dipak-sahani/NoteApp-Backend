import mongoose from 'mongoose'

const tenantSchema = new mongoose.Schema({
    createdby:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  noteLimit: {
    type: Number,
    default: 3
  },
  noteCount:{
    type:Number,
    default:0
  }
}, {
  timestamps: true
});

export const Tenant = mongoose.model("Tenant", tenantSchema)
