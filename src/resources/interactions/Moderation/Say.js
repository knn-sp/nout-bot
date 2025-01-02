import { ApplicationCommandOptionType, ButtonStyle, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import Command from "../../../base/Command.js";
import config from "../../config.json" with {type: 'json'};

export default class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            description: "Envie mensagem usando o bot",
            options: [
                {
                    name: "channel",
                    description: "Canal para enviar a mensagem",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: "content",
                    description: "Conteúdo da mensagem",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "embed",
                    description: "Enviar mensagem como um embed",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: "image",
                    description: "URL da imagem para a embed",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        });

        this.config = {
            ephemeral: false,
            autoDefer: true,
            requireDatabase: false,
        };
    }

    async run(interaction) {
        if (!interaction.channel.permissionsFor(interaction.user).has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply({
                content: `Você não possui permissão para isso!`,
                ephemeral: true,
            });
        }

        const channel = interaction.options.getChannel("channel");
        const content = interaction.options.getString("content");
        const sendAsEmbed = interaction.options.getBoolean("embed") || false;
        const image = interaction.options.getString("image");

        if (sendAsEmbed) {
            const embed = new EmbedBuilder()
                .setDescription(content)
                .setColor(config.color["no-clean"]);

            if (image) {
                embed.setImage(image);
            }

            channel.send({ embeds: [embed] });
        } else {
            channel.send(content);
        }

        interaction.editReply({
            content: `Mensagem enviada em ${channel}`,
            ephemeral: true,
        });
    }
}
