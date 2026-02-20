class CCList {

    constructor () {
        this.tableContainer = document.querySelector( '.cc-list--table-container' );
        this.tableContent = document.querySelector( '.cc-list--table-content' );
        this.emptyState = document.querySelector( '.cc-list--table-empty' );
        this.searchInput = document.querySelector( '.cc-list--filter-search-input' );
        this.filterSelects = document.querySelectorAll( '.cc-list--filter-select' );

        this.loading = false;
        this.items = [];
        this.rendered = 0;
        this.pageSize = 50;

        this.initializeEvents();
        this.init();
    }

    async init () {
        await this.loadFilter();
        this.applyFilters();
    }

    triggerUpdate () {
        this.toHash();
        this.applyFilters();
    }

    initializeEvents () {
        this.searchInput.addEventListener( 'input', this.triggerUpdate.bind( this ) );
        this.filterSelects.forEach( sel => sel.addEventListener( 'change', this.triggerUpdate.bind( this ) ) );

        window.addEventListener( 'scroll', () => {
            if ( this.loading ) return;
            const scrollBottom = window.scrollY + window.innerHeight;
            const trigger = document.body.scrollHeight - 100;
            if ( scrollBottom >= trigger ) this.renderMore();
        } );
    }

    async applyFilters () {
        if ( this.loading ) return;
        this.loading = true;

        const filterObj = {};
        Array.from( this.filterSelects ).forEach( sel => {
            if ( sel.value ) filterObj[ sel.getAttribute( 'filter' ) ] = sel.value;
        } );

        const params = {
            search: this.searchInput.value.trim(),
            filter: filterObj
        };

        try {
            const res = await fetch( '/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( params )
            } );

            if ( ! res.ok ) throw new Error( 'Bad Response' );

            this.items = await res.json();
            this.rendered = 0;
            this.tableContent.innerHTML = '';

            this.updateEmptyState();
            this.renderMore();
        } catch {
            // silent for now
        } finally {
            this.loading = false;
        }
    }

    renderMore () {
        if ( this.rendered >= this.items.length ) return;
        const end = Math.min( this.items.length, this.rendered + this.pageSize );

        for ( let i = this.rendered; i < end; i++ ) {
            this.tableContent.appendChild( this.createRow( this.items[ i ] ) );
        }

        this.rendered = end;
        this.updateEmptyState();
    }

    updateEmptyState () {
        this.emptyState.classList.toggle( 'show', this.items.length === 0 );
    }

    createRow ( item ) {
        const tr = document.createElement( 'tr' );
        const { coin, base } = item;

        const td = ( cls, child ) => {
            const e = document.createElement( 'td' );
            if ( cls ) e.className = cls;
            if ( child ) e.appendChild( child );
            return e;
        };

        const numberCell = ( cls, value, formatter ) => {
            const tt = document.createElement( 'tt' );
            tt.textContent = formatter( value );
            return td( cls, tt );
        };

        const coinTd = document.createElement( 'td' );
        coinTd.className = '_coin';

        const a = document.createElement( 'a' );
        a.href = `/coin/${coin.id}`;

        const b = document.createElement( 'b' );
        b.textContent = base.name;
        a.appendChild( b );

        if ( base.image?.obverse ) {
            const img = document.createElement( 'img' );
            img.src = `/uploads/${base.image.obverse}`;
            img.alt = base.name;
            a.insertBefore( img, b );
        }

        coinTd.appendChild( a );
        tr.appendChild( coinTd );

        tr.appendChild( td( '_type', document.createTextNode( I18N.type?.[ base.type ] || base.type ) ) );
        tr.appendChild( td( '_status', document.createTextNode( I18N.status?.[ coin.status ] || coin.status ) ) );
        tr.appendChild( td( '_country', document.createTextNode( base.country || '' ) ) );
        tr.appendChild( td( '_year', document.createTextNode( coin.mintYear?.toString() || '' ) ) );
        tr.appendChild( td( '_grade', document.createTextNode( I18N.grade?.[ coin.grade ] || coin.grade ) ) );

        if ( coin.amount != null ) tr.appendChild( numberCell( '_amount right', coin.amount, v => String( v ).padStart( 4, '*' ) ) );
        else tr.appendChild( td( '_amount right' ) );

        if ( coin.value?.[ 0 ]?.avg != null ) tr.appendChild( numberCell( '_value right', coin.value[ 0 ].avg, v =>
            Intl.NumberFormat( LANG, { style: 'currency', currency: CURRENCY } ).format( v )
        ) );
        else tr.appendChild( td( '_value right' ) );

        return tr;
    }

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
            this.populateSelectFromKeys( selects[ 5 ], stats.issuer );
            this.populateSelectFromKeys( selects[ 6 ], stats.mintMark );
            this.populateSelectFromKeys( selects[ 7 ], stats.year );
            this.populateSelectFromKeys( selects[ 8 ], stats.material, I18N.material );

            this.fromHash();
        } catch {}
    }

    populateSelectFromKeys ( select, obj, i18n ) {
        if ( ! select || ! obj ) return;
        Object.keys( obj ).sort().forEach( key => {
            const o = document.createElement( 'option' );
            o.value = key, o.textContent = i18n?.[ key ] ?? key;
            select.appendChild( o );
        } );
    }

    fromHash () {
        try {
            const raw = location.hash.slice( 1 );
            if ( ! raw ) return;

            const params = new URLSearchParams( raw );
            const search = params.get( 'search' );
            if ( search != null ) this.searchInput.value = search;

            [ 'type', 'status', 'grade', 'country', 'currency', 'issuer', 'mintMark', 'year', 'material' ].forEach( key => {
                const val = params.get( key );
                if ( val != null ) {
                    const sel = document.querySelector( `.cc-list--filter-select[filter="${key}"]` );
                    if ( sel ) sel.value = val;
                }
            } );
        } catch ( e ) {
            console.warn( 'Invalid hash', e );
        }
    }

    toHash () {
        const hash = new URLSearchParams();
        const s = this.searchInput.value.trim();

        if ( s ) hash.set( 'search', s );

        Array.from( this.filterSelects ).forEach( sel => {
            if ( sel.value ) hash.set( sel.getAttribute( 'filter' ), sel.value );
        } );

        const str = hash.toString();
        location.hash = str ? str : '';
    }

}

document.addEventListener( 'DOMContentLoaded', function () {
    const ccList = new CCList();
} );
