import Event from "../../../base/Event.js"
import config from "../../config.json" with {type: 'json'};

export default class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }
 
    async run(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (config.expiration && new Date(config.expiration) < new Date()) {
            await interaction.client.application.fetch();

            return interaction.reply({
                content: `${interaction.client.application.owner} Este bot está expirado.`,
            });
        }

        if (command.config.autoDefer) await interaction.deferReply({ ephemeral: command.config.ephemeral });

        command.run(interaction);
    }
}