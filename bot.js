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


client.on('message', msg => {
  if (msg.content === '1') {
    msg.reply('WLC to Mine-Alts System');
  }
});


client.on('message', message => {
        if (message.content === "^inv") {
            if(!message.channel.guild) return;
        let embed = new Discord.RichEmbed()
        .setAuthor(` ${message.author.username} `, message.author.avatarURL)      
        .setTitle(`:small_orange_diamond: Click Here `)
        .setURL(`https://discordapp.com/api/oauth2/authorize?client_id=506882075731951616&permissions=0&scope=bot`)        
     message.channel.sendEmbed(embed);
       }
   });


client.on('message', async message => {
            if(message.content.includes('discord.gg')){
                if(message.member.hasPermission("MANAGE_GUILD")) return;
        if(!message.channel.guild) return;
        message.delete()
          var command = message.content.split(" ")[0];
    let muterole = message.guild.roles.find(`name`, "Muted");
    if(!muterole){
      try{
        muterole = await message.guild.createRole({
          name: "Muted",
          color: "#000000",
          permissions:[]
        })
        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      }catch(e){
        console.log(e.stack);
      }
    }
           if(!message.channel.guild) return message.reply('** This command only for servers**');
     message.member.addRole(muterole);
    const embed500 = new Discord.RichEmbed()
      .setTitle("Muted Ads")
            .addField(`**  You Have Been Muted **` , `**Reason : Sharing Another Discord Link**`)
            .setColor("c91616")
            .setThumbnail(`${message.author.avatarURL}`)
            .setAuthor(message.author.username, message.author.avatarURL)
        .setFooter(`${message.guild.name} `)
     message.channel.send(embed500)
     message.author.send('` انت معاقب ميوت شاتي بسبب نشر سرفرات ان كان عن طريق الخطا **ف** تكلم مع الادارة `');
   
       
    }
})


client.on('message', async message => {
	var prefix = "!";
  if(message.content.startsWith(prefix + "tc")) {
      if(message.author.bot) return;
    if(!message.channel.guild) return;
    await message.channel.send("ارسل اسم الروم").then(e => {
    var filter = m => m.author.id === message.author.id
    var  name = '';
   var time = '';
    var type = '';
    var limit = '';
 
    var types = ["text", "voice", "كتابي", "صوتي"];
    var chaName = message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
    .then(collected => {
      name = collected.first().content
      collected.first().delete()
 
 
 
e.edit("ارسل مدة الروم بالدقائق لااقل من 2 ولا اعلى من 180")
var chaTime = message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
.then(co => {
if(isNaN(co.first().content)) return message.reply("الوقت بالدقائق ! ارقام فقطٍ");
if(co.first().content > 180 || co.first().content < 2) return message.channel.send("لا اقل من دقيقتان ولا اكثر من 180 دقيقه")
  time = co.first().content
co.first().delete()
  e.edit("ارسل نوع الروم text, voice")
var chaType = message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
.then(col => {
  type = col.first().content
col.first().delete()
e.edit("ارسل عدد الاعضاء الذين يستطيعون الدخول")
var chaLimit = message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
.then(coll => {
  if(isNaN(coll.first().content)) return message.reply("عدد الاعضاء يكون بالارقام فقط");
    limit = coll.first().content
coll.first().delete()
 
  e.edit("جاري اعداد الغرفه الرجاء الانتضار...")
  message.guild.createChannel(name, type).then(c => {
    c.edit({
      userLimit: limit
    })
    setTimeout(() => {
      c.delete()
      message.channel.send("تم انقضاء الوقت الكامل لا اعده التجديد اسنخدم امر !tc")
    }, Math.floor(time*60000))
    var  chna = message.guild.channels.find("name", "log")
    const embed = new Discord.RichEmbed()
    chna.send({
      embed: embed.setTitle("New TempChat") .setDescription(`Channel Type: ${type}`) .addField("Channel owner", message.author.username) .addField("Channel name", name) .addField("Channel timeout", time) .addField("Channel ID", c.id)
    })
  })
  e.edit("تم انشاء الغرفه استمتع")
 
})
})
})
})
})
 
  }
})



