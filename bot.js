require('dotenv').config();

const Discord = require('discord.js');
const math = require('mathjs');

const client = new Discord.Client();

const prefix = "h.";

/// Range ASCII:
/// - ALL CHAR (including special char) => 32 s/d 126 (0-94) ---- mod 95 + 32
/// - ALL ALPHABET CAPS => 65 s/d 90 (0-25) ---- mod 26 + 65
/// ex: FRIDAY => PQCFKU (key=[[7,19],[8,3]], mod=26, offset=65)

const mod = 95;
const offset = 32;
const matrixK =
  math.matrix([[7, 19], [8, 3]]);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length).trim();
  const args = commandBody.split(/ +/);
  const command = args.shift().toLowerCase();

  console.log(command);

  const isDM = message.guild === null;

  if (command === 'ping') {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  }

  else if (command === 'server') {
    if (isDM) {
      message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
    } else {
      message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    }
  }

  else if (command === 'help') {
    const embedMessage = {
      color: 0x0099ff,
      title: `Help Command`,
      description: `
      Current commands list:

      - \`help\` - Show all commands
      - \`ping\` - Ping!
      - \`server\` - Show server info

      - \`prune\` - Bulk delete messages
        Usage : \`prune <number of message>\`

      - \`en\` - Encrypt Message
        Usage : \`en [$<4 letter of key>] <message>\`
        
        - \`dec\` - Decrypt Message
        Usage : \`dec [$<4 letter of key>] <message>\`
      
      Use prefix \`h.\`!
      Paremeter in \`[param]\` is optional
      Parameter in \`<param>\` is required
      `,
      thumbnail: {
        url: 'https://image.flaticon.com/icons/png/512/1995/1995719.png',
      },
      timestamp: new Date(),
      footer: {
        text: 'by Hillsbot',
      },
    };

    message.channel.send({ embed: embedMessage });
  }

  else if (command === 'avatar') {
    if (!message.mentions.users.size) {
      return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
    }

    const avatarList = message.mentions.users.map(user => {
      return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
    });

    // by default, discord.js will `.join()` the array with `\n`
    // send the entire array of strings as a message
    message.channel.send(avatarList);
  }

  else if (command === 'prune' && !isDM) {
    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      return message.reply('that doesn\'t seem to be a valid number.');
    } else if (amount <= 1 || amount > 100) {
      return message.reply('you need to input a number between 1 and 99.');
    }

    message.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      message.channel.send('there was an error trying to prune messages in this channel!');
    });
  }

  // encrypt message
  else if (command === 'en') {
    let plainText = args.join(' ');
    let cipherText = '';

    let strLen = plainText.length;

    let localK;

    if (plainText[0] === '$') {
      let count = 0;
      let argsTemp = plainText.split(/ +/);
      let keyString = argsTemp.shift().toLowerCase();
      plainText = argsTemp.join(' ');

      keyString += 'KEYK'; //handle (keyString.length < 4)

      localK = math.matrix();

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          localK.subset(math.index(i, j), (keyString[count].charCodeAt(0) - offset) % mod);
          count++;
        }
      }
      console.log(localK);
    }

    if (strLen % 2 == 1) {
      plainText += '#';
      strLen += 1;
    }

    let matrixP = math.matrix();

    let count = 0;
    for (let i = 0; i < plainText.length / 2; i++) {
      for (let j = 0; j < 2; j++) {
        matrixP.subset(math.index(i, j), (plainText[count].charCodeAt(0) - offset) % mod);
        // console.log(`${plainText[count]} : ${plainText[count].charCodeAt(0)} % 26 ${(plainText[count].charCodeAt(0) - 65) % 26}`);
        count++;
      }
    }

    let matrixC;

    if (localK) {
      matrixC = math.multiply(matrixP, localK);
    } else {
      matrixC = math.multiply(matrixP, matrixK);
    }

    for (let i = 0; i < plainText.length / 2; i++) {
      for (let j = 0; j < 2; j++) {
        cipherText += String.fromCharCode((math.subset(matrixC, math.index(i, j)) % mod) + offset);
      }
    }

    const embedMessage = {
      color: 0x0099ff,
      title: 'Encrypted Message',
      author: {
        name: `${message.author.tag}`,
        icon_url: `${message.author.displayAvatarURL({ format: "png", dynamic: true })}`,
      },
      description: `\`\`\`${cipherText}\`\`\``,
      timestamp: new Date(),
      footer: {
        text: 'by Hillsbot',
        icon_url: 'https://image.flaticon.com/icons/png/512/1995/1995719.png',
      },
    };

    message.channel.send({ embed: embedMessage });

    if (!isDM) {
      message.channel.bulkDelete(1, true).catch(err => {
        console.error(err);
      });
    }
  }

  else if (command === 'dec') {
    let plainText = '';

    let cipherText = args.join(' ');

    let strLen = cipherText.length;

    if (strLen % 2 == 1) {
      cipherText += '#';
      strLen += 1;
    }

    let localK;

    if (cipherText[0] === '$') {
      let count = 0;
      let argsTemp = cipherText.split(/ +/);
      let keyString = argsTemp.shift().toLowerCase();
      cipherText = argsTemp.join(' ');

      keyString += 'KEYK'; //handle (keyString.length < 4)

      localK = math.matrix();

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          localK.subset(math.index(i, j), (keyString[count].charCodeAt(0) - offset) % mod);
          count++;
        }
      }
      console.log(localK);
    }

    let invK;

    if (localK) {
      invK = getMatrixInverse(localK);
    } else {
      invK = getMatrixInverse(matrixK);
    }

    let matrixC = math.matrix();

    let count = 0;
    for (let i = 0; i < cipherText.length / 2; i++) {
      for (let j = 0; j < 2; j++) {
        matrixC.subset(math.index(i, j), (cipherText[count].charCodeAt(0) - offset) % mod);
        count++;
      }
    }

    let matrixP = math.multiply(matrixC, invK);

    for (let i = 0; i < cipherText.length / 2; i++) {
      for (let j = 0; j < 2; j++) {

        plainText += String.fromCharCode((math.subset(matrixP, math.index(i, j)) % mod) + offset);
      }
    }

    if (plainText[plainText.length - 1] == '#') {
      plainText = plainText.substr(0, plainText.length - 1);
    }

    const embedMessage = {
      color: 0xDE190F,
      title: 'Decrypted Message',
      author: {
        name: `${message.author.tag}`,
        icon_url: `${message.author.displayAvatarURL({ format: "png", dynamic: true })}`,
      },
      description: `\`\`\`${plainText}\`\`\``,
      timestamp: new Date(),
      footer: {
        text: 'by Hillsbot',
        icon_url: 'https://image.flaticon.com/icons/png/512/1995/1995719.png',
      },
    };

    message.channel.send({ embed: embedMessage });

    if (!isDM) {
      message.channel.bulkDelete(1, true).catch(err => {
        console.error(err);
      });
    }
  }

  //TODO
  //![X] storing text with embed (usage ex: storing pass)
  //![X] able to set their own key
  //![X] create a list of command + usage example

  //for testing purposes
  else if (command === 'gcd') {
    const a = parseInt(args[0]);
    const b = parseInt(args[1]);

    const result = gcd(a, b);

    message.channel.send(`HASIL: \`${result}\``);
  }

  else if (command === 'inv') {
    const a = parseInt(args[0]);
    const b = parseInt(args[1]);

    const result = invMod(a, b);

    message.channel.send(`HASIL: \`${result}\``);
  }

});

