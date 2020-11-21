require('dotenv').config();

const Discord = require('discord.js');
const math = require('mathjs');

const client = new Discord.Client();

const prefix = "h.";

/// Range ASCII:
/// - ALL CHAR (including special char) => 32 s/d 126 (0-94) ---- mod 95 + 32
/// - ALL ALPHABET CAPS => 65 s/d 90 (0-25) ---- mod 26 + 65
/// ex: FRIDAY => PQCFKU (key=[[7,19],[8,3]], mod=26, offset=65)

const mod = 26; 
const offset = 65;
const matrixK = math.matrix([[7,19],[8,3]]); 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length).trim();
    const args = commandBody.split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(command);

    if (command === 'ping') {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

    else if (command === 'server') {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
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

    else if (command === 'prune') {
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
    else if(command === 'en'){

        
        const plainText = args.join(' ');
        let cipherText = '';
        
        let strLen = plainText.length;

        if(strLen % 2 == 1) {
            plainText += '#';
            strLen += 1;
        }

        let matrixP = math.matrix();

        let count = 0;
        for (let i = 0; i < plainText.length/2; i++) {
            for (let j = 0; j < 2; j++) {
                matrixP.subset(math.index(i,j), (plainText[count].charCodeAt(0) - offset) % mod);
                // console.log(`${plainText[count]} : ${plainText[count].charCodeAt(0)} % 26 ${(plainText[count].charCodeAt(0) - 65) % 26}`);
                count++;
            }
        }

        let matrixC = math.multiply(matrixP, matrixK);

        for (let i = 0; i < plainText.length/2; i++) {
            for (let j = 0; j < 2; j++) {
                cipherText += String.fromCharCode((math.subset(matrixC,math.index(i,j)) % mod) + offset); 
            }
        }

        message.channel.send(`\`${cipherText}\``);

    }

});

client.login(process.env.BOT_TOKEN);