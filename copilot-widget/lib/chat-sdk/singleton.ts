export class Singleton {
    private static instance: Singleton;
    constructor() {
        if (Singleton.instance) {
            throw new Error("Error: Instantiation failed: Use Singleton.getInstance() instead of new.");
        }
        Singleton.instance = this;
    }
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}
