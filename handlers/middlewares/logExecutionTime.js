'use strict';

/**
 * @param {import('../../typings/context').ExtendedContext} ctx
 * @param {() => Promise<void>} next
 */
const logExecutionTime = async (ctx, next) => {
	const start = Date.now();
	try {
		await next();
	} finally {
		const ms = Date.now() - start;
		// Log handlers that take longer than 500ms to help identify performance bottlenecks
		if (ms > 500) {
			const updateType = ctx.updateType || 'unknown';
			const from = ctx.from ? `from user ${ctx.from.id}` : '';
			const chat = ctx.chat ? `in chat ${ctx.chat.id}` : '';
			let updateInfo = `[${updateType}]`;

			if (ctx.message?.text) {
				updateInfo += ` text: "${ctx.message.text.substring(0, 50)}"`;
			} else if (ctx.callbackQuery?.data) {
				updateInfo += ` cb_data: "${ctx.callbackQuery.data}"`;
			} else if (ctx.message?.new_chat_members) {
				const members = ctx.message.new_chat_members.map(m => m.id).join(', ');
				updateInfo += ` new_chat_members: ${members}`;
			}

			console.warn(`[PERF] Slow handler detected. Took ${ms}ms. Update: ${updateInfo} ${from} ${chat}`);
		}
	}
};

module.exports = logExecutionTime;
