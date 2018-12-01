const Discord = require('discord.js');

const Util = require('discord.js');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const YouTube = require('simple-youtube-api');

const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

const queue = new Map();

const ytdl = require('ytdl-core');

const fs = require('fs');

const gif = require("gif-search");

const client = new Discord.Client({disableEveryone: true});

const prefix = "$";
/////////////////////////
////////////////////////

client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `ping`) {
    let embed = new Discord.RichEmbed()
    .setColor(3447003)
    .setTitle("Pong!!")
    .setDescription(`${client.ping} ms,`)
    .setFooter(`Requested by | ${msg.author.tag}`);
    msg.delete().catch(O_o=>{})
    msg.channel.send(embed);
    }
});
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `avatar`){
	if(msg.channel.type === 'dm') return msg.channel.send("Nope Nope!! u can't use avatar command in DMs (:")
        let mentions = msg.mentions.members.first()
        if(!mentions) {
          let sicon = msg.author.avatarURL
          let embed = new Discord.RichEmbed()
          .setImage(msg.author.avatarURL)
          .setColor("#5074b3")
          msg.channel.send({embed})
        } else {
          let sicon = mentions.user.avatarURL
          let embed = new Discord.RichEmbed()
          .setColor("#5074b3")
          .setImage(sicon)
          msg.channel.send({embed})
        }
    };
});
/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////

/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg => { 
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
    
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
        
        if (!voiceChannel) return msg.channel.send("انت لم تدخل روم صوتي");
        
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        
        if (!permissions.has('CONNECT')) {

			return msg.channel.send("ليست لدي صلاحيات للدخول الى الروم");
        }
        
		if (!permissions.has('SPEAK')) {

			return msg.channel.send("انا لا يمكنني التكلم في هاذه الروم");
		}

		if (!permissions.has('EMBED_LINKS')) {

			return msg.channel.sendMessage("انا لا املك صلاحيات ارسال روابط")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            

			for (const video of Object.values(videos)) {
                
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
            }
			return msg.channel.send(`**${playlist.title}**, Just added to the queue!`);
		} else {

			try {

                var video = await youtube.getVideo(url);
                
			} catch (error) {
				try {

					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
                    const embed1 = new Discord.RichEmbed()
                    .setTitle(":mag_right:  YouTube Search Results :")
                    .setDescription(`
                    ${videos.map(video2 => `${++index}. **${video2.title}**`).join('\n')}`)
                    
					.setColor("#f7abab")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
/////////////////					
					try {

						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('لم يتم اختيار الاغنية');
                    }
                    
					const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                    
				} catch (err) {

					console.error(err);
					return msg.channel.send("I didn't find any results!");
				}
			}

            return handleVideo(video, msg, voiceChannel);
            
        }
        
	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
        if (!serverQueue) return msg.channel.send("ليست هناك اغاني ليتم التخطي");

		serverQueue.connection.dispatcher.end('تم تخطي الاغنية');
        return undefined;
        
	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
        if (!serverQueue) return msg.channel.send("There is no Queue to stop!!");
        
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('تم ايقاف الاغنية لقد خرجت من الروم الصوتي');
        return undefined;
        
	} else if (command === `vol`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
		if (!serverQueue) return msg.channel.send('يعمل الامر فقط عند تشغيل مقطع صوتي');
        if (!args[1]) return msg.channel.send(`لقد تم تغير درجة الصوت الى**${serverQueue.volume}**`);
        
		serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
        
        return msg.channel.send(`درجة الصوت الان**${args[1]}**`);

	} else if (command === `np`) {

		if (!serverQueue) return msg.channel.send('There is no Queue!');
		const embedNP = new Discord.RichEmbed()
	    .setDescription(`Now playing **${serverQueue.songs[0].title}**`)
        return msg.channel.sendEmbed(embedNP);
        
	} else if (command === `queue`) {
		
		if (!serverQueue) return msg.channel.send('There is no Queue!!');
		let index = 0;
//	//	//
		const embedqu = new Discord.RichEmbed()
        .setTitle("The Queue Songs :")
        .setDescription(`
        ${serverQueue.songs.map(song => `${++index}. **${song.title}**`).join('\n')}
**Now playing :** **${serverQueue.songs[0].title}**`)
        .setColor("#f7abab")
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('تم الايقاف');
		}
		return msg.channel.send('في انتظار تشغيل المقطع');
	} else if (command === "resume") {

		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
            return msg.channel.send('تم التشغيل');
            
		}
		return msg.channel.send('Queue is empty!');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}!`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Can't join this channel: ${error}!`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`**${song.title}**, تمت اضافة المقطع الى قائمة الانتظار `);
	} 
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`**${song.title}**, is now playing!`);
}


