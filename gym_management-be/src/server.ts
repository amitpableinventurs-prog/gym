// Must stay first: controllers read key paths from the environment when they load.
import 'dotenv/config';
import connectDB from './config/db';
import app from './app';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