function getMatrixInverse(a) {

  var key = a;
  var tempKey = math.matrix();

  tempKey.subset(math.index(0, 0), a.subset(math.index(1, 1)));
  tempKey.subset(math.index(1, 1), a.subset(math.index(0, 0)))
  tempKey.subset(math.index(0, 1), a.subset(math.index(0, 1)) * -1);
  tempKey.subset(math.index(1, 0), a.subset(math.index(1, 0)) * -1);

  var det = math.det(key);
  var detInv = 0;
  var flag = 0;

  for (let i = 0; i < mod; i++) {

    flag = math.mod((det * i), mod);

    if (flag == 1) {
      detInv = i;
    }
  }

  var invKey = math.matrix();

  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      if (tempKey.subset(math.index(i, j)) < 0) {
        var tempNum = tempKey.subset(math.index(i, j)) * detInv;
        var tempN = math.mod(tempNum, mod);
        invKey.subset(math.index(i, j), tempN);
      }
      else {
        invKey.subset(math.index(i, j), tempKey.subset(math.index(i, j)) * detInv % mod);
      }
    }

  return invKey;
}

function gcd(a, b) {
  if (b < a) {
    [a, b] = [b, a];
  }
  do {
    var temp = a % b;
    a = b;
    b = temp;
  }
  while (b != 0);

  return (a == 1);
}

function invMod(m, n) {
  var t0 = 0;
  var t1 = 1;
  var invers;
  var q;
  var r = 0;
  var b = m;

  while (r != 1) {
    q = math.floor(m / n);
    r = m % n;
    invers = t0 - q * t1;

    if (invers < 0) {
      invers = b - (math.abs(invers) % b);
    }
    else {
      invers %= b;
    }

    t0 = t1;
    t1 = invers;
    m = n;
    n = r;
  }

  return invers;
}


client.login(process.env.BOT_TOKEN); 