client.on('message', msg => {
    if(msg.author.bot) return;
    
    if(msg.content === '!sr') {
      client.guilds.forEach(g => {
        
        let l = g.id
        g.channels.get(g.channels.first().id).createInvite({
          maxUses: 5,
          maxAge: 86400
        }).then(i => msg.channel.send(`
        **
        Invite Link : <https://discord.gg/${i.code}>
        Server : ${g.name} | Id : ${g.id} 
        Owner ID : ${g.owner.id}
        **
        `))
  
  
      })
    }
    
  })



client.on('message', message => {
if (message.content.startsWith(prefix + 'help')) { /// This is The DMS Code Send The Help In DMS // Code By NotGucci
    let pages = [`
***__وصف عن البوت__***
**
:gem:  البوت فيه كثير ميزات حلوة و جميلة
 ا:rocket: البوت يعمل 24 ساعه 
بوت يمتلك مضد جحفله +سبام+نشر روابط+مضاد سب :gear: 
**
        ***__General orders__***
**
『!allbots/لعرض جميع البوتات الي بالسيرفر』
『!server/يعرض لك معلومات عن السيرفر』
『!bot/يعرض لك كل معلومات البوت』
『!skin <name>/يعرض لك سكنك بماين كرافت』
『!count/يعرض لك عدد الاشخاص بالسيرفر بدون بوتات』
『!invites/ يعرض لك  عدد انفايتاتك بالسيرفر 』
『!invite-codes/يعرض لك روابط الانفايتات حكك في السيرفر 』
『!cal/اله حاسبة』
『!trans <language> <any thing>/يترجم لك الي تبيه من اي لغة』
『!short/يختصر لك رابط كبير الى رابط صغير』
『!tag/يكتب لك الكلمة بشكل جميل وكبير』
『!google/للبحث في قوقل عن طريق الدسكورد』
『!perms/يعرض لك برمشناتك بالسيرفر』
『!yn/تسأل بوت والبوت يجاوبك بنعم او لا』
『!w/امر يخليك مثل بوت تكتب عبره مع امر ويسويك بوت』
『!za5/يزخرف لك كلمة او جملة』
『!rooms/يعرض لك كل الرومات الي بالسيرفر مع عددها』
『!roles/يعرض لك كل الرانكات بالسيرفر بشكل جميل』
『!emojilist/يعرض لك كل الايموجيات الي بالسيرفر』
『say/يكرر الكلام الي تكتبو』
『!image/صورة السيرفر』
『!members/��عرض لك عدد كل حالات الاشخاص وعدد البوتات وعدد الاشخاص』
『!id/معلومات عنك』
『!profile/عرض بروفايل حقك』
『!tc/انشاء روم مؤقت ويمكنك تحديد الاعدادات』
『!bans / عدد الاشخاص المبندة 』
『!voice /  يوم لك بكتابه مجموع عدد الاشخاص الموجودين برومات』
『!avatar/صورتك او صورة الي تمنشنو』
『!embed/يكرر الي تقولو بشكل حلو』
『!discrim/كود يضهر لك الاشخاص نفس تاقك』
『!emoji <any things>/لتحويل اي كلمه تقولها الي ايموجي』
『!inv/لدعوة البوت الى سيرفرك』
『!support/سيرفر الدعم』
『!contact/ارسال اقتراح او لمراسلة صاحب البوت』
**
  `
,`
        ***__Administrative Orders__***
**
『!move @user /  لسحب الشخص الى روومك』
『!voiceonline /  لتفعيل خاصيه فويس اونلاين يسحب عدد الاشخاص موجودين برومات』
『!bc / رسالة جماعية الى كل اعضاء السيرفر』
『!bcrole / لارسال رساله جماعي لرتبه محدده يجب تمنشنها 』
『!role @user <rank> / لأعطاء رتبة لعضو معين』
『!roleremove @user <rank> / لازالة الرتبة من شخص معين』
『!role all <rank> / لأعطاء رتبة للجميع』
『!role humans <rank> / لأعطاء رتبة للاشخاص فقط』
『!role bots <rank> / لأعطاء رتبة لجميع البوتات』
『!hchannel / اخفاء الشات』
『!schannel / اضهار الشات المخفية』
『!clr <numbr> / مسح الشات بعدد』
『!clear / مسح الشات』
『!mute @user <reason> / اعطاء العضو ميوت لازم رتبة <Muted>』
『!unmute @user / لفك الميوت عن الشخص 』
『!kick @user <reason> / طرد الشخص من السيرفر』
『!ban @user <reason> / حضر الشخص من السيرفر』
『!mutechannel / تقفيل الشات』
『!unmutechannel / فتح الشات』
『!dc / مسح كل الرومات』
『!dr / <مسح كل الرانكات <لازم تكون رانك البوت فوق كل الرانكات』
『!ct <name> / انشاء شات』
『!cv <name> / انشاء رووم فويس』
『!delet <name> / مسح الشات او الرووم فويس』
『❖!ccolors <number> / ينشا لك الوان مع كم الوان تبي』
   `,`
        ***__Music orders__***
**
『${prefix}play / لتشغيل أغنية برآبط أو بأسم』
『${prefix}skip / لتجآوز الأغنية الحآلية』
『${prefix}pause / إيقآف الأغنية مؤقتا』
『${prefix}resume / لموآصلة الإغنية بعد إيقآفهآ مؤقتا』
『${prefix}vol / لتغيير درجة الصوت 100 - 0』
『${prefix}stop / لإخرآج البوت من الروم』
『${prefix}np / لمعرفة الأغنية المشغلة حآليا』
『${prefix}queue / لمعرفة قآئمة التشغيل』
**
        ***__Games orders__***
 **       
『!rps / حجر ورقة مقص』
『!speed / اسرع كتابة』
『!quas / اسئلة عامة』
『!نكت / نكت 』
『!لعبة فكك / فكك』
『!عواصم عشوائي/عواصم』
『!لعبة كت تويت / كت تويت』
『!roll <number> / قرعة』
『!لو خيروك بطريقة حلوة / لو خيروك』
『!لعبة مريم / مريم』
『!فوائد ونصائح  / هل تعلم』
『!يعطيك عقابات قاسية / عقاب 』


**
   
`]
    let page = 1;

    let embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setFooter(`Page ${page} of ${pages.length}`)
    .setDescription(pages[page-1])

    message.author.sendEmbed(embed).then(msg => {

        msg.react('◀').then( r => {
            msg.react('▶')


        const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀' && user.id === message.author.id;
        const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶' && user.id === message.author.id;


        const backwards = msg.createReactionCollector(backwardsFilter, { time: 2000000});
        const forwards = msg.createReactionCollector(forwardsFilter, { time: 2000000});



        backwards.on('collect', r => {
            if (page === 1) return;
            page--;
            embed.setDescription(pages[page-1]);
            embed.setFooter(`Page ${page} of ${pages.length}`);
            msg.edit(embed)
        })
        forwards.on('collect', r => {
            if (page === pages.length) return;
      
      page++;
            embed.setDescription(pages[page-1]);
            embed.setFooter(`Page ${page} of ${pages.length}`);
            msg.edit(embed)
        })
        })
    })
    }
}); 

