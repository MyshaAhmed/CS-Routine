const mongoose = require('mongoose');

const scheduleSectionSchema = new mongoose.Schema({
  // Dynamic structure for periods 1-9
}, { strict: false, _id: false });

const conflictSectionSchema = new mongoose.Schema({
  // Dynamic structure for conflicts
}, { strict: false, _id: false });

const daySchema = new mongoose.Schema({
  'A section': scheduleSectionSchema,
  'B section': scheduleSectionSchema,
  'C section': scheduleSectionSchema
}, { _id: false });

const conflictDaySchema = new mongoose.Schema({
  'A section': conflictSectionSchema,
  'B section': conflictSectionSchema,
  'C section': conflictSectionSchema
}, { _id: false });

const batchSchema = new mongoose.Schema({
  year: String,
  semester: String,
  name: String,
  color: String,
  schedule: {
    sat: daySchema,
    sun: daySchema,
    mon: daySchema,
    tue: daySchema,
    wed: daySchema
  },
  conflicts: {
    sat: conflictDaySchema,
    sun: conflictDaySchema,
    mon: conflictDaySchema,
    tue: conflictDaySchema,
    wed: conflictDaySchema
  }
});

module.exports = mongoose.model('Batch', batchSchema);