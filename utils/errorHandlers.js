// utils/errorHandlers.js
function errorHandler(err, req, res, next) { 
    console.error('Global error handler:', err.message);
    res.status(500).send('Something broke!');
}; 

module.exports = errorHandler;
