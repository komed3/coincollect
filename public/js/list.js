class CCList {

    constructor () {
        this.initializeEvents();
        this.init();
    }

    async init () {
        await this.loadFilter();
    }

    initializeEvents () {}

    async loadFilter () {}

}

document.addEventListener( 'DOMContentLoaded', function () {
    const ccList = new CCList();
} );
