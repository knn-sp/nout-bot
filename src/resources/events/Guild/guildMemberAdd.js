import Event from "../../../base/Event.js"
import config from "../../config.json" with {type: 'json'};

export default class GuildMemberAddEvent extends Event {
    constructor() {
        super({ name: 'guildMemberAdd' });
    }

    async run(client, member) {

        const channelId = config.channels.welcome;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        await channel.send({ content: `O usuário ${member} acabou de entrar no servidor. Agora estamos com #**${member.guild.memberCount}** membros` });
    }
}