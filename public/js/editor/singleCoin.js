document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor--form' );

    // submit form

    form.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();

        const fd = new FormData( form );
        const id = val( fd.get( 'id' ), 'string' );

        const value = [];
        for ( let i = 0; fd.has( `date__${i}` ) && fd.has( `price__${i}` ); i++ ) {
            const d = val( fd.get( `date__${i}` ), 'date' );
            const p = val( fd.get( `price__${i}` ), 'number' );
            if ( d && p ) value.push( { date: d, price: p } );
        }

        const coinData = {
            id,
            baseId: val( fd.get( 'baseId' ), 'number' ),
            status: val( fd.get( 'status' ), 'string' ),
            certified: val( fd.get( 'certified' ), 'bool' ),
            certIssuer: val( fd.get( 'certIssuer' ), 'string' ),
            certNumber: val( fd.get( 'certNumber' ), 'string' ),
            amount: val( fd.get( 'amount' ), 'number' ),
            notes: val( fd.get( 'notes' ), 'string' ),
            grade: val( fd.get( 'grade' ), 'string' ),
            acquisition: {
                method: val( fd.get( 'acquisition' ), 'string' ),
                date: val( fd.get( 'acquisitionDate' ), 'date' ),
                price: val( fd.get( 'acquisitionPrice' ), 'number' ),
                notes: val( fd.get( 'acquisitionNotes' ), 'string' )
            },
            value,
            mintMark: val( fd.get( 'mintMark' ), 'string' ),
            mintYear: val( fd.get( 'mintYear' ), 'number' ),
            mintage: val( fd.get( 'mintage' ), 'number' )
        };

        try {} catch ( err ) {
            console.error( err );
            alert( err.message || 'Unexpected error' );
        }
    } );

    // reset form

    $( '.cc-form--abort', form ).addEventListener( 'click', e => {
        e.preventDefault();

        if ( confirm( 'Do you really want to discard all changes?' ) ) {
            location.reload();
        }
    } );
} );
