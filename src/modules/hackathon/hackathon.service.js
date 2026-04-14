const Hackathon = require('./hackathon.model');
const Community = require('../community/community.model');
const User = require('../users/user.model');
const { ApiError } = require('../../common/utils/apiResponse');
const { sendEmail } = require('../../common/config/email');
const { getHackathonInviteTemplate } = require('../../common/utils/emailTemplates');
const logger = require('../../common/utils/logger');

const createHackathon = async (organizerId, data) => {
  const hackathon = await Hackathon.create({ ...data, organizer: organizerId });

  if (data.sendInviteEmails) {
    let usersToNotify = [];
    if (data.community) {
      const community = await Community.findById(data.community).populate('members', 'email name notificationPreferences');
      usersToNotify = community?.members.filter((m) => m.notificationPreferences?.hackathon) || [];
    } else if (data.isGlobal) {
      usersToNotify = await User.find({ 'notificationPreferences.hackathon': true }).select('email name');
    }

    const hackathonUrl = `${process.env.CLIENT_URL}/hackathons/${hackathon._id}`;
    for (const user of usersToNotify.slice(0, 100)) {
      sendEmail({
        to: user.email,
        subject: `🏆 New Hackathon: ${hackathon.title}`,
        html: getHackathonInviteTemplate(user.name, hackathon.title, hackathonUrl),
      }).catch((err) => logger.error('Hackathon invite email failed:', err));
    }
  }

  return hackathon.populate('organizer', 'name avatar');
};

const getHackathons = async ({ communityId, isGlobal, status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (communityId) filter.community = communityId;
  if (isGlobal) filter.isGlobal = true;
  if (status) filter.status = status;

  const [hackathons, total] = await Promise.all([
    Hackathon.find(filter).skip(skip).limit(limit).sort({ startDate: 1 })
      .populate('organizer', 'name avatar')
      .populate('community', 'name avatar'),
    Hackathon.countDocuments(filter),
  ]);
  return { hackathons, total, page, pages: Math.ceil(total / limit) };
};

const getHackathonById = async (id) => {
  const hackathon = await Hackathon.findById(id)
    .populate('organizer', 'name avatar role')
    .populate('community', 'name avatar domain')
    .populate('judges', 'name avatar')
    .populate('registeredUsers', 'name avatar')
    .populate('teams.members', 'name avatar');
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  return hackathon;
};

const registerForHackathon = async (userId, hackathonId) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (!['upcoming', 'registration'].includes(hackathon.status))
    throw new ApiError(400, 'Registration is closed');
  if (hackathon.registeredUsers.includes(userId))
    throw new ApiError(409, 'Already registered');

  hackathon.registeredUsers.push(userId);
  await hackathon.save();
  return hackathon;
};

const createTeam = async (hackathonId, leaderId, teamData) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (!hackathon.registeredUsers.includes(leaderId))
    throw new ApiError(403, 'You must register first');

  const team = {
    name: teamData.name,
    members: [leaderId, ...(teamData.members || [])],
  };
  if (team.members.length > hackathon.maxTeamSize)
    throw new ApiError(400, `Team cannot exceed ${hackathon.maxTeamSize} members`);

  hackathon.teams.push(team);
  await hackathon.save();
  return hackathon;
};

const submitProject = async (hackathonId, userId, submissionData) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (hackathon.status !== 'active') throw new ApiError(400, 'Hackathon is not active');

  const team = hackathon.teams.find((t) =>
    t.members.map((m) => m.toString()).includes(userId.toString())
  );
  if (!team) throw new ApiError(403, 'You are not in a team for this hackathon');

  team.projectLink = submissionData.projectLink;
  team.projectTitle = submissionData.projectTitle;
  team.projectDescription = submissionData.projectDescription;
  team.submittedAt = new Date();
  await hackathon.save();
  return hackathon;
};

const updateStatus = async (hackathonId, organizerId, status) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new ApiError(404, 'Hackathon not found');
  if (hackathon.organizer.toString() !== organizerId.toString())
    throw new ApiError(403, 'Not authorized');
  hackathon.status = status;
  await hackathon.save();
  return hackathon;
};

module.exports = {
  createHackathon, getHackathons, getHackathonById,
  registerForHackathon, createTeam, submitProject, updateStatus,
};
