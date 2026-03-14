const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getStudyPlans,
    createStudyPlan,
    uploadAndGeneratePlan,
    deleteStudyPlan,
} = require('../controllers/studyController');
const { protect } = require('../middlewares/authMiddleware');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|txt|md/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only PDFs and text files are allowed!');
        }
    }
});

router.route('/').get(protect, getStudyPlans).post(protect, createStudyPlan);
router.route('/upload').post(protect, upload.single('file'), uploadAndGeneratePlan);
router.route('/:id').delete(protect, deleteStudyPlan);

module.exports = router;
