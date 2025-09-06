import express from 'express';
const pc = require('picocolors')
// Cross-origin resource sharing: controllare quali domini esterni possono inviare reqs
import cors from 'cors';

import {connectDB} from './src/db/db';

const app = express();
const PORT = 3000;

// Routers
const AirlinesRouter = require('./src/routes/airlines.routes');
const AirplanesRouter = require('./src/routes/airplanes.routes');
const AirportsRouter = require('./src/routes/airports.routes');
const UsersRouter = require('./src/routes/users.routes');
const RoutesRouter = require('./src/routes/routes.routes');
const FlightsRouter = require('./src/routes/flights.routes');
const TicketSRouter = require('./src/routes/tickets.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // per interpretare i dati inviati tramite form HTML

// Routes
app.use("/airlines", AirlinesRouter);
app.use("/airplanes", AirplanesRouter);
app.use("/airports", AirportsRouter);
app.use("/users", UsersRouter);
app.use("/routes", RoutesRouter);
app.use("/flights", FlightsRouter);
app.use("/tickets", TicketSRouter);

app.get("/", (req, res) => {
    return res.send("Server connected");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).send('Something went wrong!'); // Generic message for users
});

// Connect to DB, then start server
connectDB().then(() => {
  app.listen(PORT, function(){
      console.log(pc.green("[Server starts]\n"));
      console.log('Listening on port 3000');
  });
})