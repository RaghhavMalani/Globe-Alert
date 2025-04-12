
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/geosphere-war-alert';
const DB_NAME = 'geosphere-war-alert';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db(DB_NAME);
    
    // Initialize with sample data if collection is empty
    const eventsCollection = db.collection('events');
    const count = await eventsCollection.countDocuments();
    
    if (count === 0) {
      console.log('Initializing database with sample data...');
      await seedDatabase(eventsCollection);
    }
    
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// API Routes
app.get('/api/events', async (req, res) => {
  try {
    const { types, timeRange, severity } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Filter by event types if specified
    if (types) {
      const typeArray = types.split(',');
      query.type = { $in: typeArray };
    }
    
    // Filter by severity if specified
    if (severity) {
      const severityArray = severity.split(',').map(Number);
      query.severity = { $in: severityArray };
    }
    
    // Filter by time range if specified
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch(timeRange) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.timestamp = { $gte: startDate.toISOString() };
      }
    }
    
    // Get events from database
    const events = await db.collection('events').find(query).toArray();
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = await db.collection('events').findOne({ 
      $or: [
        { id: id },
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
app.post('/api/events', async (req, res) => {
  try {
    const newEvent = {
      ...req.body,
      id: req.body.id || new ObjectId().toString(),
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    
    await db.collection('events').insertOne(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection('events').updateOne(
      { 
        $or: [
          { id: id },
          { _id: ObjectId.isValid(id) ? new ObjectId(id) : null }
        ]
      },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection('events').deleteOne({ 
      $or: [
        { id: id },
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null }
      ]
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Sample data for initial seeding
async function seedDatabase(collection) {
  const sampleEvents = [
    {
      id: '1',
      title: 'Major conflict in Eastern Europe',
      description: 'Heavy fighting reported along border regions with significant casualties and displacement of civilians.',
      location: {
        name: 'Ukraine',
        lat: 49.0,
        lng: 31.0
      },
      type: 'war',
      severity: 3,
      source: 'Global News Network',
      url: 'https://example.com/news/1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Earthquake devastates coastal regions',
      description: 'A 7.2 magnitude earthquake has caused significant damage to infrastructure and resulted in hundreds of casualties.',
      location: {
        name: 'Japan',
        lat: 36.2048,
        lng: 138.2529
      },
      type: 'natural',
      severity: 3,
      source: 'Disaster Relief Monitor',
      url: 'https://example.com/news/2',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Protests spread across capital city',
      description: 'Thousands gather to protest new government policies, with clashes reported between protesters and security forces.',
      location: {
        name: 'France',
        lat: 46.2276,
        lng: 2.2137
      },
      type: 'civil',
      severity: 2,
      source: 'European News Daily',
      url: 'https://example.com/news/3',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Terror attack at public venue',
      description: 'Explosion reported at crowded marketplace with multiple casualties and ongoing security operation.',
      location: {
        name: 'Syria',
        lat: 34.8021,
        lng: 38.9968
      },
      type: 'terrorism',
      severity: 3,
      source: 'Middle East Reports',
      url: 'https://example.com/news/4',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'Political coup attempt fails',
      description: 'Military faction attempted to seize control but was quickly suppressed by loyal government forces.',
      location: {
        name: 'Brazil',
        lat: -14.2350,
        lng: -51.9253
      },
      type: 'political',
      severity: 2,
      source: 'South American Press',
      url: 'https://example.com/news/5',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      title: 'Tropical storm causes flooding',
      description: 'Heavy rainfall and strong winds have led to severe flooding and displacement of coastal communities.',
      location: {
        name: 'Philippines',
        lat: 12.8797,
        lng: 121.7740
      },
      type: 'natural',
      severity: 2,
      source: 'Pacific Weather Watch',
      url: 'https://example.com/news/6',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      title: 'Border skirmish escalates tension',
      description: 'Exchange of fire along disputed border raises concerns about potential wider conflict in the region.',
      location: {
        name: 'India',
        lat: 20.5937,
        lng: 78.9629
      },
      type: 'war',
      severity: 1,
      source: 'Asian Affairs Journal',
      url: 'https://example.com/news/7',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '8',
      title: 'Cyber attack disrupts critical infrastructure',
      description: 'Major systems affected by sophisticated cyber attack, affecting power and communication networks.',
      location: {
        name: 'United States',
        lat: 37.0902,
        lng: -95.7129
      },
      type: 'other',
      severity: 2,
      source: 'Tech Security News',
      url: 'https://example.com/news/8',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  try {
    await collection.insertMany(sampleEvents);
    console.log('Database seeded successfully with sample data');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Start server after connecting to MongoDB
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
