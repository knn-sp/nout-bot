import Event from "../../../base/Event.js";
import config from "../../config.json" with {type: 'json'};
import moment from "moment";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, PermissionsBitField, SelectMenuBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
moment.locale('pt-br');
import fs from "fs/promises";
import { JsonDatabase } from "wio.db";
import { createTranscript } from "thiscode-transcript";
import { formatLines } from "../../../functions/FormatLines.js";
import ms from "ms";

const ticketsOpenedConfig = new JsonDatabase({ databasePath: "src/config/tickets_openeds.json" });
const categoriesConfig = new JsonDatabase({ databasePath: "src/config/categories.json" });
const ticketsConfig = new JsonDatabase({ databasePath: "src/config/ticket_embed.json" });
const settingsConfig = new JsonDatabase({ databasePath: "src/config/settings.json" });

export default class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }

    async run(client, interaction) {
        if (!interaction.isButton()) return;

        const rowManager = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuManager")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Quero gerenciar o usuário do ticket",
                        value: "manage_user_ticket",
                        emoji: "👤",
                        description: "Gerencie o usuário do ticket (banir, expulsar, pokar e etc)",
                    },
                    {
                        label: "Quero gerenciar o canal do ticket",
                        value: "manage_channel_ticket",
                        emoji: "🗣",
                        description: "Gerencie o canal do ticket (mudar o nome, remover ou adicionar um usuário e etc)",
                    }
                ])
        )

        const rowManagerUser = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuManagerUser")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Pokar",
                        value: "pokar_user",
                        emoji: "📢",
                        description: "Enviar uma mensagem no privado do autor do ticket",
                    },
                    {
                        label: "Banir",
                        value: "banir_user",
                        emoji: "⛔",
                        description: "Banir o usuário do discord (não poderá voltar)",
                    },
                    {
                        label: "Expulsar",
                        value: "expulsar_user",
                        emoji: "⛔",
                        description: "Expulsar o usuário do servidor (poderá voltar)",
                    },
                    {
                        label: "Timeout",
                        value: "timeout_user",
                        emoji: "⌛",
                        description: "Silenciar o usuário temporário no servidor (não poderá falar)",
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenuManager",
                        emoji: "❌"
                    }
                ])
        )

        const rowManagerChannel = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuManagerChannel")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Alterar o nome",
                        value: "alterar_nome",
                        emoji: "📝",
                        description: "Altere o nome do canal do ticket",
                    },
                    {
                        label: "Adicionar um usuário",
                        value: "adicionar_user",
                        emoji: "🔓",
                        description: "Adicione um usuário ao canal do ticket",
                    },
                    {
                        label: "Remover um usuário",
                        value: "remover_user",
                        emoji: "🔒",
                        description: "Remova um usuário do canal do ticket",
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenuManager",
                        emoji: "❌"
                    }
                ])
        )

        if (interaction.customId.startsWith("manage-")) {
            const parts = interaction.customId.split("-");
            const userId = parts[1];
            const ticketCode = parts[2];
            console.log(userId);

            const allowedRoles = Object.values(settingsConfig.get("rolesData.access_button_manager")).map(role => role.id);

            const member = interaction.guild.members.cache.get(interaction.user.id);
            const userRoles = member.roles.cache;

            const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role.id));

            if (hasAllowedRole) {
                await interaction.reply({
                    content: formatLines([
                        "Você está acessando o menu de **gerenciamento do usuário e/ou canal do ticket**. Selecione uma das opções abaixo:",
                    ]),
                    components: [rowManager],
                    ephemeral: true
                });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

                collector.on("collect", async (i) => {
                    try {
                        if (i.values[0] === "voltarMenuManager") {
                            await i.update({
                                content: formatLines([
                                    "Você está acessando o menu de **gerenciamento do usuário e/ou canal do ticket**. Selecione uma das opções abaixo:",
                                ]),
                                components: [rowManager],
                                ephemeral: true
                            });
                        }
                    } catch (error) { }

                    try {
                        if (i.values[0] === "manage_user_ticket") {
                            await i.update({
                                content: formatLines([
                                    "Você está acessando o menu de **gerenciamento do usuário do ticket**. Selecione uma das opções abaixo:",
                                ]),
                                components: [rowManagerUser],
                                ephemeral: true
                            });

                            const filterUser = (i) => i.user.id === interaction.user.id;
                            const collectorUser = interaction.channel.createMessageComponentCollector({ filterUser, time: 120000 });

                            collectorUser.on("collect", async (i) => {
                                try {
                                    if (i.values[0] === "voltarMenuUser") {
                                        await i.update({
                                            content: formatLines([
                                                "Você está acessando o menu de **gerenciamento do usuário do ticket**. Selecione uma das opções abaixo:",
                                            ]),
                                            components: [rowManagerUser],
                                            ephemeral: true
                                        });
                                    }
                                } catch (error) { }

                                try {
                                    if (i.values[0] === "pokar_user") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite abaixo a mensagem que irá ser enviada no privado do autor do ticket."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            await m.delete();

                                            const message = m.content;

                                            try {
                                                const user = await interaction.guild.members.fetch(userId);
                                                await user.send({
                                                    content: formatLines([
                                                        `A equipe do servidor **${interaction.guild.name}** te enviou uma mensagem no privado sobre seu ticket.`,
                                                        `**Mensagem:** ${message}`,
                                                        `**Ticket ID:** ${ticketCode}`
                                                    ]),
                                                    components: [
                                                        new ActionRowBuilder().addComponents(
                                                            new ButtonBuilder()
                                                                .setStyle(ButtonStyle.Link)
                                                                .setLabel("Ir até meu ticket")
                                                                .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
                                                        )
                                                    ]
                                                });
                                            } catch (error) {
                                                console.error("Erro ao enviar mensagem:", error);
                                            }

                                            await i.editReply({
                                                content: formatLines([
                                                    "Mensagem enviada com sucesso!"
                                                ]),
                                                components: [],
                                                ephemeral: true
                                            });
                                        });
                                    } else if (i.values[0] === "ban_user") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite abaixo o motivo para o banimento do usuário."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            await m.delete();

                                            const message = m.content;

                                            try {
                                                const user = await interaction.guild.members.fetch(userId);
                                                await user.ban({
                                                    reason: message
                                                });
                                            } catch (error) {
                                                console.error("Erro ao banir:", error);
                                            }

                                            await i.editReply({
                                                content: formatLines([
                                                    "Usário banido com sucesso!"
                                                ]),
                                                components: [],
                                                ephemeral: true
                                            });
                                        });
                                    } else if (i.values[0] === "kick_user") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite abaixo o motivo para o kick do usuário."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            await m.delete();

                                            const message = m.content;

                                            try {
                                                const user = await interaction.guild.members.fetch(userId);
                                                await user.kick({
                                                    reason: message
                                                });
                                            } catch (error) {
                                                console.error("Erro ao kickar:", error);
                                            }

                                            await i.editReply({
                                                content: formatLines([
                                                    "Usário kickado com sucesso!"
                                                ]),
                                                components: [],
                                                ephemeral: true
                                            });
                                        });
                                    } else if (i.values[0] === "timeout_user") {
                                        await i.update({
                                            content: formatLines(["Por favor, digite abaixo o motivo para o timeout do usuário."]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        let reason = "";

                                        collectorMessage.on("collect", async (m) => {
                                            await m.delete();
                                            reason = m.content;

                                            await i.editReply({
                                                content: formatLines(["Por favor, digite o tempo de timeout (por exemplo: 1m, 1h, 1d, 1w, 1mo, 1y)."]),
                                                components: [],
                                                ephemeral: true
                                            });

                                            const collectorDuration = interaction.channel.createMessageCollector({ filterMessage, time: 60000 });

                                            collectorDuration.on("collect", async (m) => {
                                                const durationInput = m.content.trim().toLowerCase();
                                                if (!/^\d+[smhdwmy]$/.test(durationInput)) {
                                                    await m.reply("Por favor, forneça um tempo válido (por exemplo: 1m, 1h, 1d, 1w, 1mo, 1y).");
                                                    return;
                                                }

                                                const parseDuration = (input) => {
                                                    return ms(input);
                                                };

                                                const timeoutDuration = parseDuration(durationInput);
                                                if (timeoutDuration === null) {
                                                    await interaction.editReply("Tempo de timeout inválido.");
                                                    return;
                                                }

                                                const user = await interaction.guild.members.fetch(userId);
                                                try {
                                                    await user.timeout(timeoutDuration, reason)
                                                    await interaction.editReply("O usuário foi silenciado com sucesso.");
                                                } catch (error) {
                                                    console.error("Erro ao timeoutar:", error);
                                                }
                                            });

                                            collectorDuration.on("end", () => {
                                                collectorDuration.removeAllListeners();
                                                if (!collectorDuration.collected.size) {
                                                    interaction.editReply("Tempo de resposta expirado. O processo de timeout foi cancelado.");
                                                }
                                            });
                                        });
                                    }
                                } catch (error) { }
                            });
                        }
                    } catch (error) { }

                    try {
                        if (i.values[0] === "manage_channel_ticket") {
                            await i.update({
                                content: formatLines([
                                    "Você está acessando o menu de **gerenciamento do canal do ticket**. Selecione uma das opções abaixo:",
                                ]),
                                components: [rowManagerChannel],
                                ephemeral: true
                            });

                            const filterChannel = (m) => m.author.id === interaction.user.id;
                            const collectorChannel = interaction.channel.createMessageComponentCollector({ filterChannel, time: 120000 });

                            collectorChannel.on("collect", async (i) => {
                                try {
                                    if (i.values[0] === "voltarMenuChannel") {
                                        await i.update({
                                            content: formatLines([
                                                "Você está acessando o menu de **gerenciamento do canal do ticket**. Selecione uma das opções abaixo:",
                                            ]),
                                            components: [rowManagerChannel],
                                            ephemeral: true
                                        });
                                    }
                                } catch (error) { }

                                try {
                                    if (i.values[0] === "alterar_nome") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite abaixo o novo nome para o canal do ticket."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            try {
                                                await m.delete();
                                            } catch (error) {}

                                            const message = m.content;

                                            try {
                                                await interaction.channel.setName(message);
                                            } catch (error) {
                                                console.error("Erro ao renomear canal:", error);
                                            }

                                            await i.editReply({
                                                content: formatLines([
                                                    "Canal renomeado com sucesso!"
                                                ]),
                                                components: [],
                                                ephemeral: true
                                            });
                                        });
                                    } else if (i.values[0] === "adicionar_user") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite o ID do usuário ou mencione-o para adicionar."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            try {
                                                await m.delete();
                                            } catch (error) {}

                                            let userId = m.content;

                                            if (m.mentions.users.size > 0) {
                                                userId = m.mentions.users.first().id;
                                            } else {
                                                const isUserId = /^[0-9]+$/.test(userId);
                                                if (!isUserId) {
                                                    await interaction.editReply("Por favor, forneça um ID de usuário válido ou mencione o usuário.");
                                                    return;
                                                }
                                            }

                                            const user = await interaction.guild.members.fetch(userId);

                                            try {
                                                await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, AttachFiles: true, AddReactions: true, ReadMessageHistory: true });
                                                await i.editReply({
                                                    content: formatLines([
                                                        "Usuário adicionado com sucesso!"
                                                    ]),
                                                    components: [],
                                                    ephemeral: true
                                                });
                                            } catch (error) {
                                                console.error("Erro ao adicionar usuário:", error);
                                            }
                                        });
                                    } else if (i.values[0] === "remover_user") {
                                        await i.update({
                                            content: formatLines([
                                                "Por favor, digite o ID do usuário ou mencione-o para remover."
                                            ]),
                                            components: [],
                                            ephemeral: true
                                        });

                                        const filterMessage = (m) => m.author.id === interaction.user.id;
                                        const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

                                        collectorMessage.on("collect", async (m) => {
                                            try {
                                                await m.delete();
                                            } catch (error) {}

                                            let userId = m.content;

                                            if (m.mentions.users.size > 0) {
                                                userId = m.mentions.users.first().id;
                                            } else {
                                                const isUserId = /^[0-9]+$/.test(userId);
                                                if (!isUserId) {
                                                    await interaction.editReply("Por favor, forneça um ID de usuário válido ou mencione o usuário.");
                                                    return;
                                                }
                                            }

                                            const user = await interaction.guild.members.fetch(userId);

                                            try {
                                                await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false, AttachFiles: false, AddReactions: false, ReadMessageHistory: false });
                                                await i.editReply({
                                                    content: formatLines([
                                                        "Usuário removido com sucesso!"
                                                    ]),
                                                    components: [],
                                                    ephemeral: true
                                                });
                                            } catch (error) {
                                                console.error("Erro ao remover usuário:", error);
                                            }
                                        });
                                    }
                                } catch (error) { }
                            });
                        }
                    } catch (error) { }
                });
            } else {
                return interaction.reply({ content: "Apenas membros da equipe (staff) podem utilizar esse botão.", ephemeral: true });
            }
        }

        if (interaction.customId.startsWith("leave-ticket-")) {
            const userId = interaction.customId.split("-")[2];

            if (interaction.user.id === userId) {
                const user = await interaction.guild.members.cache.get(userId);
                await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false, AttachFiles: false });

                await interaction.reply({ content: `**${user.user.tag}** saiu do ticket.` });
            } else {
                await interaction.reply({ content: `Apenas o autor do ticket pode sair.`, ephemeral: true });
            }
        }

        if (interaction.customId.startsWith("close-ticket-")) {
            const userId = interaction.customId.split("-")[2];
            const user = await interaction.guild.members.fetch(userId);

            const channelTopic = interaction.channel.topic;
            const getTicketCode = /Ticket ID: (\w+)/;
            const ticketCode = getTicketCode.exec(channelTopic)[1];

            const Embed = new EmbedBuilder()
                .setAuthor({ name: "Você está finalizando um ticket!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(formatLines([
                    "Por favor, logo abaixo descreva um breve motivo pelo qual você está finalizando o atendimento:"
                ]))
                .setColor(config.color["no-clean"]);

            await interaction.reply({ embeds: [Embed], components: [], ephemeral: true });

            const filterMessage = (m) => m.author.id === interaction.user.id;
            const collectorMessage = interaction.channel.createMessageCollector({ filterMessage, time: 120000 });

            collectorMessage.on("collect", async (m) => {
                await m.delete();
                await interaction.editReply({ content: `**${interaction.user.tag}** fechou o ticket por: **${m.content}**`, components: [], embeds: [], ephemeral: true });

                const logsChannelId = ticketsConfig.get("others_channels.logs");
                if (logsChannelId) {
                    const logsChannel = await interaction.guild.channels.cache.get(logsChannelId);
                    if (logsChannel) {
                        const transcript = await createTranscript(interaction.channel);

                        const titleEmbedLogs = ticketsConfig.get("others_embeds.embed_logs.title");
                        const descriptionPlaceholderLogs = ticketsConfig.get("others_embeds.embed_logs.description");
                        const colorEmbedLogs = ticketsConfig.get("others_embeds.embed_logs.color");
                        const imageEmbedLogs = ticketsConfig.get("others_embeds.embed_logs.image");
                        const footerEmbedLogs = ticketsConfig.get("others_embeds.embed_logs.footer");
                        const thumbnailEmbedLogs = ticketsConfig.get("others_embeds.embed_logs.thumbnail");

                        const replacePlaceholders = (description, replacements) => {
                            let replacedDescription = description;
                            for (const placeholder in replacements) {
                                if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
                                    replacedDescription = replacedDescription.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
                                }
                            }
                            return replacedDescription;
                        };

                        const closedDate = new Date();
                        const closedAt = Math.floor(closedDate.getTime() / 1000);

                        const ticketInfo = ticketsOpenedConfig.get(userId);
                        if (ticketInfo && ticketInfo.code === ticketCode) {
                            const replacements = {
                                user: user,
                                user_username: user.user.globalName,
                                user_id: user.id,
                                ticket_code: ticketCode,
                                category: ticketInfo.category,
                                closed_at: `<t:${closedAt}:F>`,
                                reason: m.content
                            };

                            const descriptionEmbedLogs = replacePlaceholders(descriptionPlaceholderLogs, replacements);

                            const embedLogs = new EmbedBuilder()
                                .setTitle(titleEmbedLogs)
                                .setDescription(descriptionEmbedLogs)
                                .setColor(colorEmbedLogs);

                            if (imageEmbedLogs) {
                                embedLogs.setImage(imageEmbedLogs);
                            }

                            if (footerEmbedLogs) {
                                embedLogs.setFooter({ text: footerEmbedLogs });
                            }

                            if (thumbnailEmbedLogs) {
                                embedLogs.setThumbnail(thumbnailEmbedLogs);
                            }

                            await logsChannel.send({ files: [transcript], embeds: [embedLogs] });
                        }
                    }
                }

                try {
                    await interaction.channel.delete();

                    ticketsOpenedConfig.delete(userId);
                } catch (error) {
                    console.log(error);
                }

                collectorMessage.stop();
            });
        }

        if (interaction.customId === "menu") {
            const userOwnerTicket = interaction.user;
            const ticketCode = generateCode();

            let dontHaveCategorys = categoriesConfig.get("categorys");

            if (!dontHaveCategorys || Object.keys(dontHaveCategorys).length === 0) {
                return await interaction.reply({
                    content: "Não há categorias disponíveis no momento.",
                    ephemeral: true
                });
            }

            const categories = Object.keys(dontHaveCategorys);

            const categoryOptions = categories.map(categoryName => {
                const categoryData = dontHaveCategorys[categoryName];
                const option = {
                    label: categoryName,
                    value: categoryName,
                    description: categoryData.description
                };

                if (categoryData.emoji) {
                    option.emoji = categoryData.emoji;
                }

                return option;
            });

            const messageCreated = await interaction.reply({
                content: "Criando seu ticket...",
                ephemeral: true
            });

            setTimeout(() => {
                interaction.guild.channels.create({
                    name: `ticket-${userOwnerTicket.username}`,
                    topic: `Ticket ID: ${ticketCode}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                            deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        },
                    ],
                }).then(async (channel) => {
                    messageCreated.edit({
                        content: `Seu ticket foi criado com sucesso! Clique no botão para acessá-lo:`,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel("Acessar meu ticket")
                                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
                            )
                        ],
                        ephemeral: true
                    });

                    const EmbedPreOpened = new EmbedBuilder()
                        .setAuthor({ name: "Selecione uma opção logo abaixo!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(formatLines([
                            `Para prosseguir com seu atendimento, é necessário você escolher uma categoria abaixo:`,
                        ]))
                        .setColor(config.color["no-clean"])

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('select-category')
                        .setPlaceholder('Selecione uma categoria')
                        .addOptions(categoryOptions);

                    const msgMenuSelect = await channel.send({
                        content: `<@${interaction.user.id}>`,
                        embeds: [EmbedPreOpened],
                        components: [new ActionRowBuilder().addComponents(selectMenu)]
                    });

                    const filter = i => i.customId === 'select-category' && i.user.id === interaction.user.id;
                    const collector = channel.createMessageComponentCollector({ filter, time: 15000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();
                        const chosenCategory = i.values[0];
                        const categoryData = dontHaveCategorys[chosenCategory];
                        const parentCategoryID = categoryData.parent ? categoryData.parent : null;
                        await channel.setParent(parentCategoryID);
                        await channel.permissionOverwrites.edit(userOwnerTicket.id, { ViewChannel: true, SendMessages: true, AttachFiles: true, ReadMessageHistory: true });
                        await channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false, SendMessages: false, AttachFiles: false });

                        ticketsOpenedConfig.set(`${userOwnerTicket.id}`, {
                            channel: channel.id,
                            code: ticketCode,
                            category: chosenCategory
                        });

                        const EmbedOpened = new EmbedBuilder()
                            .setAuthor({ name: "Seu ticket foi aberto com sucesso!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(formatLines([
                                `Olá ${userOwnerTicket.username}, seu ticket foi aberto com sucesso! Fique a vontade para falar com os membros de nossa equipe.`,
                                "",
                                ` > Usuário: ${userOwnerTicket}`,
                                ` > Horário: <t:${Math.floor(Date.now() / 1000)}:R>`,
                                ` > Categoria: ${categoryData.emoji} **${chosenCategory}**`,
                                "",
                                "Não mencione membros da equipe, aguarde um responsável."
                            ]))
                            .setColor(config.color["no-clean"]);

                        const row = new ActionRowBuilder();

                        row.addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Danger)
                                .setLabel("Sair do ticket")
                                .setCustomId(`leave-ticket-${userOwnerTicket.id}`),

                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Success)
                                .setLabel("Finalizar o ticket")
                                .setCustomId(`close-ticket-${userOwnerTicket.id}`)
                        );

                        const addManagerButton = settingsConfig.get("manager_button.enabled");

                        if (addManagerButton) {
                            row.addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel("Gerenciar")
                                    .setCustomId(`manage-${userOwnerTicket.id}-${ticketCode}`)
                            );
                        }

                        await msgMenuSelect.edit({ embeds: [EmbedOpened], components: [row] });

                        collector.stop();
                    });

                    collector.on('end', (reason) => {
                        if (reason === 'time') {
                            channel.delete();

                            ticketsOpenedConfig.delete(`${userOwnerTicket.id}`);
                        }
                    });
                });
            }, 3000);
        }
    }
}

function generateCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}