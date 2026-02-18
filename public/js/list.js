class CCList {

    constructor () {
        this.tableContent = document.querySelector( '.cc-list--table-content' );
        this.emptyState = document.querySelector( '.cc-list--table-empty' );
        this.searchInput = document.querySelector( '.cc-list--filter-search-input' );
        this.filterSelects = document.querySelectorAll( '.cc-list--filter-select' );

        this.initializeEvents();
        this.init();
    }

    async init () {
        await this.loadFilter();
    }

    initializeEvents () {}

    async loadFilter () {
        try {
            const res = await fetch( '/api/stats' );
            if ( ! res.ok ) return;
            const stats = await res.json();

            const selects = Array.from( this.filterSelects );
            this.populateSelectFromKeys( selects[ 0 ], stats.type, I18N.type );
            this.populateSelectFromKeys( selects[ 1 ], stats.status, I18N.status );
            this.populateSelectFromKeys( selects[ 2 ], stats.grade, I18N.grade );
            this.populateSelectFromKeys( selects[ 3 ], stats.country );
            this.populateSelectFromKeys( selects[ 4 ], stats.currency );
            this.populateSelectFromKeys( selects[ 5 ], stats.year );
            this.populateSelectFromKeys( selects[ 6 ], stats.material, I18N.material );

            this.fromHash();
        } catch { /** silent */ }
    }

    populateSelectFromKeys ( select, obj, i18n ) {
        if ( ! select || ! obj ) return;
        Object.keys( obj ).sort().forEach( key => {
            const o = document.createElement( 'option' );
            o.value = key, o.textContent = i18n?.[ key ] ?? key;
            select.appendChild( o );
        } );
    }

}

document.addEventListener( 'DOMContentLoaded', function () {
    const ccList = new CCList();
} );
