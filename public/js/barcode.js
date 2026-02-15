document.addEventListener( 'DOMContentLoaded', function () {
    $$( '.cc-barcode[code]' ).forEach( bc => {
        const code = bc.getAttribute( 'code' );
        JsBarcode( bc, code, { format: 'code128', width: 4, height: 40 } );
    } );
} );
