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
  cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

app.use(cors());
app.use(express.json());

// Firebase Setup - checks Render's secret mount path first, falls back to local
const keyPath = fs.existsSync('/etc/secrets/firebase-key.json')
  ? '/etc/secrets/firebase-key.json'
  : './firebase-key.json';

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
console.log('Admin Backend: Connected to Firebase Cloud!');

// Health check endpoint
app.get('/', (req, res) => {
  res.send('GD & Associates Admin Backend is running live!');
});

io.on('connection', (socket) => {
  socket.on('customer_created_booking', (bookingData) => {
    io.emit('new_booking_alert', bookingData);
  });
});

// GET: Fetch all bookings for the admin dashboard
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const snapshot = await db.collection('bookings').get();
    const allBookings = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
    res.status(200).json(allBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT: Update booking status (e.g., Confirm Advance Paid, Process Return, Clear Dues)
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;

    const docRef = db.collection('bookings').doc(bookingId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Update the document in Firestore
    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.status(200).json({
      success: true,
      data: { ...updatedDoc.data(), _id: updatedDoc.id }
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// Dynamic Port Binding for Render
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => console.log(`Admin Backend running on Port ${PORT}`));