const express = require('express');
// Cross-origin resource sharing: controllare quali domini esterni possono inviare reqs
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // per interpretare i dati inviati tramite form HTML

app.get("/", (req, res) => {
    return res.send("Server connected");
});

app.get("/test", (req, res) => {
  
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).send('Something went wrong!'); // Generic message for users
});

app.listen(PORT, function(){
    console.log('Listening on port 3000');
});