const eventService = require('./event.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user._id, req.body);
  sendResponse(res, 201, event, 'Event created');
});

const getEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getEvents(req.query);
  sendResponse(res, 200, result, 'Events retrieved');
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  sendResponse(res, 200, event, 'Event retrieved');
});

const registerForEvent = asyncHandler(async (req, res) => {
  const event = await eventService.registerForEvent(req.user._id, req.params.id);
  sendResponse(res, 200, event, 'Registered for event');
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.user._id, req.body);
  sendResponse(res, 200, event, 'Event updated');
});

module.exports = { createEvent, getEvents, getEvent, registerForEvent, updateEvent };
