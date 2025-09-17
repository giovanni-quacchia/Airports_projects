import express from 'express';
const pc = require('picocolors')
// Cross-origin resource sharing: controllare quali domini esterni possono inviare reqs
import cors from 'cors';

import {connectDB} from './src/db/db';
import morgan from 'morgan';

const app = express();
const PORT = Number(process.env.PORT) || 3000;;

// Routers
const AirlinesRouter = require('./src/routes/airlines.routes');
const AirplanesRouter = require('./src/routes/airplanes.routes');
const AirportsRouter = require('./src/routes/airports.routes');
const UsersRouter = require('./src/routes/users.routes');
const RoutesRouter = require('./src/routes/routes.routes');
const FlightsRouter = require('./src/routes/flights.routes');
const ItinerariesRouter = require('./src/routes/itineraries.routes');
const TicketSRouter = require('./src/routes/tickets.routes');
const PassengersRouter = require('./src/routes/passengers.routes');
const PurchasesRouter = require('./src/routes/purchases.routes');

// Manage JWT
const auth = require('./src/utils/auth.utils')

// Middleware
app.use(cors({
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // per interpretare i dati inviati tramite form HTML
app.use(morgan('dev'));

// Routes
app.use("/api/airlines", AirlinesRouter);
app.use("/api/airplanes", AirplanesRouter);
app.use("/api/airports", AirportsRouter);
app.use("/api/users", UsersRouter);
app.use("/api/routes", RoutesRouter);
app.use("/api/flights", FlightsRouter);
app.use("/api/itineraries", ItinerariesRouter);
app.use("/api/tickets", TicketSRouter);
app.use("/api/passengers", PassengersRouter);
app.use("/api/purchases", PurchasesRouter);

app.get('/api/health', (_req,res)=> res.json({ ok:true }));

// Global Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
});

// Connect to DB, then start server
connectDB().then(() => {
  auth.generateSecret();
  app.listen(PORT, function(){
      console.log(pc.green("[Server starts]\n"));
      console.log(`Listening on port ${PORT}`);
  });
})