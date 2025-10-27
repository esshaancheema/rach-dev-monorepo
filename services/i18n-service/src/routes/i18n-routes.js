const express = require('express');
const i18nController = require('../controllers/i18n-controller');
const { authenticateAPI, identifyTenant } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.json') || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON and CSV files are allowed.'));
    }
  }
});

// Rate limiting
const translationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many translation requests, please try again later.'
  }
});

const machineTranslationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 machine translation requests per windowMs
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many machine translation requests, please try again later.'
  }
});

// Apply authentication and tenant identification to all routes
router.use(authenticateAPI);
router.use(identifyTenant);

// Translation management routes
router.get('/translations/:language', translationRateLimit, i18nController.getTranslations);
router.get('/translations/:language/:namespace', translationRateLimit, i18nController.getTranslations);
router.get('/translations/:language/:namespace/:key', translationRateLimit, i18nController.getTranslation);

router.put('/translations/:language/:namespace/:key', i18nController.setTranslation);
router.delete('/translations/:language/:namespace/:key', i18nController.deleteTranslation);

// Machine translation routes
router.post('/translate', machineTranslationRateLimit, i18nController.machineTranslate);
router.post('/translate/bulk', machineTranslationRateLimit, i18nController.bulkTranslate);

// Import/Export routes
router.post('/import', upload.single('file'), i18nController.importTranslations);
router.get('/export', i18nController.exportTranslations);

// Utility routes
router.get('/languages', i18nController.getSupportedLanguages);
router.get('/search', translationRateLimit, i18nController.searchTranslations);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'i18n-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;