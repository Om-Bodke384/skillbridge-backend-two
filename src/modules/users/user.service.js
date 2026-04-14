const User = require('./user.model');
const { ApiError } = require('../../common/utils/apiResponse');

const getUserById = async (id) => {
  const user = await User.findById(id).populate('communities', 'name avatar domain');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'bio', 'techDomain', 'skills', 'github', 'linkedin', 'twitter', 'website', 'notificationPreferences'];
  const filteredData = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) filteredData[field] = updateData[field];
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateAvatar = async (userId, avatarUrl) => {
  const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const searchUsers = async (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const filter = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { techDomain: { $regex: query, $options: 'i' } },
    ],
  };
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).select('name email avatar role techDomain bio'),
    User.countDocuments(filter),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
};

const getAllUsers = async (page = 1, limit = 20, role) => {
  const skip = (page - 1) * limit;
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
};

const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

module.exports = { getUserById, updateProfile, updateAvatar, searchUsers, getAllUsers, toggleUserStatus };
