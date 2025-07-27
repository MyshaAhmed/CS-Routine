const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  shortName: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  university: { type: String, required: true }
});

module.exports = mongoose.model('Teacher', teacherSchema);