client.on('message', message => {
    if (message.content === 'help') {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('**أوامر الميوزك...**')
        .setDescription('**برفكس البوت (!)**')
        .addField('play', 'لتشغيل اغنية')
        .addField('join', 'دخول رومك الصوتي')
        .addField('disconnect', 'الخروج من رومك الصوتي')
        .addField('skip', 'تخطي الأغنية')
        .addField('pause', 'ايقاف الاغنية مؤقتا')
        .addField('resume', 'تكملة الاغنية')
        .addField('queue', 'اظهار قائمة التشغيل')
        .addField('np', 'اظهار الاغنية اللي انت مشغلها حاليا')
        .setFooter('(general_commands) لاظهار الاوامر العامة')
      message.channel.send(helpEmbed);
    }
});

client.on('message', message => {
    if (message.content === 'general_commands') {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('**أوامر عامة...**')
        .addField('avatar', "افاتار الشخص المطلوب")
        .addField('gif', 'البحث عن جيف انت تطلبه')
        .addField('ping', 'معرفة ping البوت')
        .setFooter('المزيد قريبا ان شاء الله!')
      message.channel.send(helpEmbed);
    }
});

client.on('ready', () => {
   console.log(`----------------`);
      console.log(`Desert Bot- Script By : EX Clan`);
        console.log(`----------------`);
      console.log(`ON ${client.guilds.size} Servers '     Script By : EX Clan ' `);
    console.log(`----------------`);
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setGame(`$play | Last Music`,"http://twitch.tv/Death Shop")
client.user.setStatus("dnd")
});


client.on('ready', () => {
  console.log('---------------');
  console.log(' Bot Is Online')
  console.log('---------------')
});
client.on('message', message => {
   let embed = new Discord.RichEmbed()

    let args = message.content.split(' ').slice(1).join(' ');
     if(!message.channel.guild) return;
if(message.content.split(' ')[0] == '*bc') {
         message.react("✔️")
          let embed = new Discord.RichEmbed()
    .setColor("#FF00FF")
    .setThumbnail(message.author.avatarURL)   
                                      .addField('تم الارسال بواسطة :', "<@" + message.author.id + ">")
                 message.channel.sendEmbed(embed);
        message.guild.members.forEach(m => {
            var bc = new Discord.RichEmbed()
.addField('**● Sender  :**', `*** → ${message.author.username}#${message.author.discriminator}***`)
            .addField('***● Server  :***', `*** → ${message.guild.name}***`)               
    .setColor('#ff0000')
                 .addField('ّ', args)
            m.send(``,{embed: bc});
        });
    }
})


client.on('message', message => {
    if (message.content.startsWith("رابط")) {
        message.channel.createInvite({
        thing: true,
        maxUses: 50,
        maxAge: 86400,
    }).then(invite =>
      message.author.sendMessage(invite.url)
    )
    const embed = new Discord.RichEmbed()
        .setColor("RANDOM")
          .setDescription("تم أرسال الرابط برسالة خاصة")
           .setAuthor(client.user.username, client.user.avatarURL)
                 .setAuthor(client.user.username, client.user.avatarURL)
                .setFooter('طلب بواسطة: ' + message.author.tag)

      message.channel.sendEmbed(embed).then(message => {message.delete(10000)})
              const Embed11 = new Discord.RichEmbed()
        .setColor("RANDOM")
        
    .setDescription("** مدة الرابط : يوم | عدد استخدامات الرابط : 50 **")
      message.author.sendEmbed(Embed11)
    }
}); 


var prefix = "+";
client.on('message', message => {
    if (message.content == "^fast") {
        var x = ["DreamKing",
"DeathGames",
"زيرو كنج",
"أرض الأحلام",
"ألبرازيل",
"العراق",
"ألمملكة ألعربية ألسعودية",
"القسطنطينية",
"النهاية",
"امازون",
"جافاسكربت",
"سهله مو صعبه",
"طبق رطب مرق بقر",
"متجر",
"شجرة الأوغيري",
"عش العصفور",
"هلا بلخميس",
"الحوت الأزرق",
];
        var x2 = ['DreamKing',
        "DeathGames",
        "زيرو كنج",
        "أرض الأحلام",
		"ألبرازيل",
		"العراق",
		"ألمملكة ألعربية ألسعودية",
		"القسطنطينية",
		"النهاية",
		"امازون",
		"جافاسكربت",
		"سهله مو صعبه",
		"طبق رطب مرق بقر",
		"متجر",
		"شجرة الأوغيري",
		"عش العصفور",
		"هلا بلخميس",
		"الحوت الأزرق",
        
        
        
        
        ];
        
        var x3 = Math.floor(Math.random()*x.length)
        message.channel.send(` اول شخص يكتب :  __**${x[x3]}**__
لديك 15 ثانية للاجابة`).then(msg1=> {
            var r = message.channel.awaitMessages(msg => msg.content == x2[x3], {
                maxMatches : 1,
                time : 15000,
                errors : ['time']
            })
        r.catch(() => {
            return message.channel.send(`:negative_squared_cross_mark: لقد انتهى الوقت ولم يقم أحد بالأجابة بشكل صحيح 
            الإجآبة الصحيحةة هي __**${x2[x3]}**__`)
        })
        
        r.then((collected)=> {
            message.channel.send(`${collected.first().author} لقد قمت بكتابة الكلمة في الوقت المناسب  `);
        })
        })
    }
})





