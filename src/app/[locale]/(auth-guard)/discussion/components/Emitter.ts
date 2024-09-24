type Listener = (...args: any[]) => void;

class Emitter {
    private events: { [key: string]: Listener[] } = {};

    // Register a listener for a specific event
    on(eventName: string, listener: Listener): void {
        // console.log("subscribed to", eventName);
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    // Emit an event and call all listeners with provided arguments
    emit(eventName: string, ...args: any[]): void {
        // console.debug("emitting", eventName, args);
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }

    // Unregister a specific listener or all listeners for an event
    off(eventName: string, listener?: Listener): void {
        if (!this.events[eventName]) return;

        if (!listener) {
            delete this.events[eventName]; // Remove all listeners for the event
        } else {
            this.events[eventName] = this.events[eventName].filter(l => l !== listener);
        }
    }
}

const EmitterSingleton = new Emitter();
export default EmitterSingleton;