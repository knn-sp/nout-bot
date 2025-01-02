import { ActivityType } from 'discord.js';
import Event from '../../../base/Event.js';
import config from "../../config.json" with {type: 'json'};
import { cooldown } from '../../../functions/Cooldown/Cooldown.js';

export default class MessageCreateEvent extends Event {
    constructor() {
        super({ name: 'messageCreate' });
    }

    async run(client, message) {
        if (message.author.bot) {
            return;
        }

        const hasCooldown = cooldown.has(message.author.id);

        if (hasCooldown) {
            return message.reply({ content: `Calma vidóco! Você está em cooldown de ${cooldown.left(message.author.id, 'texto')}.` }).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 2500);
            })
        } else {
            const botMention = message.mentions.users.has(client.user.id);

            if (message.content.toLowerCase().includes("oi bot") || botMention) {
                const responses = [
                    "Oi vidóco!",
                    "Olá, tudo bem?",
                    "Deixe eu dormi."
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                message.reply(randomResponse);
                cooldown.set(message.author.id, { segundos: 10 });
            }
        }
    }
}