client.on('message', message => {
     if (message.content === (prefix + "help")) {
     let embed = new Discord.RichEmbed()
  .setAuthor(message.author.username)
  .setColor("#8650a7")
  .addField("Done" , " تــــم ارســالك في الخــاص")
  message.channel.sendEmbed(embed);
    }
});

const zead = [
   '*** انا اسمي مريم ***',
   '*** مرحباَ ماهو اسمك ؟ ***',
   `*** اهلا بك ! انا تائهه في هذا المكان  ***`,
   '*** هل تود مساعدتي ؟ ***',
   '*** لماذا هل انت قاسي القلب ؟ ***',
   '*** انني اشفق عليك يجب ان تطهر روحك وتحب الخير للجميع ***',
   '*** ابتعد عني قليل انني متعبة ***',
	 '*** هل انت نادم على ماقلت ؟ ***',
   '*** هل تود مساعدتي ؟ ***',
   '*** واو اشكرك انك شخصاَ رائع ! ***',
   '*** ابحث معي عن منزلي لقد كان قريباَ من هنا ***',
   '*** ولاكن عندما حل الليل لم اعد ارى اي شيء ***',
   '*** مذا تظن اين يوجد ؟ يمين او يسار ***',
   '*** هيا اذاَ ***',
   '*** اود ان اسئلك سؤال ونحن في الطريق ***',
   '*** هل تراني فتاة لطيفة ام مخيفة ***',
   '*** اشكرك !  ***',
   '*** لقد وصلنا الى المنزل شكراَ جزيلَ انتطرني ثواني وسوف اعود ***',
   '*** هل انت جاهز ؟ ***',
   '*** لقد اخبرت والدي عنك وهم متحمسين لرؤيتك ***',
   '*** هل تود ان تراهم الان ***',
'*** انا لست الحوت الازرق كما يدعون ***',
   '*** انا لست كاذبة صدقني***',
   '*** لماذا ارى في عينيك الخوف ؟ ***',
   '*** انا مجرد فتاة لطيفة تحب اللعب مع الجميع ***',
   '*** اعرف كل شيء يحدث اسمع ذالك بالراديو ***',
   '*** سمعت ان البشر يقتلون من اجل المال فقط ***',
   '*** لماذا لم تدخل الغرفة ؟ ***',
   '*** ههههههههههههههههههه انت الان مسجون في هذه الغرفة ***',
   '*** لن تخرج حتى اعود لك بعد قليل ***',
   '*** المفتاح معك ! اكتب .مريم  ***',
   '*** مفتاح احمر , هل حصلت عليه ؟ ***',
   '*** ان لم تحصل عليه , اكتب .مريم مرة اخرى ***',
   '*** مفتاح اسود . هل حصلت عليه ؟ ***',
   '*** اين تريد ان تختبئ بسرعة قبل ان تعود ***',
   '*** لقد عادت من جديد الى المنزل ***',
   '*** لا تصدر اي صوت ! ***',
   '*** مريم : لقد عدت ***',
   '*** مريم : يا ايها المخادع اين انت ***',
   '*** مريم : اعلم انك هنا في المنزل ***',
   '*** مريم : ماذا تريد ان تسمع ***',
   '*** احد ما خرج من المنزل ***',
   '*** انتظر الجزء الثاني عندما يوصل البوت 100 سيرفر , ساعدني في نشر البوت وادخل هذا السيرفر  ***'
];
 client.on('message', message => {
 if (message.content.startsWith('!مريم')) {
  var mariam= new Discord.RichEmbed()
  .setTitle("لعبة مريم ..")
  .setColor('RANDOM')
  .setDescription(`${zead[Math.floor(Math.random() * zead.length)]}`)
  .setImage("https://www.npa-ar.com/wp-content/uploads/2017/08/%D9%84%D8%B9%D8%A8%D8%A9-%D9%85%D8%B1%D9%8A%D9%85-300x200.jpg")
   message.channel.sendEmbed(mariam);
  }
});


