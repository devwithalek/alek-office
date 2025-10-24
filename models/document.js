import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  displayName: {
    type: String,
    required: true,
    default: "undocumented"
  },
  docType: {
    type: String,
    required: true,
    default: "collaborative"
  },
  data: {
    type: Buffer,
  },
  owner: {
    type: String,
  },
  access: {
    type: [String],
    default: [],
  },
  readAccess: {
    type: [String],
    default: [],
  },
  metadata:{
    type: Object,
    default:{}
  }
}, { timestamps: true });

const Document = mongoose.model('Document', DocumentSchema);


export default Document