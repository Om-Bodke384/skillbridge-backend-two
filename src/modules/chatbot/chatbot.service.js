const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are SkillBot, an AI assistant for the SkillBridge platform — 
a student learning community. Help students with:
- Questions about coding, web development, and tech skills
- How to use SkillBridge features (communities, peer review, hackathons, learning plans)
- Career advice, study tips, and mentorship guidance
Be concise, friendly, and supportive. Keep answers focused and practical.`;

const getChatbotReply = async (message, history = []) => {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const response = await client.chat.completions.create({
    model: 'llama3-8b-8192',   // free model
    max_tokens: 1024,
    messages,
  });

  return response.choices[0].message.content;
};

module.exports = { getChatbotReply };