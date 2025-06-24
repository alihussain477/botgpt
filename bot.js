// 📁 File: bot.js
// 💬 Messenger Super Bot: Auto Locker + AI Reply + Commands

const fs = require('fs');
const login = require('ws3-fca');

// 🔐 Load original group info
const groupData = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const originalName = groupData.groupName;
const originalDesc = groupData.groupDesc;
const originalImage = groupData.groupImage;
const groupID = groupData.groupID;

// 🤖 Bot Name
let BOT_NAME = groupData.botName || "RAAJ BOT";

// 📦 Login with token
login({ appState: JSON.parse(fs.readFileSync('token.json', 'utf8')) }, (err, api) => {
  if (err) return console.error('Login failed:', err);
  console.log(`[✅] Logged in as ${BOT_NAME}`);

  api.setOptions({ listenEvents: true });

  const listen = api.listenMqtt(async (err, event) => {
    if (err) return console.error(err);

    // 🎯 Only listen to the target group
    if (event.threadID !== groupID) return;

    if (event.type === 'event') {
      // 🔁 Auto-Revert Group Changes
      if (event.logMessageType === 'log:thread-name') {
        api.setTitle(originalName, groupID);
        console.log(`[🔒] Group name reverted to: ${originalName}`);
      }
      if (event.logMessageType === 'log:thread-image') {
        api.changeGroupImage(fs.createReadStream(originalImage), groupID);
        console.log(`[🔒] Group photo reverted.`);
      }
    }

    // 💬 Message Event
    if (event.type === 'message') {
      const message = event.body.toLowerCase();
      const senderID = event.senderID;

      // ⚙️ Command System
      if (message.startsWith('!')) {
        if (message === '!joke') {
          api.sendMessage('😂 एक जोक सुन: ChatGPT और Google मिले, ChatGPT बोला: मैं तो तेरा बाप हूँ!', groupID);
        } else if (message.startsWith('!setname')) {
          const newName = message.split(' ')[1];
          BOT_NAME = newName.toUpperCase();
          api.sendMessage(`✅ Bot का नाम अब ${BOT_NAME} हो गया।`, groupID);
        } else if (message === '!help') {
          api.sendMessage(`🤖 ${BOT_NAME} Commands:\n!joke - मजेदार जोक\n!setname NAME - बोट का नाम बदलो\n!help - कमांड लिस्ट`, groupID);
        }
      } else {
        // 🤖 Simple AI Auto Reply (basic)
        if (message.includes('hello') || message.includes('hi')) {
          api.sendMessage(`🙏 नमस्ते! मैं ${BOT_NAME} हूँ, आपकी सेवा में हाज़िर!`, groupID);
        } else if (message.includes('kaise ho')) {
          api.sendMessage(`😊 मैं अच्छा हूँ, आप कैसे हो?`, groupID);
        } else if (message.includes('bye')) {
          api.sendMessage(`👋 अलविदा! फिर मिलेंगे!`, groupID);
        }
      }
    }
  });
});
