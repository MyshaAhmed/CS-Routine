const mongoose = require('mongoose');

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mysha9ahmed:Mongodb_2003166@cluster0.cjf9wiw.mongodb.net/routineDB?retryWrites=true&w=majority');
      console.log('MongoDB connected');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  };

module.exports = connectDB;