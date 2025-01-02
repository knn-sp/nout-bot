import { Client, Collection } from "discord.js";
import { readdir } from 'node:fs/promises';
import config from "../resources/config.json" with {type: 'json'};
import ClientOptions from './ClientOptions.js';
import { setTimeout as sleep } from 'node:timers/promises';

export default class ThisCode extends Client {
    constructor() {
        super(ClientOptions);

        this.commands = new Collection();
        this.dbConnection = null;
    }

    async loadCommands(client) {
        const categories = await readdir('./src/resources/interactions');

        for await (const category of categories) {
            const commands = await readdir(`./src/resources/interactions/${category}`);

            for (const command of commands) {
                const { default: CommandClass } = await import(`../resources/interactions/${category}/${command}`);
                const cmd = new CommandClass(client);

                client.commands.set(cmd.name, cmd);
            }
        }
    }

    async loadEvents(client) {
        const categories = await readdir('./src/resources/events');

        for await (const category of categories) {
            const events = await readdir(`./src/resources/events/${category}`);

            for (const event of events) {
                const { default: EventClass } = await import(`../resources/events/${category}/${event}`);
                const evt = new EventClass(client);

                client.on(evt.name, (...args) => evt.run(client, ...args));
            }
        }
    }

    async connect() {
        await sleep(1_000);
        this.loadCommands(this);
        this.loadEvents(this);

        await sleep(2_500);
        super.login(config.token);
    }
}