const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  code: String,
  teachers: [String],
  rooms: [String],
  isSessional: Boolean,
  startPeriod: Number
});

const conflictSchema = new mongoose.Schema({
  code: String,
  teachers: [String],
  rooms: [String],
  sections: [String],
  originalPeriod: Number
});

const daySchema = new mongoose.Schema({
  'A section': {
    type: Map,
    of: periodSchema
  },
  'B section': {
    type: Map,
    of: periodSchema
  },
  'C section': {
    type: Map,
    of: periodSchema
  }
});

const conflictDaySchema = new mongoose.Schema({
  'A section': {
    type: Map,
    of: conflictSchema
  },
  'B section': {
    type: Map,
    of: conflictSchema
  },
  'C section': {
    type: Map,
    of: conflictSchema
  }
});

const batchSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#ffffff' },
  schedule: {
    type: Map,
    of: daySchema,
    required: true
  },
  conflicts: {
    type: Map,
    of: conflictDaySchema,
    required: true
  }
});

module.exports = mongoose.model('Batch', batchSchema);