// files.js

const express = require('express');
const router = express.Router(); 
const multer = require('multer'); 
const path = require('path');  
const fileController = require('../controllers/fileController');

// Route to handle deleting a file
router.post('/:filename/delete', fileController.deleteFile);

// Route to render file creation form
router.get('/createForm', fileController.renderCreateForm);

// Route to handle file creation
router.post('/create', fileController.create);

// Route to render file update form
router.get('/:filename/update', fileController.renderUpdateFileForm);

// Route to handle file update
router.post('/:filename/update', fileController.updateFile);

// Route to handle file search
router.get('/search', fileController.searchFiles);

// Route to handle file compression
router.get('/:filename/compress', fileController.compressFile);

// Route to handle file encryption
router.get('/:filename/encrypt', fileController.encryptFile);
router.get('/:filename/decrypt', fileController.decryptFile);

// Multer setup
const upload = multer({ dest: path.join(__dirname, '..', 'temp') });

// Route to handle uploading files
router.get('/uploadForm', fileController.renderUploadForm);
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Route to handle viewing file content
router.get('/:filename', fileController.viewFileContent);

module.exports = router;
