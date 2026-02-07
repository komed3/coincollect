document.addEventListener( 'DOMContentLoaded', function () {
    const delBtn = document.querySelector( '[href="#delete"]' );
    delBtn.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        if ( confirm( 'Are you sure you want to delete this coin?' ) ) {
            const id = delBtn.getAttribute( 'coin' );
            const res = await fetch( `/api/coin/${id}/delete`, { method: 'DELETE' } );

            if ( ! res.ok ) throw new Error( 'Failed to delete the coin' );
            window.location.href = '/';
        }
    } );
} );
