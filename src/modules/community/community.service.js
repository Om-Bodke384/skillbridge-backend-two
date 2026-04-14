const Community = require('./community.model');
const User = require('../users/user.model');
const { ApiError } = require('../../common/utils/apiResponse');

const createCommunity = async (creatorId, data) => {
  const community = await Community.create({
    ...data,
    createdBy: creatorId,
    admins: [creatorId],
    members: [creatorId],
    memberCount: 1,
  });
  await User.findByIdAndUpdate(creatorId, { $addToSet: { communities: community._id } });
  return community.populate('createdBy', 'name avatar');
};

const getAllCommunities = async (page = 1, limit = 12, domain, search) => {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };
  if (domain) filter.domain = domain;
  if (search) filter.$text = { $search: search };

  const [communities, total] = await Promise.all([
    Community.find(filter)
      .skip(skip).limit(limit)
      .populate('createdBy', 'name avatar')
      .populate('mentors', 'name avatar')
      .sort({ memberCount: -1, createdAt: -1 }),
    Community.countDocuments(filter),
  ]);
  return { communities, total, page, pages: Math.ceil(total / limit) };
};

const getCommunityById = async (id) => {
  const community = await Community.findById(id)
    .populate('createdBy', 'name avatar role')
    .populate('mentors', 'name avatar role techDomain')
    .populate('admins', 'name avatar role')
    .populate('members', 'name avatar role');
  if (!community) throw new ApiError(404, 'Community not found');
  return community;
};

const joinCommunity = async (userId, communityId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ApiError(404, 'Community not found');
  if (community.members.includes(userId)) throw new ApiError(409, 'Already a member');

  community.members.push(userId);
  community.memberCount = community.members.length;
  await community.save();
  await User.findByIdAndUpdate(userId, { $addToSet: { communities: communityId } });
  return community;
};

const leaveCommunity = async (userId, communityId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ApiError(404, 'Community not found');

  community.members = community.members.filter((m) => m.toString() !== userId.toString());
  community.memberCount = community.members.length;
  await community.save();
  await User.findByIdAndUpdate(userId, { $pull: { communities: communityId } });
};

const updateCommunity = async (communityId, userId, data) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ApiError(404, 'Community not found');

  const isAuthorized =
    community.createdBy.toString() === userId.toString() ||
    community.admins.includes(userId);
  if (!isAuthorized) throw new ApiError(403, 'Not authorized to update this community');

  Object.assign(community, data);
  await community.save();
  return community;
};

const addMentor = async (communityId, adminId, mentorId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ApiError(404, 'Community not found');
  if (!community.admins.includes(adminId)) throw new ApiError(403, 'Not authorized');

  if (!community.mentors.includes(mentorId)) community.mentors.push(mentorId);
  if (!community.members.includes(mentorId)) {
    community.members.push(mentorId);
    community.memberCount++;
  }
  await community.save();
  return community;
};

const getMyCommunities = async (userId) => {
  return Community.find({ members: userId })
    .populate('createdBy', 'name avatar')
    .sort({ updatedAt: -1 });
};

module.exports = {
  createCommunity, getAllCommunities, getCommunityById,
  joinCommunity, leaveCommunity, updateCommunity, addMentor, getMyCommunities,
};
