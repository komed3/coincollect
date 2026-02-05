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

    document.querySelector( '#exportDb' ).addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.target.disabled = true;

        try {
            const res = await fetch( '/api/db/export' );
            if ( ! res.ok ) throw new Error( 'Export failed' );

            const data = await res.json();
            const blob = new Blob( [ JSON.stringify( data ) ], { type: 'application/json' } );
            const url = URL.createObjectURL( blob );

            const link = document.createElement( 'a' );
            link.download = `coin-collection-${ new Date().toISOString() }.json`;
            link.href = url;

            document.body.appendChild( link );
            link.click();
            document.body.removeChild( link );
            URL.revokeObjectURL( url );
        } catch ( err ) {
            console.error( 'Export error:', err );
        } finally {
            e.target.disabled = false;
        }
    } );
} );
