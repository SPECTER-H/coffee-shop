const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stark_db_user:wefjyd-tYkcuj-ficga5@clustera.zxy6iij.mongodb.net/coffee_shop';
const PORT = Number(process.env.PORT) || 5000;

// Models
const Item = mongoose.model('Item', {
  name: String,
  price: Number,
  stock: Number
});

const Order = mongoose.model('Order', {
  items: Array,
  total: Number,
  date: { type: Date, default: Date.now }
});

// Routes
app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/order', async (req, res) => {
  const { items, total } = req.body;

  for (let i of items) {
    await Item.updateOne({ _id: i._id }, { $inc: { stock: -i.qty } });
  }

  const order = new Order({ items, total });
  await order.save();

  res.json(order);
});

//implementation
async function startServer() {
  try {
    console.log(`Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try: PORT=5001 node server.js`);
        process.exit(1);
      }
      throw err;
    });
  } catch (err) {
    console.error('Failed to start server.');
    if (err && err.name === 'MongooseServerSelectionError') {
      console.error(`MongoDB connection failed for ${MONGODB_URI}`);
      console.error('Is MongoDB running on your machine?');
    }
    console.error(err);
    process.exit(1);
  }
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log(err));

startServer();