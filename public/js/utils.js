const $$ = ( s, el = document ) => Array.from( el.querySelectorAll( s ) );
const $  = ( s, el = document ) => el.querySelector( s );

const val = ( v, type, d = undefined ) => {
    if ( ! v || ! v.length || v === '' ) return d;
    switch ( type ) {
        case 'bool': return Boolean( v );
        case 'string': return String( v ).trim();
        case 'list': return String( v ).split( ',' ).map( t => t.trim() ).filter( Boolean );
        case 'number': return Number( v );
        case 'date': return new Date( v ).toISOString();
        default: return d;
    }
};
