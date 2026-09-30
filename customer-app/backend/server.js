import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

app.use(cors());
app.use(express.json());

// Firebase Setup - checks both standard path and Render's /etc/secrets/ path
const keyPath = fs.existsSync('/etc/secrets/firebase-key.json')
  ? '/etc/secrets/firebase-key.json'
  : './firebase-key.json';

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
console.log('Customer Backend: Connected to Firebase Cloud!');

// Health Check Endpoint (Visit your Render URL to test)
app.get('/', (req, res) => {
  res.send('GD & Associates Customer Backend is running live!');
});

// Socket connection listener
io.on('connection', (socket) => {
  console.log('A client connected via Socket.io');
  
  socket.on('customer_created_booking', (bookingData) => {
    // Broadcast to Admin clients
    io.emit('new_booking_alert', bookingData);
  });
});

// Booking API Endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingPayload = req.body;
    
    // Save to Firestore 'bookings' collection
    const docRef = await db.collection('bookings').add(bookingPayload);
    
    // Return success response with the generated Firestore ID
    res.status(201).json({
      success: true,
      data: { ...bookingPayload, _id: docRef.id }
    });
  } catch (error) {
    console.error("Booking save error:", error);
    res.status(500).json({ success: false, error: 'Failed to save booking' });
  }
});

// Dynamic Port Binding for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Customer Backend running on Port ${PORT} with WebSockets`);
});