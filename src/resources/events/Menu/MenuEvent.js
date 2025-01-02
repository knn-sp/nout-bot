import { ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, ComponentType, EmbedBuilder, ModalBuilder, PermissionsBitField, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Event from "../../../base/Event.js"
import config from "../../config.json" with {type: 'json'};
import { JsonDatabase } from "wio.db";
import { createTranscript } from "thiscode-transcript";
import { formatLines } from "../../../functions/FormatLines.js";

const ticketsConfig = new JsonDatabase({ databasePath: "src/config/ticket_embed.json" });
const categoriesConfig = new JsonDatabase({ databasePath: "src/config/categories.json" });
const settingsConfig = new JsonDatabase({ databasePath: "src/config/settings.json" });

let msgCategoryEdit = [];

export default class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }

    async run(client, interaction) {
        if (!interaction.isSelectMenu()) return;

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

        const menuButton = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuButton")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Editar o texto do botão",
                        value: "text",
                        emoji: "📝"
                    },
                    {
                        label: "Definir o estilo do botão",
                        value: "style",
                        emoji: "🎨"
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        const menuCategory = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuCategory")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Vizualizar categorias",
                        value: "view",
                        emoji: "🗃️"
                    },
                    {
                        label: "Criar uma nova categoria",
                        value: "create",
                        emoji: "📂"
                    },
                    {
                        label: "Deletar uma categoria",
                        value: "delete",
                        emoji: "🗑️"
                    },
                    {
                        label: "Editar uma categoria",
                        value: "edit",
                        emoji: "✏️"
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        const rowChannelsConfig = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuChannelsConfig")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Alterar o canal de logs (transcripts)",
                        value: "logs",
                        emoji: "📝",
                        description: "Alterar o canal de logs (transcripts)"
                    },
                    {
                        label: "Resetar o canal de logs (transcripts)",
                        value: "reset_logs",
                        emoji: "🗑️",
                        description: "Resetar o canal de logs (transcripts)"
                    },
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        const rowMessagesLogs = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuMessagesLogs")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Alterar o titulo da embed",
                        value: "logs_title",
                        emoji: "📝",
                        description: "Alterar o titulo da embed do canal de logs (transcripts)"
                    },
                    {
                        label: "Alterar a descrição da embed",
                        value: "logs_desc",
                        emoji: "📝",
                        description: "Alterar a descrição da embed do canal de logs (transcripts)"
                    },
                    {
                        label: "Alterar a cor da embed",
                        value: "logs_color",
                        emoji: "🎨",
                        description: "Alterar a cor da embed do canal de logs (transcripts)"
                    },
                    {
                        label: "Adicionar uma imagem na embed",
                        value: "logs_image",
                        emoji: "🖼️",
                        description: "Adicionar uma imagem na embed do canal de logs (transcripts)"
                    },
                    {
                        label: "Adicionar uma thumbnail na embed",
                        value: "logs_thumbnail",
                        emoji: "🖼️",
                        description: "Adicionar uma thumbnail na embed do canal de logs (transcripts)"
                    },
                    {
                        label: "Adicionar um footer na embed",
                        value: "logs_footer",
                        emoji: "🧾",
                        description: "Adicionar um footer na embed do canal de logs (transcripts)"
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        const rowConfig = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuConfig")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Ativar ou desativar botão de gerenciamento de tickets",
                        value: "manage_status",
                        emoji: "💚",
                        description: "Ativar ou desativar botão de gerenciamento de tickets"
                    },
                    {
                        label: "Editar mensagems do canal de logs (transcripts)",
                        value: "edit_logs",
                        emoji: "✏️",
                        description: "Editar mensagems do canal de logs (transcripts)"
                    }
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        const rowPermissions = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menuPermissions")
                .setPlaceholder("Selecione uma opção")
                .addOptions([
                    {
                        label: "Adicionar cargos para usar funções staff",
                        value: "access_manager_button_roles",
                        emoji: "👓",
                        description: "Adicionar cargos para usar funções staff"
                    },
                    {
                        label: "Remover cargos que usam funções staff",
                        value: "remove_manager_button_roles",
                        emoji: "🗑️",
                        description: "Remover cargos que usam funções staff"
                    },
                ])
                .addOptions([
                    {
                        label: "Cancelar e voltar ao menu principal",
                        value: "voltarMenu",
                        emoji: "❌"
                    }
                ])
        )

        if (interaction.values[0] === "review") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    row
                ]
            });

            settingsConfig.set("review.enabled", !settingsConfig.get("review.enabled"));

            await interaction.reply({
                content: `O sistema de avaliação foi ${settingsConfig.get("review.enabled") ? "ativado" : "desativado"}.`,
                ephemeral: true
            });
        }

        // Permissions roles configuration
        if (interaction.values[0] === "permissions") {
            await interaction.deferUpdate();
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    rowPermissions
                ]
            });
        }

        if (interaction.values[0] === "access_manager_button_roles") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    rowPermissions
                ]
            });

            await interaction.reply({
                content: "Por favor, mencione todos os cargos aos quais deseja dar permissão no formato: @cargo1 @cargo2 @cargo3",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                const mentionedRoles = message.mentions.roles;
                const rolesData = {};

                message.delete();

                mentionedRoles.forEach(role => {
                    rolesData[role.id] = {
                        name: role.name,
                        id: role.id
                    };
                });

                settingsConfig.set("rolesData.access_button_manager", rolesData);

                await interaction.editReply({
                    content: formatLines([
                        "Agora os cargos abaixo tem permissão para utilizar o botão de gerenciamento de tickets:",
                        ...Object.values(rolesData).map(role => `• **${role.name}**`),
                    ]),
                    ephemeral: true
                });
            });
        }

        if (interaction.values[0] === "remove_manager_button_roles") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    rowPermissions
                ]
            });

            await interaction.reply({
                content: "Por favor, mencione todos os cargos aos quais deseja remover permissão no formato: @cargo1 @cargo2 @cargo3",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                const mentionedRoles = message.mentions.roles;
                const rolesData = settingsConfig.get("rolesData.access_button_manager");

                const rolesToRemove = [];
                const rolesNotRemoved = [];

                message.delete();

                mentionedRoles.forEach(role => {
                    if (rolesData[role.id]) {
                        rolesToRemove.push(role.id);
                    } else {
                        rolesNotRemoved.push(role.name);
                    }
                });

                rolesToRemove.forEach(roleId => {
                    delete rolesData[roleId];
                });

                settingsConfig.set("rolesData.access_button_manager", rolesData);

                const removedRolesNames = rolesToRemove.map(roleId => mentionedRoles.find(role => role.id === roleId).name);
                const notRemovedRolesNames = rolesNotRemoved;

                if (removedRolesNames.length > 0) {
                    await interaction.editReply({
                        content: formatLines([
                            "**Configuração de cargos com permissões de staff atualizada!**",
                            `As permissões para os cargos **${removedRolesNames.join(', ')}** foram removidas com sucesso.`,
                            `Cargos que não tinham permissões registradas: **${notRemovedRolesNames.join(', ')}**.`,
                        ]),
                        ephemeral: true
                    });
                }
            });
        }

        // Messages and buttons in the ticket
        if (interaction.values[0] === "config") {
            await interaction.deferUpdate();
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    rowConfig
                ]
            });
        }

        if (interaction.values[0] === "manage_status") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0],
                ],
                components: [
                    row
                ]
            });

            const checkStatusButtonManager = settingsConfig.get("manager_button.enabled");

            if (checkStatusButtonManager === false) {
                await interaction.reply({
                    content: "Botão de gerenciamento de tickets foi **ativado**.",
                    ephemeral: true
                });

                settingsConfig.set("manager_button.enabled", true);
            } else if (checkStatusButtonManager === true) {
                await interaction.reply({
                    content: "Botão de gerenciamento de tickets foi **desativado**.",
                    ephemeral: true
                });

                settingsConfig.set("manager_button.enabled", false);
            }
        }

        if (interaction.values[0] === "message") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, mencione o canal de texto.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                const channelMention = message.mentions.channels.first();
                message.delete();

                if (!channelMention) {
                    return await interaction.editReply({
                        content: "Por favor, mencione um canal de texto.",
                        ephemeral: true
                    });
                }

                const channel = interaction.guild.channels.cache.get(channelMention.id);

                if (!channel) {
                    return await interaction.editReply({
                        content: "Por favor, mencione um canal de texto.",
                        ephemeral: true
                    });
                }

                if (channel.type !== ChannelType.GuildText) {
                    return await interaction.editReply({
                        content: "Por favor, mencione um canal de texto.",
                        ephemeral: true
                    });
                }

                let titleEmbed = ticketsConfig.get("title");
                let descEmbed = ticketsConfig.get("description");
                let colorEmbed = ticketsConfig.get("color");
                let imageEmbed = ticketsConfig.get("image");
                let footerEmbed = ticketsConfig.get("footer");
                let thumbnailEmbed = ticketsConfig.get("thumbnail");

                let buttonTitle = ticketsConfig.get("button.text");
                let buttonStyle = ticketsConfig.get("button.style");

                const Embed = new EmbedBuilder()
                    .setTitle(titleEmbed)
                    .setDescription(descEmbed)
                    .setColor(colorEmbed)

                if (imageEmbed) {
                    Embed.setImage(imageEmbed)
                } else if (thumbnailEmbed) {
                    Embed.setThumbnail(thumbnailEmbed)
                } else if (footerEmbed) {
                    Embed.setFooter(footerEmbed)
                }

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(buttonTitle || "Abrir Ticket")
                            .setStyle(buttonStyle || ButtonStyle.Primary)
                    )

                const existingTicket = ticketsConfig.get(`channel`);

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                await existingMessage.delete();
                            } else {
                                console.error("Mensagem existente não encontrada.");
                            }
                        } catch (error) {
                            console.error("Erro ao buscar mensagem existente:", error);
                        }
                    } else {
                        console.error("Canal existente não encontrado.");
                    }
                }

                channel.send({
                    embeds: [Embed],
                    components: [ButtonRow]
                }).then(msg => {
                    let saveChannelAndMessageID = {
                        channelId: channelMention.id,
                        messageId: msg.id
                    }

                    ticketsConfig.set(`channel`, saveChannelAndMessageID);
                })

                interaction.editReply({
                    content: `O ticket foi enviado para o canal ${channelMention}.`,
                });
            });
        }

        if (interaction.values[0] === "title") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o novo titulo.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newTitle = message.content;

                if (!newTitle) {
                    return await interaction.editReply({
                        content: "Por favor, digite o novo titulo.",
                        ephemeral: true
                    });
                }

                ticketsConfig.set("title", newTitle);

                let existingTicket = ticketsConfig.get(`channel`);
                let buttonTitle = ticketsConfig.get("button.text");
                let buttonStyle = ticketsConfig.get("button.style");

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(buttonTitle || "Abrir Ticket")
                            .setStyle(buttonStyle || ButtonStyle.Primary)
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)
                                            .setTitle(newTitle);

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                } else {
                                    console.error("A mensagem existente não possui um embed válido.");
                                }
                            } else {
                                console.error("Mensagem existente não encontrada.");
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `O novo titulo foi definido como **${newTitle}**.`,
                });
            })
        }

        if (interaction.values[0] === "desc") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite a nova descrição do ticket. *(limite de 1024 caracteres e 2 minutos de resposta)*",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newDesc = message.content;

                if (!newDesc) {
                    return await interaction.editReply({
                        content: "Por favor, digite a nova descrição.",
                        ephemeral: true
                    });
                }

                ticketsConfig.set("description", newDesc);

                let existingTicket = ticketsConfig.get(`channel`);
                let buttonTitle = ticketsConfig.get("button.text");
                let buttonStyle = ticketsConfig.get("button.style");

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(buttonTitle || "Abrir Ticket")
                            .setStyle(buttonStyle || ButtonStyle.Primary)
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)
                                            .setDescription(newDesc);

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `A nova descrição foi definida como **${newDesc}**.`,
                    ephemeral: true
                });
            })
        }

        if (interaction.values[0] === "color") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite a nova cor do ticket. *(hexadecimal #000000)*",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newColor = message.content;

                const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (!hexColorRegex.test(newColor)) {
                    return await interaction.editReply({
                        content: "Por favor, digite uma cor hexadecimal válida.",
                        ephemeral: true
                    });
                }

                ticketsConfig.set("color", newColor);

                let existingTicket = ticketsConfig.get(`channel`);
                let buttonTitle = ticketsConfig.get("button.text");
                let buttonStyle = ticketsConfig.get("button.style");

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(buttonTitle || "Abrir Ticket")
                            .setStyle(buttonStyle || ButtonStyle.Primary)
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)
                                            .setColor(newColor);

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `A nova cor do ticket foi definida como **${newColor}**.`,
                    ephemeral: true
                });
            })

        }

        if (interaction.values[0] === "banner") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o link da nova imagem.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newBanner = message.content;

                if (newBanner === "null") {
                    ticketsConfig.set("image", null);
                } else {
                    ticketsConfig.set("image", newBanner);
                }

                let existingTicket = ticketsConfig.get(`channel`);

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(ticketsConfig.get("button.text"))
                            .setStyle(ticketsConfig.get("button.style"))
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)

                                        if (newBanner === "null") {
                                            updatedEmbed.setImage(null);
                                        } else {
                                            updatedEmbed.setImage(newBanner);
                                        }

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `A nova imagem do banner do ticket foi definida como **${newBanner === "null" ? "nenhuma" : newBanner}**.`,
                    ephemeral: true
                });
            })
        }

        if (interaction.values[0] === "thumbnail") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o link da nova imagem de thumbnail.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newThumbnail = message.content;

                ticketsConfig.set("thumbnail", newThumbnail);

                let existingTicket = ticketsConfig.get(`channel`);

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(ticketsConfig.get("button.text"))
                            .setStyle(ticketsConfig.get("button.style"))
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)

                                        if (newThumbnail === "null") {
                                            updatedEmbed.setThumbnail(null);
                                        } else {
                                            updatedEmbed.setThumbnail(newThumbnail);
                                        }

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `A nova imagem de thumbnail do ticket foi definida como **${newThumbnail === "null" ? "nenhuma" : newThumbnail}**.`,
                    ephemeral: true
                });
            })
        }

        if (interaction.values[0] === "footer") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o texto do rodapé.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],
                    components: [
                        row
                    ]
                });

                message.delete();
                const newFooter = message.content;

                ticketsConfig.set("footer", newFooter);

                let existingTicket = ticketsConfig.get(`channel`);

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(ticketsConfig.get("button.text"))
                            .setStyle(ticketsConfig.get("button.style"))
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        const existingEmbed = existingMessage.embeds[0];
                                        const updatedEmbed = new EmbedBuilder(existingEmbed)

                                        if (newFooter === "null") {
                                            updatedEmbed.setFooter(null);
                                        } else {
                                            updatedEmbed.setFooter({ text: newFooter });
                                        }

                                        await existingMessage.edit({
                                            embeds: [
                                                updatedEmbed,
                                            ],

                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                interaction.editReply({
                    content: `O novo rodapé do ticket foi definido como **${newFooter === "null" ? "nenhuma" : newFooter}**.`,
                    ephemeral: true
                });
            })
        }

        // Button configuration
        if (interaction.values[0] === "button") {
            await interaction.deferUpdate();

            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });

            interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuButton
                ]
            });
        }

        if (interaction.values[0] === "text") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuButton
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o texto do botão.",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                await interaction.message.edit({
                    embeds: [
                        interaction.message.embeds[0],
                    ],

                    components: [
                        menuButton
                    ]
                });

                message.delete();
                const newButtonText = message.content;

                ticketsConfig.set("button.text", newButtonText);

                let existingTicket = ticketsConfig.get(`channel`);

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(ticketsConfig.get("button.text"))
                            .setStyle(ticketsConfig.get("button.style"))
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        existingMessage.edit({
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }
            });
        }

        if (interaction.values[0] === "style") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuButton
                ]
            });

            const buttonStyles = [
                ButtonStyle.Primary,
                ButtonStyle.Secondary,
                ButtonStyle.Success,
                ButtonStyle.Danger
            ];

            const rowStyles = new ActionRowBuilder();

            buttonStyles.forEach((style) => {
                const styleString = style.toString();
                rowStyles.addComponents(
                    new ButtonBuilder()
                        .setCustomId(styleString)
                        .setLabel(styleString)
                        .setStyle(style)
                );
            });

            await interaction.reply({
                content: "Por favor, escolha o estilo do botão:",
                components: [rowStyles],
                ephemeral: true
            });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (buttonInteraction) => {
                const chosenStyle = buttonInteraction.customId;

                ticketsConfig.set("button.style", chosenStyle);

                let existingTicket = ticketsConfig.get(`channel`);

                const ButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("menu")
                            .setLabel(ticketsConfig.get("button.text"))
                            .setStyle(ticketsConfig.get("button.style"))
                    )

                if (existingTicket) {
                    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);

                    if (existingChannel) {
                        try {
                            const existingMessage = await existingChannel.messages.fetch(existingTicket.messageId);

                            if (existingMessage) {
                                if (existingMessage.embeds.length > 0 && existingMessage.embeds[0] !== null) {
                                    try {
                                        existingMessage.edit({
                                            components: [
                                                ButtonRow
                                            ]
                                        });
                                    } catch (error) {
                                        console.error("Erro ao editar mensagem existente:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao editar mensagem existente:", error);
                        }
                    }
                }

                await buttonInteraction.update({
                    content: "Estilo do botão atualizado.",
                    ephemeral: true,
                    components: []
                });
            });
        }

        // Category configuration
        if (interaction.values[0] === "category") {
            await interaction.deferUpdate();

            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuCategory
                ]
            });
        }

        if (interaction.values[0] === "view") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],                
                components: [
                    menuCategory
                ]
            });        
            
            const categorys = categoriesConfig.get(`categorys`);
            
            if (categorys) {
                const categoryNames = Object.keys(categorys);
                if (categoryNames.length > 0) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: "Categorias", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setDescription(categoryNames.map((name) => `${categorys[name].emoji || ""} **${name}**\nDescrição: \`${categorys[name].description || "Sem descrição"}\`\nID da categoria de abertura: \`${categorys[name].parent || "Nenhuma"}\``).join("\n\n"))
                                .setColor("Green")
                        ],
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: "Nenhuma categoria cadastrada.",
                        ephemeral: true
                    });
                }
            }
        }

        if (interaction.values[0] === "create") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuCategory
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o nome da nova categoria. *(Ex: Dúvidas)*",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                const name = message.content;
                message.delete();

                if (!name) {
                    return await interaction.editReply({
                        content: "Por favor, digite o nome da nova categoria. *(Ex: Dúvidas)*",
                        ephemeral: true
                    });
                }

                const checkNameExists = categoriesConfig.get(`categorys`);
                if (checkNameExists && checkNameExists[name]) {
                    return await interaction.editReply({
                        content: "Esta categoria já existe!",
                        ephemeral: true
                    });
                } else {
                    let createCategory = {
                        name,
                        emoji: "",
                        description: `Descrição da categoria ${name}.`,
                        parent: ""
                    };

                    categoriesConfig.set(`categorys.${name}`, createCategory);

                    await interaction.editReply({
                        content: `A nova categoria **${name}** foi criada com sucesso! Por favor, configure-a na opção de **Editar categoria** antes de usar o sistema.`,
                        ephemeral: true
                    });
                }
            })
        }

        if (interaction.values[0] === "delete") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    menuCategory
                ]
            });

            await interaction.reply({
                content: "Por favor, digite o nome da categoria que deseja apagar. *(Ex: Dúvidas)*",
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            collector.on('collect', async (message) => {
                const name = message.content;
                message.delete();

                if (!name) {
                    return await interaction.editReply({
                        content: "Por favor, digite o nome da categoria que deseja apagar. *(Ex: Dúvidas)*",
                        ephemeral: true
                    });
                }

                const checkNameExists = categoriesConfig.get(`categorys`);

                if (!checkNameExists || !checkNameExists[name]) {
                    return await interaction.editReply({
                        content: "Esta categoria não existe!",
                        ephemeral: true
                    });
                } else {
                    categoriesConfig.delete(`categorys.${name}`);

                    await interaction.editReply({
                        content: `A categoria **${name}** foi apagada com sucesso!`,
                        ephemeral: true
                    });
                }
            })
        }

        if (interaction.values[0] === "edit") {
            await interaction.deferUpdate();
            const categories = categoriesConfig.get("categorys");

            if (!categories || Object.keys(categories).length === 0) {
                await interaction.editReply({
                    content: "Não há categorias disponíveis para edição.",
                    ephemeral: true
                });
                return;
            }

            const categoryNames = Object.keys(categories);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("editCategory")
                .setPlaceholder("Selecione uma categoria para editar");

            categoryNames.forEach((categoryName) => {
                const category = categories[categoryName];
                let optionLabel = categoryName;
                let options = {
                    label: optionLabel,
                    value: categoryName,
                    description: category.description
                };

                if (category.emoji) {
                    options.emoji = category.emoji;
                }

                selectMenu.addOptions(options);
            });

            selectMenu.addOptions({
                label: "Cancelar e voltar ao menu principal",
                value: "voltarMenu",
                emoji: "❌"
            });

            await interaction.message.edit({
                embeds: [interaction.message.embeds[0]],
                components: [new ActionRowBuilder().addComponents(selectMenu)]
            });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === "editCategory") {
                    const chosenCategory = buttonInteraction.values[0];

                    interaction.message.edit({
                        embeds: [
                            interaction.message.embeds[0]
                        ],
                        components: [
                            menuCategory
                        ]
                    });

                    const Embed = new EmbedBuilder()
                        .setTitle(`Categoria selecionada: ${chosenCategory}`)
                        .setDescription(formatLines([
                            `Acompanhe as informações dessa categoria abaixo, e o que pode ser editado.`,
                            "",
                            ` **Nome:** ${chosenCategory}`,
                            ` **Emoji:** ${categories[chosenCategory].emoji || "nenhum"}`,
                            ` **Descricão:** ${categories[chosenCategory].description}`,
                            ` **Categoria de abertura:** ${categories[chosenCategory].parent || "nenhum"}`,
                        ]))
                        .setColor(config.color["no-clean"]);

                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`editCategory-${chosenCategory}`)
                            .setPlaceholder("Selecione uma opção")
                            .addOptions([
                                {
                                    label: "Nome",
                                    value: "nameCategory",
                                    description: "Alterar o nome da categoria",
                                    emoji: "✏️"
                                },
                                {
                                    label: "Emoji",
                                    value: "emojiCategory",
                                    description: "Alterar o emoji da categoria",
                                    emoji: "🎨"
                                },
                                {
                                    label: "Descricão",
                                    value: "descriptionCategory",
                                    description: "Alterar a descricão da categoria",
                                    emoji: "📝"
                                },
                                {
                                    label: "Categoria de abertura",
                                    value: "parentCategory",
                                    description: "Alterar a categoria de abertura da categoria",
                                    emoji: "🔗"
                                }
                            ])
                    )

                    msgCategoryEdit = await buttonInteraction.reply({ embeds: [Embed], components: [row], ephemeral: true });
                }
            });
        }

        if (interaction.customId.startsWith("editCategory-")) {
            const chosenCategory = interaction.customId.split("-")[1];
            const valueSelected = interaction.values[0];


            if (valueSelected === "nameCategory") {
                const currentCategory = categoriesConfig.get(`categorys.${chosenCategory}`);

                if (!currentCategory) {
                    await interaction.editReply({
                        content: "Categoria não encontrada.",
                        ephemeral: true
                    });
                    return;
                }

                const filter = (m) => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

                await interaction.reply({
                    content: `Por favor, digite o novo nome da categoria **${chosenCategory}**.`,
                    ephemeral: true
                });

                collector.on('collect', async (message) => {
                    const newName = message.content.trim();
                    message.delete();

                    if (!newName) {
                        await interaction.editReply({
                            content: "Por favor, forneça um nome válido para a categoria.",
                            ephemeral: true
                        });
                        return;
                    }

                    categoriesConfig.set(`categorys.${newName}`, currentCategory);
                    categoriesConfig.set(`categorys.${newName}.name`, newName);
                    categoriesConfig.delete(`categorys.${chosenCategory}`);

                    await interaction.editReply({
                        content: `Nome da categoria **${chosenCategory}** alterado para **${newName}**.`,
                        ephemeral: true
                    });

                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`editCategory-${newName}`)
                            .setPlaceholder("Selecione uma opção")
                            .addOptions([
                                {
                                    label: "Nome",
                                    value: "nameCategory",
                                    description: "Alterar o nome da categoria",
                                    emoji: "✏️"
                                },
                                {
                                    label: "Emoji",
                                    value: "emojiCategory",
                                    description: "Alterar o emoji da categoria",
                                    emoji: "🎨"
                                },
                                {
                                    label: "Descricão",
                                    value: "descriptionCategory",
                                    description: "Alterar a descricão da categoria",
                                    emoji: "📝"
                                },
                                {
                                    label: "Categoria de abertura",
                                    value: "parentCategory",
                                    description: "Alterar a categoria de abertura da categoria",
                                    emoji: "🔗"
                                }
                            ])
                    )

                    const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
                        .setTitle(`Categoria selecionada: ${newName}`)
                        .setDescription(formatLines([
                            `Acompanhe as informações dessa categoria abaixo, e o que pode ser editado.`,
                            "",
                            ` **Nome:** ${newName}`,
                            ` **Emoji:** ${categoriesConfig.get(`categorys.${newName}.emoji`) || "nenhum"}`,
                            ` **Descricão:** ${categoriesConfig.get(`categorys.${newName}.description`)}`,
                            ` **Categoria de abertura:** ${categoriesConfig.get(`categorys.${newName}.parent`) || "nenhum"}`,
                        ]));

                    await msgCategoryEdit.edit({
                        embeds: [newEmbed],
                        components: [row]
                    });
                });
            }

            if (valueSelected === "emojiCategory") {
                const currentCategory = categoriesConfig.get(`categorys.${chosenCategory}`);

                if (!currentCategory) {
                    await interaction.editReply({
                        content: "Categoria não encontrada.",
                        ephemeral: true
                    });
                    return;
                }

                const filter = (m) => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

                await interaction.reply({
                    content: `Por favor, digite o novo emoji da categoria **${chosenCategory}**.`,
                    ephemeral: true
                });

                collector.on('collect', async (message) => {
                    const newEmoji = message.content.trim();
                    message.delete();

                    if (!newEmoji || !isValidEmoji(newEmoji)) {
                        await interaction.editReply({
                            content: "Por favor, forneça um emoji válido para a categoria.",
                            ephemeral: true
                        });
                        return;
                    }

                    categoriesConfig.set(`categorys.${chosenCategory}.emoji`, newEmoji);

                    await interaction.editReply({
                        content: `Emoji da categoria **${chosenCategory}** alterado para **${newEmoji}**.`,
                        ephemeral: true
                    });

                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`editCategory-${chosenCategory}`)
                            .setPlaceholder("Selecione uma opção")
                            .addOptions([
                                {
                                    label: "Nome",
                                    value: "nameCategory",
                                    description: "Alterar o nome da categoria",
                                    emoji: "✏️"
                                },
                                {
                                    label: "Emoji",
                                    value: "emojiCategory",
                                    description: "Alterar o emoji da categoria",
                                    emoji: "🎨"
                                },
                                {
                                    label: "Descricão",
                                    value: "descriptionCategory",
                                    description: "Alterar a descricão da categoria",
                                    emoji: "📝"
                                },
                                {
                                    label: "Categoria de abertura",
                                    value: "parentCategory",
                                    description: "Alterar a categoria de abertura da categoria",
                                    emoji: "🔗"
                                }
                            ])
                    )

                    const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
                        .setTitle(`Categoria selecionada: ${chosenCategory}`)
                        .setDescription(formatLines([
                            `Acompanhe as informações dessa categoria abaixo, e o que pode ser editado.`,
                            "",
                            ` **Nome:** ${chosenCategory}`,
                            ` **Emoji:** ${categoriesConfig.get(`categorys.${chosenCategory}.emoji`) || "nenhum"}`,
                            ` **Descricão:** ${categoriesConfig.get(`categorys.${chosenCategory}.description`)}`,
                            ` **Categoria de abertura:** ${categoriesConfig.get(`categorys.${chosenCategory}.parent`) || "nenhum"}`,
                        ]));

                    await msgCategoryEdit.edit({
                        embeds: [newEmbed],
                        components: [row]
                    });
                });
            }

            if (valueSelected === "descriptionCategory") {
                const currentCategory = categoriesConfig.get(`categorys.${chosenCategory}`);

                if (!currentCategory) {
                    await interaction.editReply({
                        content: "Categoria não encontrada.",
                        ephemeral: true
                    });
                    return;
                }

                const filter = (m) => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

                await interaction.reply({
                    content: `Por favor, digite a nova descricão da categoria **${chosenCategory}**. *(máximo de 150 caracteres)*`,
                    ephemeral: true
                });

                collector.on('collect', async (message) => {
                    const newDescription = message.content.trim();
                    message.delete();

                    if (newDescription.length > 150) {
                        await interaction.editReply({
                            content: "Por favor, forneça uma descricão de no maximo 150 caracteres.",
                            ephemeral: true
                        });
                    }

                    categoriesConfig.set(`categorys.${chosenCategory}.description`, newDescription);

                    await interaction.editReply({
                        content: `Descricão da categoria **${chosenCategory}** alterada para **${newDescription}**.`,
                        ephemeral: true
                    });

                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`editCategory-${chosenCategory}`)
                            .setPlaceholder("Selecione uma opção")
                            .addOptions([
                                {
                                    label: "Nome",
                                    value: "nameCategory",
                                    description: "Alterar o nome da categoria",
                                    emoji: "✏️"
                                },
                                {
                                    label: "Emoji",
                                    value: "emojiCategory",
                                    description: "Alterar o emoji da categoria",
                                    emoji: "🎨"
                                },
                                {
                                    label: "Descricão",
                                    value: "descriptionCategory",
                                    description: "Alterar a descricão da categoria",
                                    emoji: "📝"
                                },
                                {
                                    label: "Categoria de abertura",
                                    value: "parentCategory",
                                    description: "Alterar a categoria de abertura da categoria",
                                    emoji: "🔗"
                                }
                            ])
                    )

                    const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
                        .setTitle(`Categoria selecionada: ${chosenCategory}`)
                        .setDescription(formatLines([
                            `Acompanhe as informações dessa categoria abaixo, e o que pode ser editado.`,
                            "",
                            ` **Nome:** ${chosenCategory}`,
                            ` **Emoji:** ${categoriesConfig.get(`categorys.${chosenCategory}.emoji`) || "nenhum"}`,
                            ` **Descricão:** ${categoriesConfig.get(`categorys.${chosenCategory}.description`)}`,
                            ` **Categoria de abertura:** ${categoriesConfig.get(`categorys.${chosenCategory}.parent`) || "nenhum"}`,
                        ]));

                    await msgCategoryEdit.edit({
                        embeds: [newEmbed],
                        components: [row]
                    });
                })
            }

            if (valueSelected === "parentCategory") {
                const currentCategory = categoriesConfig.get(`categorys.${chosenCategory}`);

                if (!currentCategory) {
                    await interaction.editReply({
                        content: "Categoria não encontrada.",
                        ephemeral: true
                    });
                    return;
                }

                const filter = (m) => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

                await interaction.reply({
                    content: `Por favor, mencione ou envie o nome da nova categoria de abertura da categoria **${chosenCategory}**.`,
                    ephemeral: true
                });

                collector.on('collect', async (message) => {
                    let mentionedChannel;
                    message.delete();

                    if (message.mentions.channels.size > 0) {
                        mentionedChannel = message.mentions.channels.first();
                    } else {
                        const categoryName = message.content.trim();
                        mentionedChannel = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name === categoryName);
                    }

                    if (!mentionedChannel || mentionedChannel.type !== ChannelType.GuildCategory) {
                        await interaction.editReply({
                            content: "Por favor, mencione uma categoria válida.",
                            ephemeral: true
                        });
                        return;
                    }

                    categoriesConfig.set(`categorys.${chosenCategory}.parent`, mentionedChannel.id);

                    await interaction.editReply({
                        content: `Categoria de abertura da categoria **${chosenCategory}** alterada para **${mentionedChannel.name}**.`,
                        ephemeral: true
                    });

                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`editCategory-${chosenCategory}`)
                            .setPlaceholder("Selecione uma opção")
                            .addOptions([
                                {
                                    label: "Nome",
                                    value: "nameCategory",
                                    description: "Alterar o nome da categoria",
                                    emoji: "✏️"
                                },
                                {
                                    label: "Emoji",
                                    value: "emojiCategory",
                                    description: "Alterar o emoji da categoria",
                                    emoji: "🎨"
                                },
                                {
                                    label: "Descricão",
                                    value: "descriptionCategory",
                                    description: "Alterar a descricão da categoria",
                                    emoji: "📝"
                                },
                                {
                                    label: "Categoria de abertura",
                                    value: "parentCategory",
                                    description: "Alterar a categoria de abertura da categoria",
                                    emoji: "🔗"
                                }
                            ])
                    )

                    const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
                        .setTitle(`Categoria selecionada: ${chosenCategory}`)
                        .setDescription(formatLines([
                            `Acompanhe as informações dessa categoria abaixo, e o que pode ser editado.`,
                            "",
                            ` **Nome:** ${chosenCategory}`,
                            ` **Emoji:** ${categoriesConfig.get(`categorys.${chosenCategory}.emoji`) || "nenhum"}`,
                            ` **Descricão:** ${categoriesConfig.get(`categorys.${chosenCategory}.description`)}`,
                            ` **Categoria de abertura:** ${categoriesConfig.get(`categorys.${chosenCategory}.parent`) || "nenhum"}`,
                        ]));

                    await msgCategoryEdit.edit({
                        embeds: [newEmbed],
                        components: [row]
                    });
                });
            }
        }

        // Channels configuration
        if (interaction.values[0] === "channel") {
            await interaction.deferUpdate();
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowChannelsConfig
                ]
            });
        }

        // Message Logs configuration
        if (interaction.values[0] === "edit_logs") {
            await interaction.deferUpdate();
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });
        }

        if (interaction.values[0] === "logs_title") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

            await interaction.reply({
                content: formatLines([
                    `Por favor, digite o novo título para os logs. *(apenas texto)*`,
                ]),
                ephemeral: true
            });

            collector.on('collect', async (message) => {
                message.delete();

                const newTitle = message.content.trim();

                ticketsConfig.set("others_embeds.embed_logs.title", newTitle);

                await interaction.editReply({
                    content: `Novo título para os logs alterado para **${newTitle}**.`,
                    ephemeral: true
                });
            })
        } else if (interaction.values[0] === "logs_desc") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

            await interaction.reply({
                content: formatLines([
                    `Por favor, digite a nova descricão para os logs. *(apenas texto)*`,
                    `**Placeholders**:`,
                    `{user} retorna o nome do usuário`,
                    `{ticket_code} retorna o ID do ticket`,
                    `{category} retorna o nome da categoria que foi aberto`,
                ]),
                ephemeral: true
            });

            collector.on('collect', async (message) => {
                message.delete();

                const newDesc = message.content.trim();

                ticketsConfig.set("others_embeds.embed_logs.description", newDesc);

                await interaction.editReply({
                    content: `Nova descrição para os logs alterada para **${newDesc}**.`,
                    ephemeral: true
                });
            })
        } else if (interaction.values[0] === "logs_color") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });
        
            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });
        
            await interaction.reply({
                content: formatLines([
                    `Por favor, digite a nova cor para os logs. *(apenas hex code)*`,
                ]),
                ephemeral: true
            });
        
            collector.on('collect', async (message) => {
                message.delete();
        
                const newColor = message.content.trim();
        
                const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
                if (!hexRegex.test(newColor)) {
                    await interaction.editReply({
                        content: `Por favor, forneça um código hexadecimal válido.`,
                        ephemeral: true
                    });
                    return;
                }
        
                ticketsConfig.set("others_embeds.embed_logs.color", newColor);
        
                await interaction.editReply({
                    content: `Nova cor para os logs alterada para **${newColor}**.`,
                    ephemeral: true
                });
            });
        } else if (interaction.values[0] === "logs_footer") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

            await interaction.reply({
                content: formatLines([
                    `Por favor, digite o novo rodapé para os logs. *(apenas texto)*`,
                ]),
                ephemeral: true
            });

            collector.on('collect', async (message) => {
                message.delete();

                const newFooter = message.content.trim();

                if (newFooter === "null") {
                    ticketsConfig.set("others_embeds.embed_logs.footer", null);
                } else {
                    ticketsConfig.set("others_embeds.embed_logs.footer", newFooter);
                }

                await interaction.editReply({
                    content: `Novo rodapé para os logs alterado para **${newFooter ? newFooter : "nenhum"}**.`,
                    ephemeral: true
                });
            });
        } else if (interaction.values[0] === "logs_thumbnail") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });
        
            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });
        
            await interaction.reply({
                content: formatLines([
                    `Por favor, digite o novo thumbnail para os logs ou envie uma imagem.`,
                ]),
                ephemeral: true
            });
        
            collector.on('collect', async (message) => {
                message.delete();
        
                let newThumbnail;
        
                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    newThumbnail = attachment.url;
                } else {
                    const content = message.content.trim();
                    if (content.startsWith('http') || content.startsWith('https')) {
                        newThumbnail = content;
                    }
                }
        
                if (!newThumbnail) {
                    await interaction.editReply({
                        content: `Por favor, forneça uma imagem válida ou uma URL.`,
                        ephemeral: true
                    });
                    return;
                }

                if (message.content === "null") {
                    ticketsConfig.set("others_embeds.embed_logs.thumbnail", null);
                } else {
                    ticketsConfig.set("others_embeds.embed_logs.thumbnail", newThumbnail);
                }
        
                await interaction.editReply({
                    content: `Novo thumbnail para os logs alterado.`,
                    ephemeral: true
                });
            });
        } else if (interaction.values[0] === "logs_image") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowMessagesLogs
                ]
            });
            
            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

            await interaction.reply({
                content: formatLines([
                    `Por favor, digite o novo imagem para os logs ou envie uma imagem.`,
                ]),
                ephemeral: true
            });

            collector.on('collect', async (message) => {
                message.delete();

                let newImage;

                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    newImage = attachment.url;
                } else {
                    const content = message.content.trim();
                    if (content.startsWith('http') || content.startsWith('https')) {
                        newImage = content;
                    }
                }

                if (!newImage) {
                    await interaction.editReply({
                        content: `Por favor, forneça uma imagem válida ou uma URL.`,
                        ephemeral: true
                    });
                }

                if (message.content === "null") {
                    ticketsConfig.set("others_embeds.embed_logs.image", null);
                } else {
                    ticketsConfig.set("others_embeds.embed_logs.image", newImage);
                }

                await interaction.editReply({
                    content: `Novo imagem para os logs alterado.`,
                    ephemeral: true
                });
            })
        }

        if (interaction.values[0] === "logs") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowChannelsConfig
                ]
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1 });

            await interaction.reply({
                content: `Por favor, mencione o canal de logs. *(apenas canais de texto)*`,
                ephemeral: true
            });

            collector.on('collect', async (message) => {
                let mentionedChannel;
                message.delete();

                if (message.mentions.channels.size > 0) {
                    mentionedChannel = message.mentions.channels.first();
                } else {
                    mentionedChannel = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildText && channel.name === message.content.trim());
                }

                if (!mentionedChannel || mentionedChannel.type !== ChannelType.GuildText) {
                    await interaction.editReply({
                        content: "Canal de logs não encontrado ou inválido.",
                        ephemeral: true
                    });
                    return;
                }

                let insertOthersChannel = {
                    logs: mentionedChannel.id
                }

                ticketsConfig.set("others_channels", insertOthersChannel);

                await interaction.editReply({
                    content: `Canal de logs alterado para **${mentionedChannel.name}**.`,
                    ephemeral: true
                });
            });
        }

        if (interaction.values[0] === "reset_logs") {
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    rowChannelsConfig
                ]
            });

            if (ticketsConfig.get("others_channels").logs) {
                let insertOthersChannel = {
                    logs: null
                }

                ticketsConfig.set("others_channels", insertOthersChannel);

                await interaction.reply({
                    content: `Canal de logs resetado.`,
                    ephemeral: true
                });
            }
        }

        // CANCEL AND DELETE MENU
        if (interaction.values[0] === "cance") {
            await interaction.deferUpdate();
            await interaction.message.delete();
        }

        if (interaction.values[0] === "voltarMenu") {
            await interaction.deferUpdate();
            await interaction.message.edit({
                embeds: [
                    interaction.message.embeds[0]
                ],
                components: [
                    row
                ]
            });
        }
    }
}

function isValidEmoji(emoji) {
    return /^<a?:.+:\d+>$/.test(emoji) || /^[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(emoji);
}