const express = require('express');
const router = express.Router();
const c = require('./course.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');
const { uploadImage, uploadVideo } = require('../../common/config/cloudinary');

router.get('/',                       protect, c.getCourses);
router.get('/:id',                    protect, c.getCourse);
router.post('/',                      protect, requireAdminOrMentor, c.createCourse);
router.post('/:id/thumbnail',         protect, uploadImage.single('thumbnail'), c.uploadThumbnail);
router.post('/:id/lessons',           protect, uploadVideo.single('video'), c.uploadLesson);
router.post('/:id/enroll',            protect, c.enrollCourse);
router.patch('/:id/publish',          protect, c.publishCourse);

module.exports = router;