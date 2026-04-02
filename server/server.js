const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('FocusFlow AI Backend Running');
});

// Implementation of routes will go here
// app.use('/api', require('./routes'));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