client.on('ready', () => {
   console.log(`----------------`);
      console.log(`Cyhper Script By : DREAM`);
        console.log(`----------------`);
      console.log(`ON ${client.guilds.size} Servers '     Script By : DREAM ' `);
    console.log(`----------------`);
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setStatus("dnd")
});


const ytdl = require('ytdl-core');

const request = require('request');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const yt_api_key = "AIzaSyDeoIH0u1e72AtfpwSKKOSy3IPp2UHzqi4";

const prefix = '!'; // البرفكس



client.on('message', message => {

	if(message.content.startsWith(prefix + 'start')) {

		message.delete();

    const voiceChannel = message.member.voiceChannel;

    if (!voiceChannel) return message.reply(`**يحب ان تكون في روم صوتي**`);



	let embed = new Discord.RichEmbed()

    .setAuthor(`${message.author.tag}`, message.author.avatarURL)

	.setColor('#000000')

	.setFooter("Royal Quran", 'https://c.top4top.net/p_8981fwg11.png')

      .setDescription(`

     🕋 اوامر بوت القرآن الكريم 🕋

🇦 القرآن كاملاً ماهر المعيقلي

🇧 سورة البقرة كاملة للشيخ مشاري العفاسي

🇨 سورة الكهف كاملة بصوت مشارى بن راشد العفاسي

⏹ لإيقاف القرآن الكريم

🇩 القرآن كاملاً عبدالباسط عبدالصمد

🇪 القرآن كاملاً ياسر الدوسري

🇫 سورة الواقعه بصوت الشيخ مشاري بن راشد العفاسي`)



	message.channel.sendEmbed(embed).then(msg => {

			msg.react('🇦')

		.then(() => msg.react('🇧'))

		.then(() => msg.react('🇨'))

		.then(() => msg.react('⏹'))

		.then(() => msg.react('🇩'))

		.then(() => msg.react('🇪'))

		.then(() => msg.react('🇫'))



// Filters

	let filter1 = (reaction, user) => reaction.emoji.name === '🇦' && user.id === message.author.id;

	let filter2 = (reaction, user) => reaction.emoji.name === '🇧' && user.id === message.author.id;

	let filter3 = (reaction, user) => reaction.emoji.name === '🇨' && user.id === message.author.id;

	let filter4 = (reaction, user) => reaction.emoji.name === '⏹' && user.id === message.author.id;

	let filter5 = (reaction, user) => reaction.emoji.name === '🇩' && user.id === message.author.id;

	let filter6 = (reaction, user) => reaction.emoji.name === '🇪' && user.id === message.author.id;

	let filter7 = (reaction, user) => reaction.emoji.name === '🇫' && user.id === message.author.id;



// Collectors

	let collector1 = msg.createReactionCollector(filter1, { time: 120000 });

	let collector2 = msg.createReactionCollector(filter2, { time: 120000 });

	let collector3 = msg.createReactionCollector(filter3, { time: 120000 });

	let collector4 = msg.createReactionCollector(filter4, { time: 120000 });

	let collector5 = msg.createReactionCollector(filter5, { time: 120000 });

	let collector6 = msg.createReactionCollector(filter6, { time: 120000 });

	let collector7 = msg.createReactionCollector(filter7, { time: 120000 });



// Events

collector1.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=Ktync4j_nmA", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

   });

});

collector2.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=qFq5h4wtjaM&t=30s", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

      });

});

collector3.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=8UWKiKGQmsE", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

      });

});

collector4.on('collect', r => {

	if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم إيقاف القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

});

collector5.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=vqXLGtZcUm8", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

      });

});

collector6.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=WYT0pQne-7w", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

      });

});

collector7.on('collect', r => {

    voiceChannel.join()

      .then(connnection => {

        const stream = ytdl("https://www.youtube.com/watch?v=LTRcg-gR78o", { filter: 'audioonly' });

        const dispatcher = connnection.playStream(stream);

        dispatcher.on('end', () => voiceChannel.leave());

		collector1.stop();

		collector2.stop();

		collector3.stop();

		collector4.stop();

		collector5.stop();

		collector6.stop();

		collector7.stop();

		embed.setDescription(`<@${message.author.id}> **تم تشغيل القرآن الكريم**`);

		msg.edit(embed).then(msg.delete(5000));

      });

});

})

}

});



client.login(process.env.BOT_TOKEN);
