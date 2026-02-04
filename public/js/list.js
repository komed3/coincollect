class CCList {

    constructor () {
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
            this.populateSelectFromKeys( selects[ 0 ], stats.type );
            this.populateSelectFromKeys( selects[ 1 ], stats.status );
            this.populateSelectFromKeys( selects[ 2 ], stats.grade );
            this.populateSelectFromKeys( selects[ 3 ], stats.country );
            this.populateSelectFromKeys( selects[ 4 ], stats.currency );
            this.populateSelectFromKeys( selects[ 5 ], stats.year );
        } catch { /* silent */ }
    }

    populateSelectFromKeys ( select, obj ) {
        if ( ! select || ! obj ) return;
        Object.keys( obj ).sort().forEach( key => {
            const o = document.createElement( 'option' );
            o.value = key, o.textContent = key;
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

    /*getFilterValues () {
        const selects = Array.from( this.filterSelects );
        return {
            search: ( this.searchInput?.value || '' ).toLowerCase(),
            type: selects[ 0 ]?.value || '',
            status: selects[ 1 ]?.value || '',
            country: selects[ 2 ]?.value || ''
        };
    }*/

    /*filterCoinsByValues ( filters ) {
        return this.coins.filter( coin => {
            const matchesSearch = !filters.search || 
                coin.name.toLowerCase().includes( filters.search ) ||
                coin.country?.toLowerCase().includes( filters.search ) ||
                coin.series?.toLowerCase().includes( filters.search );

            const matchesType = !filters.type || coin.type === filters.type;
            const matchesStatus = !filters.status || coin.status === filters.status;
            const matchesCountry = !filters.country || coin.country === filters.country;

            return matchesSearch && matchesType && matchesStatus && matchesCountry;
        } );
    }*/

    /*applyFilters () {
        const filters = this.getFilterValues();
        this.filteredCoins = this.filterCoinsByValues( filters );
        this.currentPage = 0;
        this.renderCoins();
        this.updateCountryFilter();
    }*/

    /*updateCountryFilter () {
        const selects = Array.from( this.filterSelects );
        const countrySelect = selects[ 2 ];
        const filters = this.getFilterValues();
        const filteredForCountry = this.filterCoinsByValues( { ...filters, country: '' } );
        const countries = [ ...new Set( filteredForCountry.map( c => c.country ).filter( Boolean ) ) ].sort();
        this.replaceOptions( countrySelect, countries );
    }*/

    /*replaceOptions ( select, items ) {
        if ( !select ) return;
        const current = select.value;
        // remove old options except first
        Array.from( select.querySelectorAll( 'option' ) ).forEach( ( opt, idx ) => { if ( idx > 0 ) opt.remove(); } );
        items.forEach( it => {
            const o = document.createElement( 'option' );
            o.value = it;
            o.textContent = it;
            select.appendChild( o );
        } );
        select.value = current;
    }*/

    /*renderCoins () {
        const endIndex = ( this.currentPage + 1 ) * this.pageSize;
        const coinsToRender = this.filteredCoins.slice( 0, endIndex );

        if ( coinsToRender.length === 0 ) {
            this.tableContent.innerHTML = '';
            this.emptyState?.removeAttribute( 'hidden' );
            return;
        }

        this.emptyState?.setAttribute( 'hidden', '' );

        if ( this.currentPage === 0 ) {
            this.tableContent.innerHTML = '';
        }

        const fragment = document.createDocumentFragment();
        coinsToRender.slice( this.currentPage * this.pageSize, endIndex ).forEach( coin => {
            const row = this.createCoinRow( coin );
            fragment.appendChild( row );
        } );

        this.tableContent.appendChild( fragment );
    }*/

    /*createCoinRow ( coin ) {
        const row = document.createElement( 'tr' );
        row.innerHTML = `
            <td class="_coin">
                <a href="/coin/${ coin.id }">
                    ${ coin.images?.obverse ? `<img src="/uploads/${ coin.images.obverse }" alt="${ coin.name }" loading="lazy">` : '' }
                    <b>${ this.escapeHtml( coin.name ) }</b>
                </a>
            </td>
            <td class="_type">${ this.escapeHtml( coin.type ) }</td>
            <td class="_status">${ this.escapeHtml( coin.status ) }</td>
            <td class="_series">${ this.escapeHtml( coin.series || '—' ) }</td>
            <td class="_country">${ this.escapeHtml( coin.country || '—' ) }</td>
            <td class="_currency">${ this.escapeHtml( coin.currency || '—' ) }</td>
            <td class="_year">${ coin.mint?.year || '—' }</td>
            <td class="_nominal">${ coin.nominalValue ? `${ coin.nominalValue.value } ${ coin.nominalValue.unit }` : '—' }</td>
            <td class="_grade">${ this.escapeHtml( coin.grade ) }</td>
            <td class="_amount">${ coin.amount }</td>
            <td class="_omv">${ coin.omv.length > 0 ? coin.omv.length : '—' }</td>
        `;
        return row;
    }*/

    /*escapeHtml ( text ) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String( text ).replace( /[&<>"']/g, m => map[ m ] );
    }*/

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
