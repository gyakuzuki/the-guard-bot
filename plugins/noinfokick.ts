import type { ExtendedContext } from "../typings/context";
import type { UserProfilePhotos, Chat } from "telegraf/typings/telegram-types";
import Telegraf = require("telegraf");
import HtmlUtils = require("../utils/html");
import TgUtils = require("../utils/tg");
import Log = require("../utils/log");

const kickCooldown = 300; // Time before a kicked user can attempt to join the chat again in 5 minutes (300 seconds) by default.
const checkUsername = true; // If True, checks if the new member has an username, if they don't, they'll fail this check.
const checkPicture = true; // If True, checks if the new member has a profile picture, if they don't, they'll fail this check.
const checkBio = true; // If True, checks if the new member has a bio description, if they don't, they'll fail this check.
const feedback = true; // If True, it will post a message detailing why the user was removed.
const tolerance = 2; // Value from 1 to 3, determines how many checks the new member must fail to be kicked.

const { Composer: C } = Telegraf;
const { html } = HtmlUtils;
const { link } = TgUtils;
const { logError } = Log;

const excludedGroupId = '-1001XXXXXXX41'; // hardcoded lobby id

export = C.mount("message", async (ctx: ExtendedContext, next) => {
    const members = ctx.message?.new_chat_members?.filter(
        (x) => x.username !== ctx.me
    );
    if (!members || members.length === 0) {
        return next();
    }
    return Promise.all(
        members.map(async (x) => {
            let username = false;
            let picture = false;
            let bio = false;
            let kickMessage = "";
            let profilePictures: UserProfilePhotos;
            let userBio: Chat;
            let fails = 0;
            // new lobby check code
            let inLobby = false;
            if ((await ctx.telegram.getChatMember(excludedGroupId, x.id)).status === "member"){
                inLobby = true;
            }
            // end new lobby check code
            //logError("[noinfokick] New Member: [" + x.id + "] (" + x.username + ") {" + x.first_name + " " + x.last_name + "}\n");
            if (checkUsername) {
                //logError("[noinfokick] Username: " + x.username + "\n");
                if (x.username == null && inLobby != true) {
                    username = true;
                    kickMessage = kickMessage + "No Username \n";
                    fails = fails + 1;
                }
            }
            if (checkPicture) {
                profilePictures = await ctx.telegram.getUserProfilePhotos(x.id);
                //logError("[noinfokick] Profile Picture Count: " + profilePictures.total_count + "\n");
                if (profilePictures.total_count === 0 && inLobby != true) {
                    picture = true;
                    kickMessage = kickMessage + "No Profile Picture \n";
                    fails = fails + 1;
                }
            }
            if (checkBio) {
                userBio = await ctx.telegram.getChat(x.id);
                //logError("[noinfokick] Bio: " + userBio.bio + "\n");
                if (userBio.bio == null && inLobby != true) {
                    bio = true;
                    kickMessage = kickMessage + "No Bio \n";
                    fails = fails + 1;
                }
            }
            if (fails >= tolerance) {
                if (feedback) {
                    ctx.replyWithHTML(
                        html`User ${link(x)} has been kicked as suspicious for: \n
                    <code>${kickMessage}</code>`
                    );
                }
                ctx.kickChatMember(x.id, (Date.now() / 1000) + kickCooldown);
            } else {
                return next();
            }
        })
    ).catch((err) => logError("[noinfokick] " + err.message));
});
