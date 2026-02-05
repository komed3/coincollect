document.addEventListener( 'DOMContentLoaded', function () {
    document.querySelector( '#languageSelect' ).addEventListener( 'change', ( e ) => {
        document.cookie = `locale=${e.target.value}; path=/; max-age=${ 60 * 60 * 24 * 365 }`;
        setTimeout( () => window.location.reload(), 250 );
    } );
} );
