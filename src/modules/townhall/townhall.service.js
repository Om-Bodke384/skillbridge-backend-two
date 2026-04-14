const Townhall = require('./townhall.model');
const { ApiError } = require('../../common/utils/apiResponse');

const createTownhall = async (hostId, data) => {
  return Townhall.create({ ...data, hostedBy: hostId, attendees: [hostId] });
};

const getTownhalls = async (communityId, status, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (communityId) filter.community = communityId;
  else filter.isGlobal = true;
  if (status) filter.status = status;

  const [townhalls, total] = await Promise.all([
    Townhall.find(filter).skip(skip).limit(limit).sort({ scheduledAt: 1 })
      .populate('hostedBy', 'name avatar')
      .populate('community', 'name avatar'),
    Townhall.countDocuments(filter),
  ]);
  return { townhalls, total, page, pages: Math.ceil(total / limit) };
};

const getTownhallById = async (id) => {
  const townhall = await Townhall.findById(id)
    .populate('hostedBy', 'name avatar role')
    .populate('attendees', 'name avatar')
    .populate('community', 'name avatar');
  if (!townhall) throw new ApiError(404, 'Townhall not found');
  return townhall;
};

const joinTownhall = async (userId, townhallId) => {
  const townhall = await Townhall.findById(townhallId);
  if (!townhall) throw new ApiError(404, 'Townhall not found');
  if (townhall.attendees.length >= townhall.maxAttendees) throw new ApiError(400, 'Townhall is full');
  if (!townhall.attendees.includes(userId)) townhall.attendees.push(userId);
  await townhall.save();
  return townhall;
};

const updateStatus = async (townhallId, hostId, status) => {
  const townhall = await Townhall.findById(townhallId);
  if (!townhall) throw new ApiError(404, 'Townhall not found');
  if (townhall.hostedBy.toString() !== hostId.toString()) throw new ApiError(403, 'Not authorized');
  townhall.status = status;
  if (status === 'ended') townhall.endedAt = new Date();
  await townhall.save();
  return townhall;
};

const addPoll = async (townhallId, hostId, pollData) => {
  const townhall = await Townhall.findById(townhallId);
  if (!townhall) throw new ApiError(404, 'Townhall not found');
  if (townhall.hostedBy.toString() !== hostId.toString()) throw new ApiError(403, 'Not authorized');
  townhall.polls.push({ ...pollData, options: pollData.options.map((o) => ({ text: o, votes: [] })) });
  await townhall.save();
  return townhall;
};

const votePoll = async (townhallId, pollId, optionIndex, userId) => {
  const townhall = await Townhall.findById(townhallId);
  if (!townhall) throw new ApiError(404, 'Townhall not found');
  const poll = townhall.polls.id(pollId);
  if (!poll || !poll.isActive) throw new ApiError(400, 'Poll not found or inactive');
  poll.options.forEach((o) => { o.votes = o.votes.filter((v) => v.toString() !== userId.toString()); });
  poll.options[optionIndex].votes.push(userId);
  await townhall.save();
  return townhall;
};

module.exports = { createTownhall, getTownhalls, getTownhallById, joinTownhall, updateStatus, addPoll, votePoll };
