const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse, ApiError } = require('../../common/utils/apiResponse');
const Live = require('./live.model');
const crypto = require('crypto');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

// Generate Agora token for a channel
const generateAgoraToken = (channelName, uid, role) => {
  const appId          = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTime = 3600; // 1 hour
  const currentTime    = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTime + expirationTime;

  return RtcTokenBuilder.buildTokenWithUid(
    appId, appCertificate, channelName, uid,
    role, privilegeExpire, privilegeExpire
  );
};

// Mentor/Admin goes live
const goLive = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const channelName = crypto.randomBytes(8).toString('hex'); // unique channel
  const uid = Math.floor(Math.random() * 100000);

  const token = generateAgoraToken(channelName, uid, RtcRole.PUBLISHER);

  const live = await Live.create({
    title,
    hostedBy: req.user._id,
    streamKey: channelName,
    agoraUid: uid,
  });
  await live.populate('hostedBy', 'name avatar role');

  sendResponse(res, 201, {
    live,
    token,
    channelName,
    uid,
    appId: process.env.AGORA_APP_ID,
  }, 'Live session started');
});

// Get all live sessions
const getLiveSessions = asyncHandler(async (req, res) => {
  const sessions = await Live.find({ status: 'live' })
    .populate('hostedBy', 'name avatar role')
    .sort({ startedAt: -1 });
  sendResponse(res, 200, sessions, 'Live sessions fetched');
});

// Student joins and gets viewer token
const joinLive = asyncHandler(async (req, res) => {
  const live = await Live.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { viewers: req.user._id }, $inc: { viewerCount: 1 } },
    { new: true }
  ).populate('hostedBy', 'name avatar role');

  if (!live) throw new ApiError(404, 'Live session not found');

  const uid = Math.floor(Math.random() * 100000);
  const token = generateAgoraToken(live.streamKey, uid, RtcRole.SUBSCRIBER);

  sendResponse(res, 200, {
    live,
    token,
    channelName: live.streamKey,
    uid,
    appId: process.env.AGORA_APP_ID,
  }, 'Joined live session');
});

// End live session
const endLive = asyncHandler(async (req, res) => {
  const live = await Live.findById(req.params.id);
  if (!live) throw new ApiError(404, 'Live session not found');
  if (live.hostedBy.toString() !== req.user._id.toString())
    throw new ApiError(403, 'Only the host can end this session');
  live.status   = 'ended';
  live.endedAt  = new Date();
  await live.save();
  sendResponse(res, 200, live, 'Live session ended');
});

module.exports = { goLive, getLiveSessions, joinLive, endLive };