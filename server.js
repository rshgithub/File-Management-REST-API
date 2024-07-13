const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index.js');
const filesRouter = require('./routes/files.js');
const errorHandler = require('./utils/errorHandlers.js'); // Adjust the path if necessary

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/', indexRouter);  
app.use('/files', filesRouter);  

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
