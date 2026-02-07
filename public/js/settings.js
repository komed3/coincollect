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

            console.log( 'Database successfully exported' );
        } catch ( err ) {
            console.error( 'Export error:', err );
        } finally {
            e.target.disabled = false;
        }
    } );

    document.querySelector( '#updateDb' ).addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.target.disabled = true;

        try {
            const res = await fetch( '/api/db/update', { method: 'POST' } );
            if ( ! res.ok ) throw new Error( 'Update failed' );

            console.log( 'Database successfully updated' );
        } catch ( err ) {
            console.error( 'Update error:', err );
        } finally {
            e.target.disabled = false;
        }
    } );

    document.querySelector( '#cleanUp' ).addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.target.disabled = true;

        try {
            const res = await fetch( '/api/db/cleanup', { method: 'DELETE' } );
            if ( ! res.ok ) throw new Error( 'Clean up failed' );

            console.log( 'Database clean up succeeded' );
        } catch ( err ) {
            e.target.disabled = false;
            console.error( 'Clean up error:', err );
        } finally {
            e.target.disabled = false;
        }
    } );

    document.querySelector( '#resetDb' ).addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.target.disabled = true;

        try {
            if ( ! confirm( 'WARNING: All coins will be deleted!\nThis action cannot be undone.\n\nContinue?' ) ) {
                throw new Error( 'Reset canceled' );
            }

            const nonce = ( Math.random() + 1 ).toString( 36 ).substring( 4 );
            const check = prompt( `To confirm, enter “${nonce}”:` );
            if ( nonce !== check ) throw new Error( 'Confirmation failed' );

            const res = await fetch( '/api/db/reset', { method: 'DELETE' } );
            if ( ! res.ok ) throw new Error( 'Reset failed' );

            console.log( 'Database successfully cleared' );
        } catch ( err ) {
            e.target.disabled = false;
            console.error( 'Reset error:', err );
        } finally {
            e.target.disabled = false;
        }
    } );
} );
