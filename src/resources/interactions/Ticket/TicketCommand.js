import { ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder } from "discord.js";
import Command from "../../../base/Command.js";
import { formatLines } from "../../../functions/FormatLines.js";
import config from "../../config.json" with {type: 'json'};
import { JsonDatabase } from "wio.db";

const settingsConfig = new JsonDatabase({ databasePath: "src/config/settings.json" });

export default class TicketCommand extends Command {
    constructor(client) {
        super(client, {
            name: "ticket",
            description: "Comando de gerenciamento de tickets",
            options: [
                {
                    name: "gerenciar",
                    description: "Gerenciar o painel de ticket",
                    type: ApplicationCommandOptionType.Subcommand
                },
            ]
        });

        this.config = {
            ephemeral: false,
            autoDefer: false,
            requireDatabase: false,
        };
    }

    run(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply({
                content: `Voce não tem permissão para isso!`,
                ephemeral: true,
            });
        }

        if (interaction.options.getSubcommand() === "gerenciar") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: "Gerenciamento de Tickets", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(formatLines([
                    `Olá ${interaction.user}, seja bem-vindo(a) ao painel de tickets!`,
                    `Por aqui você consegue gerenciar \`seus tickets\` e muito mais! Basta selecionar uma opção no menu abaixo.`,
                    "",
                    `**Observações:**`,
                    `• As informações são atualizadas de forma automática, por isso elas podem demorar alguns segundos pra atualizar completamente.`,
                    `• Algumas informações irá alterar o **MENU** abaixo e você pode selecionar por ele mesmo, não precisa digitar o comando denovo.`,
                    ``,
                    `Pronto! Agora já pode editar o que precisa :)`
                ]))
                .setColor(config.color["no-clean"])

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("menu")
                    .setPlaceholder("➡️ Selecione uma opção")
                    .addOptions([
                        {
                            label: "Exibir a mensagem do ticket",
                            value: "message",
                            description: "Exibir a mensagem do ticket",
                            emoji: "📩"
                        }, {
                            label: "Alterar o título do ticket",
                            value: "title",
                            description: "Alterar o título do ticket",
                            emoji: "🔨"
                        }, {
                            label: "Alterar a descrição do ticket",
                            value: "desc",
                            description: "Alterar a descrição do ticket",
                            emoji: "📝"
                        }, {
                            label: "Alterar a cor do ticket",
                            value: "color",
                            description: "Alterar a cor do ticket",
                            emoji: "🎨"
                        }, {
                            label: "Adicionar um banner no ticket",
                            value: "banner",
                            description: "Adicionar um banner no ticket",
                            emoji: "🖼️"
                        }, {
                            label: "Adicionar um thumbnail no ticket",
                            value: "thumbnail",
                            description: "Adicionar um thumbnail no ticket",
                            emoji: "🖼️"
                        }, {
                            label: "Adicionar um rodapé no ticket",
                            value: "footer",
                            description: "Adicionar um rodapé no ticket",
                            emoji: "📝"
                        }, {
                            label: "Editar o botão do ticket",
                            value: "button",
                            description: "Editar o botão do ticket",
                            emoji: "🔧"
                        }, {
                            label: "Gerenciar as categorias",
                            value: "category",
                            description: "Gerenciar as categorias do ticket",
                            emoji: "🗃️"
                        }, {
                            label: "Gerenciar os canais",
                            value: "channel",
                            description: "Gerenciar os canais do ticket (logs, etc)",
                            emoji: "📚"
                        }, {
                            label: "Configurar mensagens/botões dentro do ticket",
                            value: "config",
                            description: "Configurar mensagens/botões dentro do ticket",
                            emoji: "⚙️"
                        }, {
                            label: "Configurar as permissões",
                            value: "permissions",
                            description: "Configurar as permissões do ticket",
                            emoji: "🔑"
                        }, {
                            label: "Ativar ou desativar sistema de reviews",
                            value: "review",
                            description: "Ativar ou desativar sistema de reviews pós ticket",
                            emoji: "🔔"
                        }, {
                            label: "Deletar a mensagem",
                            value: "cance",
                            emoji: "🗑️"
                        }
                    ])
            )

            interaction.reply({ embeds: [Embed], components: [row] });
        }
    }
}