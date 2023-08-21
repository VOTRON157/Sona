import { Event } from "./Event"
import { Debug } from "./Debug"
import { readdirSync} from "fs"
import {join} from "path"
import { CustomClient } from "./Client"

const debug = new Debug()

class EventsManager {
    events = new Map<string, Event>()
    constructor(readonly eventsFolder: string, readonly client: CustomClient){

    }
    async loadEvents() {
        try {
            debug.Alert("Começando a carregar os eventos.")
            const eventsName = readdirSync(join(__dirname, '..', this.eventsFolder))
            eventsName.forEach(async (event) => {
                const { default: EventClass } = await import(join(__dirname, '..', this.eventsFolder, event))
                const eventInstance = new EventClass(this.client);
                if(eventInstance instanceof Event) {
                    this.client.on(eventInstance.name as any, (...args: any) => eventInstance.execute(...args))
                    this.events.set(eventInstance.name, eventInstance)
                    debug.Log(`O evento "${eventInstance.name}" foi carregado.`)
                }
            })
        } catch (error){
            if (error instanceof Error) debug.Error(`Ocorreu um erro ao carregar os eventos. Erro: ${error.message}`)
        }
    }
}

export {
    EventsManager
}