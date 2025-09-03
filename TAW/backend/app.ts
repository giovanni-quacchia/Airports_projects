import express from 'express';
// Cross-origin resource sharing: controllare quali domini esterni possono inviare reqs
import cors from 'cors';

import {connectDB} from './src/db/db';
import { getUsers } from './src/models/user';

const app = express();
const PORT = 3000;

const AirlinesRouter = require('./src/routes/airlines.routes');
const AirplanesRouter = require('./src/routes/airplanes.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // per interpretare i dati inviati tramite form HTML

// Routes
app.use("/airlines", AirlinesRouter);
app.use("/airplanes", AirplanesRouter);

app.get("/", (req, res) => {
    return res.send("Server connected");
});


// app.get("/test", (req, res) => {
//   getUsers().then(data => {
//     res.json(data)
//   })
// })

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).send('Something went wrong!'); // Generic message for users
});

// Connect to DB, then start server
connectDB().then(() => {
  app.listen(PORT, function(){
      console.log('Listening on port 3000');
  });
})