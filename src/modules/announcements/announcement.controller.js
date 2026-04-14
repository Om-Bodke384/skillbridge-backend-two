const announcementService = require('./announcement.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createAnnouncement = asyncHandler(async (req, res) => {
  const a = await announcementService.createAnnouncement(req.user._id, req.body);
  sendResponse(res, 201, a, 'Announcement created');
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const result = await announcementService.getAnnouncements(req.query);
  sendResponse(res, 200, result, 'Announcements retrieved');
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const a = await announcementService.getAnnouncementById(req.params.id);
  sendResponse(res, 200, a, 'Announcement retrieved');
});

const markAsRead = asyncHandler(async (req, res) => {
  await announcementService.markAsRead(req.params.id, req.user._id);
  sendResponse(res, 200, null, 'Marked as read');
});

const togglePin = asyncHandler(async (req, res) => {
  const a = await announcementService.togglePin(req.params.id, req.user._id);
  sendResponse(res, 200, a, 'Pin status updated');
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id, req.user._id);
  sendResponse(res, 200, null, 'Announcement deleted');
});

module.exports = { createAnnouncement, getAnnouncements, getAnnouncement, markAsRead, togglePin, deleteAnnouncement };
