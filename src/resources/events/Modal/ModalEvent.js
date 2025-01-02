import Event from "../../../base/Event.js"
import config from "../../config.json" with {type: 'json'};
import moment from "moment";
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
moment.locale('pt-br');
import { JsonDatabase } from "wio.db";
import { createTranscript } from "thiscode-transcript";
import { formatLines } from "../../../functions/FormatLines.js";

const ticketsOpenedConfig = new JsonDatabase({ databasePath: "src/config/tickets_openeds.json" });
const categoriesConfig = new JsonDatabase({ databasePath: "src/config/categories.json" });
const ticketsConfig = new JsonDatabase({ databasePath: "src/config/ticket_embed.json" });

export default class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }

    async run(client, interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("pokar_user")) {
            const interactionChannel = interaction.channel;
            const topic = interactionChannel.topic;

            if (topic) {
                const regex = /Ticket ID: (\w+)/;
                const match = topic.match(regex);

                if (match) {
                    const ticketId = match[1];
                    console.log(ticketId);
                } else {
                    console.log("Não foi possível encontrar o ID do ticket no tópico do canal.");
                }
            } else {
                console.log("O canal não possui um tópico definido.");
            }
        }

        if (interaction.customId.startsWith("close-ticket-")) {
            const userId = interaction.customId.split("-")[2];
            const user = await interaction.guild.members.cache.get(userId);

            let reason = interaction.fields.getTextInputValue("reason");
            if (reason === "") reason = "Sem motivo";

            await interaction.reply({ content: `**${interaction.user.tag}** fechou o ticket por: **${reason}**` });

            const logsChannelId = ticketsConfig.get("others_channels.logs");
            if (logsChannelId) {
                const logsChannel = await interaction.guild.channels.cache.get(logsChannelId);
                if (logsChannel) {
                    const transcript = await createTranscript(interaction.channel);
                    await logsChannel.send({ content: `**${interaction.user.tag}** fechou o ticket por: **${reason}**`, files: [transcript] });
                }
            }

            try {
                await interaction.channel.delete();

                ticketsOpenedConfig.delete(userId);
            } catch (error) {
                console.log(error);
            }
        }
    }
}