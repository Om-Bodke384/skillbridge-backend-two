const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    banner: { type: String, default: null },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: false },
    type: { type: String, enum: ['webinar', 'workshop', 'meetup', 'conference', 'bootcamp', 'other'], default: 'webinar' },
    format: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    venue: { type: String, default: null },
    meetingLink: { type: String, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, default: 100 },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    speakers: [
      {
        name: String,
        bio: String,
        avatar: String,
        topic: String,
      },
    ],
    tags: [{ type: String }],
    status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
    recordingUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

// ─── Service ────────────────────────────────────────────────────────────────
const { ApiError } = require('../../common/utils/apiResponse');

const createEvent = async (organizerId, data) => {
  return Event.create({ ...data, organizer: organizerId });
};

const getEvents = async ({ communityId, isGlobal, type, status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (communityId) filter.community = communityId;
  if (isGlobal) filter.isGlobal = true;
  if (type) filter.type = type;
  if (status) filter.status = status;

  const [events, total] = await Promise.all([
    Event.find(filter).skip(skip).limit(limit).sort({ startDate: 1 })
      .populate('organizer', 'name avatar')
      .populate('community', 'name avatar'),
    Event.countDocuments(filter),
  ]);
  return { events, total, page, pages: Math.ceil(total / limit) };
};

const getEventById = async (id) => {
  const event = await Event.findById(id)
    .populate('organizer', 'name avatar role')
    .populate('community', 'name avatar domain')
    .populate('registeredUsers', 'name avatar');
  if (!event) throw new ApiError(404, 'Event not found');
  return event;
};

const registerForEvent = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.registeredUsers.length >= event.capacity) throw new ApiError(400, 'Event is full');
  if (event.registeredUsers.includes(userId)) throw new ApiError(409, 'Already registered');
  event.registeredUsers.push(userId);
  await event.save();
  return event;
};

const updateEvent = async (eventId, organizerId, data) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== organizerId.toString()) throw new ApiError(403, 'Not authorized');
  Object.assign(event, data);
  await event.save();
  return event;
};

module.exports = { Event, createEvent, getEvents, getEventById, registerForEvent, updateEvent };