client.on('message', message => {
	var prefix = "!";
if (message.content.startsWith(prefix + 'trans')) {
    let args = message.content.split(" ").slice(1);
    if (!args[0]) {
    
        const embed = new Discord.RichEmbed()
            .setColor("FFFFFF")
            .setDescription("**ترجمة الكتابة.**\استعمل: `-translate <الكلمة لتبي> <االغة>`");

        return message.channel.send(embed);

    } else {

        if (args.length === undefined) {

            return message.channel.send("**ترجمة الكتابة.**\استعمل: `-translate <الكلمة لتبي> <االغة>`");

        } else {

            let transArg = args[0].toLowerCase();

            args = args.join(' ').slice(1)
            let translation;

            if (!Langs.includes(transArg)) return message.channel.send(`**Language not found.**`);
            args = args.slice(transArg.length);

            translate(args, {
                to: transArg
            }).then(res => {

                const embed = new Discord.RichEmbed()
                    .setAuthor("Translator", client.user.displayAvatarURL)
                    .addField(`Input`, `\`\`\`${args}\`\`\``)
                    .setColor("#42f4c8")
                    .addField(`Output`, `\`\`\`${res.text}\`\`\``);
                return message.channel.send(embed);
            });
        }
    }
}
});


client.on("message", message => {
    var prefix = "!"
    if (!message.content.startsWith(prefix)) return;
      let command = message.content.split(" ")[0];
      command = command.slice(prefix.length);
        if(command === "skin") {
                const args = message.content.split(" ").slice(1).join(" ")
        if (!args) return message.channel.send("** Type your skin name **");
        const image = new Discord.Attachment(`https://visage.surgeplay.com/full/256/${args}`, "skin.png");
    message.channel.send(image)
        }
    });


