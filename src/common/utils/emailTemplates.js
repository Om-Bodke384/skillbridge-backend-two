const getWelcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #2a2a4a; }
    h1 { color: #fff; font-size: 24px; margin-bottom: 16px; }
    p { color: #a0a0b8; line-height: 1.7; margin-bottom: 20px; }
    .btn { display: inline-block; background: #6366f1; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #555; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ SkillBridge</div>
    <div class="card">
      <h1>Welcome aboard, ${name}! 🎉</h1>
      <p>You've joined the fastest-growing tech community platform. Connect with mentors, collaborate on projects, and accelerate your learning journey.</p>
      <p>Here's what you can do:</p>
      <ul style="color:#a0a0b8; line-height: 2;">
        <li>Join or create tech communities</li>
        <li>Participate in hackathons</li>
        <li>Get peer reviews on your projects</li>
        <li>Attend town halls and discussions</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
    </div>
    <div class="footer">SkillBridge Inc. · You're receiving this because you signed up.</div>
  </div>
</body>
</html>`;

const getPasswordResetTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #2a2a4a; }
    h1 { color: #fff; font-size: 24px; margin-bottom: 16px; }
    p { color: #a0a0b8; line-height: 1.7; margin-bottom: 20px; }
    .btn { display: inline-block; background: #ef4444; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .warning { background: #2a1a1a; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; color: #fca5a5; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ SkillBridge</div>
    <div class="card">
      <h1>Reset your password</h1>
      <p>Hi ${name}, we received a request to reset your password. Click the button below to proceed.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <div class="warning">⚠️ This link expires in 15 minutes. If you didn't request this, please ignore this email.</div>
    </div>
  </div>
</body>
</html>`;

const getVerifyEmailTemplate = (name, verifyUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #2a2a4a; }
    h1 { color: #fff; font-size: 24px; }
    p { color: #a0a0b8; line-height: 1.7; }
    .btn { display: inline-block; background: #22c55e; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ SkillBridge</div>
    <div class="card">
      <h1>Verify your email ✉️</h1>
      <p>Hi ${name}, please verify your email address to get full access to SkillBridge.</p>
      <a href="${verifyUrl}" class="btn">Verify Email →</a>
    </div>
  </div>
</body>
</html>`;

const getHackathonInviteTemplate = (name, hackathonName, hackathonUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #2a2a4a; }
    h1 { color: #f59e0b; font-size: 24px; }
    p { color: #a0a0b8; line-height: 1.7; }
    .btn { display: inline-block; background: #f59e0b; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ SkillBridge</div>
    <div class="card">
      <h1>🏆 Hackathon Alert!</h1>
      <p>Hi ${name}, you've been invited to participate in <strong style="color:#f59e0b">${hackathonName}</strong>!</p>
      <p>Build, compete, and win with your community!</p>
      <a href="${hackathonUrl}" class="btn">Join Hackathon →</a>
    </div>
  </div>
</body>
</html>`;

module.exports = {
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
  getHackathonInviteTemplate,
};
