import mongoose from 'mongoose';

let cachedConnectionPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(uri)
      .then((connection) => {
        console.log('MongoDB connected');
        return connection;
      })
      .catch((err) => {
        cachedConnectionPromise = null;
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  return cachedConnectionPromise;
};

export default connectDB;

