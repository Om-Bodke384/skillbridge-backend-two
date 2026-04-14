const User = require('../users/user.model');
const Community = require('../community/community.model');
const Hackathon = require('../hackathon/hackathon.model');
const { ApiError } = require('../../common/utils/apiResponse');

const getDashboardStats = async () => {
  const [
    totalUsers, totalCommunities, totalHackathons,
    studentCount, mentorCount, adminCount,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Community.countDocuments(),
    Hackathon.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'mentor' }),
    User.countDocuments({ role: 'admin' }),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt'),
  ]);

  return {
    stats: { totalUsers, totalCommunities, totalHackathons, studentCount, mentorCount, adminCount },
    recentUsers,
  };
};

const getAllUsers = async (page = 1, limit = 20, role, search) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
};

const changeUserRole = async (targetUserId, newRole, adminId) => {
  if (targetUserId.toString() === adminId.toString())
    throw new ApiError(400, 'Cannot change your own role');
  const user = await User.findByIdAndUpdate(targetUserId, { role: newRole }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const toggleUserStatus = async (targetUserId, adminId) => {
  if (targetUserId.toString() === adminId.toString())
    throw new ApiError(400, 'Cannot deactivate yourself');
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

const deleteUser = async (targetUserId, adminId) => {
  if (targetUserId.toString() === adminId.toString())
    throw new ApiError(400, 'Cannot delete yourself');
  const user = await User.findByIdAndDelete(targetUserId);
  if (!user) throw new ApiError(404, 'User not found');
};

const getAllCommunities = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [communities, total] = await Promise.all([
    Community.find().skip(skip).limit(limit).sort({ createdAt: -1 })
      .populate('createdBy', 'name email'),
    Community.countDocuments(),
  ]);
  return { communities, total, page, pages: Math.ceil(total / limit) };
};

const toggleCommunityStatus = async (communityId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ApiError(404, 'Community not found');
  community.isActive = !community.isActive;
  await community.save();
  return community;
};

module.exports = {
  getDashboardStats, getAllUsers, changeUserRole,
  toggleUserStatus, deleteUser, getAllCommunities, toggleCommunityStatus,
};
