const tmi = require('tmi.js');
const frameData = require('./framedata.json');
const { channel, username, password } = require('./settings.json');

const axios = require('axios');

const url = "https://frametality-twitch-bot.onrender.com/users";
let data;
let dataArray = [];

const getAllUsernames = async () => {
  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    data = response.data;

    for (let i = 0; i < data.length; i++) {
      dataArray.push(data[i].username);
    }

    const options = {
      options: { debug: true },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: 'FrametalityFromD7X',
        password
      },
      channels: dataArray
    };

    console.log(options.channels);

    const client = new tmi.Client(options);

    client.on('connected', () => {
      console.log(`Bot connected to ${channel}`);
      client.say('D7X__', `${username} has connected!`);
    });

    // Function to dynamically post the frame data based on the message
    const generateDataFromMsg = (msg, user) => {
      let splitMsg = msg.split('-');
      const character = splitMsg[0].slice(1);
      const btn = splitMsg[1];
      const type = splitMsg[2];
      let stringType;

      if (type === 'ob') {
        stringType = 'of advantage on block.'
      }
      if (type === 'oh') {
        stringType = 'of advantage on hit.'
      }
      if (type === 'ofb') {
        stringType = 'of advantage on flawless block.'
      }
      if (type === 'su') {
        stringType = 'of start up.'
      }

      // Check if character data exists in frameData
      if (frameData[character] && frameData[character][btn] && frameData[character][btn][type]) {
        const message = `@${user.username}, ${character}'s ${btn} is ${frameData[character][btn][type]} frame(s) ${stringType}`;
        client.say('D7X__', message);
      }
    }

    client.on('message', (channel, user, message, self) => {
      if (self) return;

      generateDataFromMsg(message, user);
    });

    client.on('disconnected', (reason) => {
      console.error(`Bot disconnected from ${channel}: ${reason}`);
    });

    client.on('error', (err) => {
      console.error('Error:', err);
    });

    client.connect().catch(console.error);
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

getAllUsernames();
