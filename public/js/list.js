class CCList {

    constructor () {
        this.locale = document.documentElement.getAttribute( 'lang' );
        this.money = Intl.NumberFormat( this.locale, { style: 'currency', currency: 'EUR' } );

        this.coins = [];
        this.filteredCoins = [];
        this.pageSize = 50;
        this.currentPage = 0;

        this.tableContent = document.querySelector( '.cc-list--table-content' );
        this.emptyState = document.querySelector( '.cc-list--table-empty' );
        this.searchInput = document.querySelector( '.cc-list--filter-search-input' );
        this.filterSelects = document.querySelectorAll( '.cc-list--filter-select' );

        this.initializeEvents();
        this.init();
    }

    async init () {
        await this.loadFilter();
        await this.loadCoins();
    }

    initializeEvents () {
        this.searchInput?.addEventListener( 'input', () => this.applyFilters() );
        this.filterSelects.forEach( select => {
            select.addEventListener( 'change', () => this.applyFilters() );
        } );

        window.addEventListener( 'scroll', () => this.checkForInfiniteScroll() );
    }

    async loadFilter () {
        try {
            const res = await fetch( '/api/coin/stats' );
            if ( ! res.ok ) return;
            const stats = await res.json();

            const selects = Array.from( this.filterSelects );
            this.populateSelectFromKeys( selects[ 0 ], stats.type, I18N.type );
            this.populateSelectFromKeys( selects[ 1 ], stats.status, I18N.status );
            this.populateSelectFromKeys( selects[ 2 ], stats.grade, I18N.grade );
            this.populateSelectFromKeys( selects[ 3 ], stats.country );
            this.populateSelectFromKeys( selects[ 4 ], stats.currency );
            this.populateSelectFromKeys( selects[ 5 ], stats.year );

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

    async loadCoins () {
        try {
            const response = await fetch( '/api/coin/all' );
            if ( ! response.ok ) throw new Error( 'Failed to load coins' );

            this.coins = await response.json();
            this.applyFilters();
        } catch ( error ) {
            console.error( 'Error loading coins:', error );
        }
    }

    toHash ( filters ) {
        const hash = new URLSearchParams();
        for( const [ k, v ] of Object.entries( filters ) ) {
            if ( v ) hash.set( k, encodeURIComponent( v ) );
        }
        window.location.hash = hash.toString();
    }

    fromHash ( apply = false ) {
        const hash = window.location.hash.substring( 1 );
        const filters = new URLSearchParams( hash );

        this.searchInput.value = filters.get( 'search' ) ?? '';

        const selects = Array.from( this.filterSelects );
        selects[ 0 ].value = filters.get( 'type' ) ?? '';
        selects[ 1 ].value = filters.get( 'status' ) ?? '';
        selects[ 2 ].value = filters.get( 'grade' ) ?? '';
        selects[ 3 ].value = filters.get( 'country' ) ?? '';
        selects[ 4 ].value = filters.get( 'currency' ) ?? '';
        selects[ 5 ].value = filters.get( 'year' ) ?? '';

        if ( apply ) this.applyFilters();
    }

    getFilterValues () {
        const selects = Array.from( this.filterSelects );
        return {
            search: ( this.searchInput?.value ).toLowerCase(),
            type: selects[ 0 ]?.value,
            status: selects[ 1 ]?.value,
            grade: selects[ 2 ]?.value,
            country: selects[ 3 ]?.value,
            currency: selects[ 4 ]?.value,
            year: selects[ 5 ]?.value
        };
    }

    filterCoinsByValues ( filters ) {
        return this.coins.filter( coin => ! (
            filters.search && ! (
                coin.name.includes( filters.search ) ||
                Object.values( coin.design ?? {} ).includes( filters.search ) ||
                coin.description?.includes( filters.search )
            ) ||
            filters.type && coin.type != filters.type ||
            filters.status && coin.status != filters.status ||
            filters.grade && coin.grade != filters.grade ||
            filters.country && coin.country != filters.country ||
            filters.currency && coin.currency != filters.currency ||
            filters.year && coin.mint?.year != filters.year
        ) );
    }

    applyFilters () {
        const filters = this.getFilterValues();
        this.filteredCoins = this.filterCoinsByValues( filters );
        this.currentPage = 0;
        this.toHash( filters );
        this.renderCoins();
    }

    renderCoins () {
        const endIndex = ( this.currentPage + 1 ) * this.pageSize;
        const coinsToRender = this.filteredCoins.slice( 0, endIndex );

        if ( coinsToRender.length === 0 ) {
            this.tableContent.innerHTML = '';
            this.emptyState?.classList.add( 'show' );
            return;
        }

        this.emptyState?.classList.remove( 'show' );
        if ( this.currentPage === 0 ) this.tableContent.innerHTML = '';

        const fragment = document.createDocumentFragment();
        coinsToRender.slice( this.currentPage * this.pageSize, endIndex ).forEach( coin => {
            const row = this.createCoinRow( coin );
            fragment.appendChild( row );
        } );

        this.tableContent.appendChild( fragment );
    }

    createCoinRow ( coin ) {
        const row = document.createElement( 'tr' );

        row.innerHTML = `
            <td class="_coin">
                <a href="/coin/${ coin.id }">
                    ${ coin.images?.obverse ? `<img src="/uploads/${ coin.images.obverse }" alt="${ coin.name }" loading="lazy" />` : '' }
                    <b>${ this.escapeHtml( coin.name ) }</b>
                </a>
            </td>
            <td class="_type">${ this.escapeHtml( I18N.type[ coin.type ] ) }</td>
            <td class="_status">${ this.escapeHtml( I18N.status[ coin.status ] ) }</td>
            <td class="_series">${ this.escapeHtml( coin.series || '—' ) }</td>
            <td class="_country">${ this.escapeHtml( coin.country || '—' ) }</td>
            <td class="_currency">${ this.escapeHtml( coin.currency || '—' ) }</td>
            <td class="_year">${ coin.mint?.year || '—' }</td>
            <td class="_nominal">${ coin.nominalValue ? `${ coin.nominalValue.value } ${ coin.nominalValue.unit }` : '—' }</td>
            <td class="_grade">${ this.escapeHtml( I18N.grade[ coin.grade ] ) }</td>
            <td class="_amount">${ coin.amount.toString().padStart( 3, '*' ) }</td>
            <td class="_omv">${ coin.omv.length > 0 ? this.money.format( coin.omv.length ) : '—' }</td>
        `;

        return row;
    }

    escapeHtml ( text ) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String( text ).replace( /[&<>"']/g, m => map[ m ] );
    }

    checkForInfiniteScroll () {
        const scrollThreshold = 200;
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        if (
            scrollPosition >= pageHeight - scrollThreshold &&
            ( this.currentPage + 1 ) * this.pageSize < this.filteredCoins.length
        ) {
            this.currentPage++;
            this.renderCoins();
        }
    }

}

document.addEventListener( 'DOMContentLoaded', function () {
    const ccList = new CCList();
} );
