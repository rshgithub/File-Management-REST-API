// fileController.js

const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver"); // For File Compression
const crypto = require("crypto");

// Render create file form
const renderCreateForm = async (req, res, next) => {
  try {
    res.render("create");
  } catch (err) {
    next(err);
  }
};

// Create a new file
const create = async (req, res, next) => {
  const { filename, content } = req.body;
  const filePath = path.join(__dirname, "..", "data", filename);

  try {
    // Ensure the directory exists
    await fs.ensureDir(path.join(__dirname, "..", "data"));
    await fs.writeFile(filePath, content);
    res.redirect("/");
  } catch (err) {
    console.error("Error creating file:", err);
    next(err);
  }
};

// View file content
const viewFileContent = async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "data", filename);

  try {
    const data = await fs.readFile(filePath, "utf8");
    res.render("detail", { filename, content: data });
  } catch (err) {
    console.error("Error reading file:", err);
    next(err);
  }
};

// Delete file
const deleteFile = async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "data", filename);

  try {
    await fs.unlink(filePath);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting file:", err);
    next(err);
  }
};

// Render update file form
const getUpdateFileForm = async (req, res, next) => {
  const { filename } = req.params;
  try {
    res.render("update", { filename });
  } catch (err) {
    next(err);
  }
};

// Update file
const updateFile = async (req, res, next) => {
  const oldFilename = req.params.filename;
  const { newFilename, content } = req.body;
  const dataDir = path.join(__dirname, "..", "data");
  const oldFilePath = path.join(dataDir, oldFilename);
  const newFilePath = path.join(dataDir, newFilename);

  try {
    // Rename the file
    await fs.promises.rename(oldFilePath, newFilePath);

    // Update the content of the new file
    await fs.promises.writeFile(newFilePath, content, "utf8");

    // Redirect to the main page after successful update
    res.redirect("/");
  } catch (err) {
    console.error("Error updating filename or content:", err);
    res.status(500).send("Error updating file");
    next(err);
  }
};

// Function to list files in the data directory
const listFiles = async () => {
  const dataDir = path.join(__dirname, "..", "data");
  try {
    const files = await fs.readdir(dataDir);
    return files;
  } catch (err) {
    console.error("Error listing files:", err);
    throw err;
  }
};

// Search files by name or metadata
const searchFiles = async (req, res, next) => {
  const { query } = req.query; // Assuming query parameter contains search query
  try {
    const files = await listFiles(); // Get list of all files
    const filteredFiles = files.filter(file => file.includes(query)); // Simple name-based search
    res.render("index", { files: filteredFiles });
  } catch (err) {
    console.error("Error searching files:", err);
    next(err);
  }
};

// Function to compress files using archiver
const compressFile = async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "data", filename);
  const output = fs.createWriteStream(`${filePath}.zip`);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Set compression level
  });

  try {
    archive.pipe(output);
    archive.file(filePath, { name: filename }); // Add file to archive
    await archive.finalize();
    res.download(`${filePath}.zip`); // Download compressed file
  } catch (err) {
    console.error("Error compressing file:", err);
    next(err);
  }
};

// Function to encrypt file content
const encryptFile = async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "data", filename);

  try {
    const data = await fs.readFile(filePath, "utf8");
    const key = crypto.randomBytes(32); 
    const iv = crypto.randomBytes(16); // الـ IV هو قيمة عشوائية تُستخدم في بداية عملية التشفير للتأكد من توليد نتائج مشفرة مختلفة حتى لو كان المحتوى المشفر متطابقًا.
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Store encrypted data back to file
    await fs.writeFile(`${filePath}.enc`, encrypted);

    res.download(`${filePath}.enc`); // Download encrypted file
  } catch (err) {
    console.error("Error encrypting file:", err);
    next(err);
  }
};

// Decrypt file
const decryptFile = async (req, res, next) => {
    const { filename } = req.params;
    const encryptedFilePath = path.join(__dirname, '..', 'data', filename);
    const decryptedFilePath = path.join(__dirname, '..', 'data', 'decrypted_' + filename);

    // Retrieve decryption key and IV from environment variables
    const decryptionKey = process.env.DECRYPTION_KEY;
    const decryptionIVHex = process.env.DECRYPTION_IV_HEX;
    const decryptionIV = Buffer.from(decryptionIVHex, 'hex');

    try {
        const encryptedData = await fs.readFile(encryptedFilePath);
        const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, decryptionIV);

        let decrypted = decipher.update(encryptedData, 'binary', 'utf8');
        decrypted += decipher.final('utf8');

        await fs.writeFile(decryptedFilePath, decrypted, 'utf8');
        res.download(decryptedFilePath); // Example: send decrypted file for download

    } catch (err) {
        console.error('Error decrypting file:', err);
        next(err);
    }
};

module.exports = {
  renderCreateForm,
  create,
  viewFileContent,
  deleteFile,
  getUpdateFileForm,
  updateFile,
  searchFiles,
  compressFile,
  encryptFile,
  decryptFile,
};
