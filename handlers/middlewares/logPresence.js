'use strict';

const { chats = {} } = require('../../utils/config').config;

function getUsername(user) {
	let str = user.first_name;
	if (user.last_name) str += ' ' + user.last_name;
	if (user.username) str += ' (@' + user.username + ')';
	return str;
}

function getId(user) {
	return user.id;
}

/** @param { import('../../typings/context').ExtendedContext } ctx */
function log(ctx, next) {
	if (!chats.presenceLog) return next();
	if (ctx.updateSubTypes[0] === 'new_chat_members') {
		ctx.telegram.sendMessage(
			chats.presenceLog,
			ctx.message.new_chat_members.map(getUsername).join(', ') +
				' #joined ' + ctx.chat.title,
<<<<<<< HEAD
			{ reply_markup: { inline_keyboard: [ [ 
					{
					text: '🚫 Ban all',
					callback_data: `/ban ${
						ctx.message.new_chat_members
							.map(getId)
							.join(' ')} [joining]`
					} 
				],
				/* Draft code
				// BEGIN NEW JOIN CODE VERIFY BOX
				[
					{
					text: '✔️ Verified',
					// eslint-disable-next-line max-len
					callback_data: `/del -chat_id=${chats.presenceLog} -msg_id=${ctx.message} New Joiner(s) verified`
					}
				] 
				*/
			] } }
		);
	} else if (ctx.updateSubTypes[0] === 'left_chat_member') {
		ctx.telegram.sendMessage(
			chats.presenceLog,
			getUsername(ctx.message.left_chat_member) +
				' #left ' + ctx.chat.title
		);
=======
			{ reply_markup: { inline_keyboard: [ [ {
				text: `🚫 Ban ${ctx.message.new_chat_members.length}`,
				callback_data: `/ban ${
					ctx.message.new_chat_members
						.map(getId)
						.join(' ')} [joining]`,
			} ] ] } },
		).catch(() => null);
>>>>>>> e7ef169840397d9d686091343c9362161d90af82
	}
	return next();
}
module.exports = log;
