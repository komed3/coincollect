document.addEventListener( 'DOMContentLoaded', function () {
    document.querySelector( '#languageSelect' ).addEventListener( 'change', ( e ) => {
        document.cookie = `locale=${ e.target.value }; path=/; max-age=${ 60 * 60 * 24 * 365 }`;
        setTimeout( () => window.location.reload(), 250 );
    } );

    document.querySelector( '#currencySelect' ).addEventListener( 'change', async ( e ) => {
        await fetch( '/api/currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { currency: e.target.value } )
        } );
    } );
} );
