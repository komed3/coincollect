class CCList {

    constructor () {
        this.initializeEvents();
        this.init();
    }

    async init () {
        await this.loadFilter();
    }

    initializeEvents () {}

}
