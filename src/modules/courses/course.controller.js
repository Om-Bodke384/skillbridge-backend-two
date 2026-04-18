const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse, ApiError } = require('../../common/utils/apiResponse');
const Course = require('./course.model');

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, createdBy: req.user._id });
  await course.populate('createdBy', 'name avatar role');
  sendResponse(res, 201, course, 'Course created');
});

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true })
    .populate('createdBy', 'name avatar role')
    .sort({ createdAt: -1 });
  sendResponse(res, 200, courses, 'Courses fetched');
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('createdBy', 'name avatar role');
  if (!course) throw new ApiError(404, 'Course not found');
  sendResponse(res, 200, course, 'Course fetched');
});

const uploadLesson = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No video uploaded');
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.createdBy.toString() !== req.user._id.toString())
    throw new ApiError(403, 'Only course creator can add lessons');

  course.lessons.push({
    title:       req.body.title || 'Lesson',
    description: req.body.description || '',
    videoUrl:    req.file.path,
    order:       course.lessons.length + 1,
  });
  await course.save();
  sendResponse(res, 201, course, 'Lesson added');
});

const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded');
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { thumbnail: req.file.path },
    { new: true }
  );
  sendResponse(res, 200, course, 'Thumbnail updated');
});

const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { enrolledStudents: req.user._id } },
    { new: true }
  );
  if (!course) throw new ApiError(404, 'Course not found');
  sendResponse(res, 200, course, 'Enrolled successfully');
});

const publishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.createdBy.toString() !== req.user._id.toString())
    throw new ApiError(403, 'Only course creator can publish');
  course.isPublished = true;
  await course.save();
  sendResponse(res, 200, course, 'Course published');
});

module.exports = { createCourse, getCourses, getCourse, uploadLesson, uploadThumbnail, enrollCourse, publishCourse };