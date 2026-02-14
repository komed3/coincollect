document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor--form' );

    // submit form

    form.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();

        const fd = new FormData( form );
        const id = val( fd.get( 'id' ), 'string' );

        const coinData = {};

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