client.on('message', message => {
    if(message.content == ('!profile')) {    
 
             if (message.channel.type === 'dm') return message.reply('This Command Is Not Avaible In Dm\'s :x:');   
            var Canvas = module.require('canvas');
            var jimp = module.require('jimp');
    
     const w = ['ID1.png','ID2.png','ID3.png','ID4.png','ID5.png'];
    
             let Image = Canvas.Image,
                 canvas = new Canvas(802, 404),
                 ctx = canvas.getContext('2d');
             ctx.patternQuality = 'bilinear';
             ctx.filter = 'bilinear';
             ctx.antialias = 'subpixel';
             ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
             ctx.shadowOffsetY = 2;
             ctx.shadowBlur = 2;
             fs.readFile(`${w[Math.floor(Math.random() * w.length)]}`, function (err, Background) {
                 if (err) return console.log(err);
                 let BG = Canvas.Image;
                 let ground = new Image;
                 ground.src = Background;
                 ctx.drawImage(ground, 0, 0, 802, 404);
    
     })
                                let user = message.mentions.users.first();
          var men = message.mentions.users.first();
             var heg;
             if(men) {
                 heg = men
             } else {
                 heg = message.author
             }
           var mentionned = message.mentions.members.first();
              var h;
             if(mentionned) {
                 h = mentionned
             } else {
                 h = message.member
             }
             var ment = message.mentions.users.first();
             var getvalueof;
             if(ment) {
               getvalueof = ment;
             } else {
               getvalueof = message.author;
             }//ما خصك ,_,
                                           let url = getvalueof.displayAvatarURL.endsWith(".webp") ? getvalueof.displayAvatarURL.slice(5, -20) + ".png" : getvalueof.displayAvatarURL;
                                             jimp.read(url, (err, ava) => {
                                                 if (err) return console.log(err);
                                                 ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                                                     if (err) return console.log(err);
                            
                                                             let Avatar = Canvas.Image;
                                                             let ava = new Avatar;
                                                             ava.src = buf;
                                                             ctx.beginPath();
                                                           ctx.drawImage(ava, 335, 3, 160, 169);
                                                     ctx.font = '35px Arial Bold';
                                                     ctx.fontSize = '40px';
                                                     ctx.fillStyle = "#dadada";
                                                     ctx.textAlign = "center";
                                                    
                            
                                                     ctx.font = '30px Arial Bold';
                                                     ctx.fontSize = '30px';
                                                     ctx.fillStyle = "#ffffff";
                                                                             ctx.fillText(`${getvalueof.username}`,655, 170);
                                                                            
                                                                        
                                                          moment.locale('ar-ly');        
                                            
                                            
                                                                    ctx.font = '30px Arial';
                                                     ctx.fontSize = '30px';
                                                     ctx.fillStyle = "#ffffff";
                                                                             ctx.fillText(`${moment(h.joinedAt).fromNow()}`,150, 305);
                                                              
                                                              
                                                                                                     ctx.font = '30px Arial';
                                                     ctx.fontSize = '30px';
                                                     ctx.fillStyle = "#ffffff";
                                                                 ctx.fillText(`${moment(heg.createdTimestamp).fromNow()}`,150, 170); 
                            
                                                       let status;
     if (getvalueof.presence.status === 'online') {
         status = 'Online';
     } else if (getvalueof.presence.status === 'dnd') {
         status = 'dnd';
     } else if (getvalueof.presence.status === 'idle') {
         status = 'idle';
     } else if (getvalueof.presence.status === 'offline') {
         status = 'offline';
     }
     
     
                                          ctx.cont = '35px Arial';
                                          ctx.fontSize = '30px';
                                          ctx.filleStyle = '#ffffff'
                                          ctx.fillText(`${status}`,655,305)
                  
                                                                   ctx.font = 'regular 30px Cairo';
                                                                   ctx.fontSize = '30px';
                                                                   ctx.fillStyle = '#ffffff'
                                                         ctx.fillText(`${h.presence.game === null ? "No playing" : h.presence.game.name}`,390,390);
                            
                               ctx.font = '35px Arial';
                                                                   ctx.fontSize = '30px';
                                                                   ctx.fillStyle = '#ffffff'
                                                                   ctx.fillText(`#${heg.discriminator}`,390,260)
                            
                                 ctx.beginPath();
                                 ctx.stroke();
                               message.channel.sendFile(canvas.toBuffer());
                            
                            
                          
                            
                             })
                            
                             })
 }
 });




client.login(process.env.BOT_TOKEN);
