const Announcement = require('./announcement.model');
const { ApiError } = require('../../common/utils/apiResponse');

const createAnnouncement = async (authorId, data) => {
  return (await Announcement.create({ ...data, author: authorId })).populate('author', 'name avatar role');
};

const getAnnouncements = async ({ communityId, isGlobal, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = { $or: [] };
  if (communityId) filter.$or.push({ community: communityId });
  if (isGlobal || !communityId) filter.$or.push({ isGlobal: true });
  if (!filter.$or.length) delete filter.$or;

  const now = new Date();
  filter.$or = filter.$or || [{}];
  const finalFilter = { ...filter, $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }] };
  if (filter.$or) finalFilter.$or = filter.$or;

  const [announcements, total] = await Promise.all([
    Announcement.find({ ...(!communityId ? { isGlobal: true } : {}), ...(communityId ? { community: communityId } : {}) })
      .skip(skip).limit(limit)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('author', 'name avatar role'),
    Announcement.countDocuments(communityId ? { community: communityId } : { isGlobal: true }),
  ]);
  return { announcements, total, page, pages: Math.ceil(total / limit) };
};

const getAnnouncementById = async (id) => {
  const a = await Announcement.findById(id).populate('author', 'name avatar role');
  if (!a) throw new ApiError(404, 'Announcement not found');
  return a;
};

const markAsRead = async (announcementId, userId) => {
  await Announcement.findByIdAndUpdate(announcementId, { $addToSet: { readBy: userId } });
};

const togglePin = async (announcementId, userId) => {
  const a = await Announcement.findById(announcementId).populate('author', 'name avatar');
  if (!a) throw new ApiError(404, 'Announcement not found');
  if (a.author._id.toString() !== userId.toString()) throw new ApiError(403, 'Not authorized');
  a.isPinned = !a.isPinned;
  await a.save();
  return a;
};

const deleteAnnouncement = async (announcementId, userId) => {
  const a = await Announcement.findById(announcementId);
  if (!a) throw new ApiError(404, 'Announcement not found');
  if (a.author.toString() !== userId.toString()) throw new ApiError(403, 'Not authorized');
  await a.deleteOne();
};

module.exports = { createAnnouncement, getAnnouncements, getAnnouncementById, markAsRead, togglePin, deleteAnnouncement };
