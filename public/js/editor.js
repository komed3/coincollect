document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor' );

    /** Helper */

    const $$ = ( s, el = form ) => Array.from( el.querySelectorAll( s ) );
    const $  = ( s, el = form ) => el.querySelector( s );

    /** Set up images */

    const setupImageBox = box => {
        const input = $( 'input[type="file"]', box );
        const label = $( 'label', box );
        const btn   = $( 'button', box );

        const render = () => {
            const existing = box.getAttribute( 'image' );

            if ( input.files?.length ) {
                const r = new FileReader();
                r.onload = ( e ) => {
                    box.style.backgroundImage = `url(${e.target.result})`;
                    label.style.display = 'none';
                    btn.style.display = 'block';
                };
                r.readAsDataURL( input.files[ 0 ] );
            } else if ( existing ) {
                box.style.backgroundImage = `url(/uploads/${existing})`;
                label.style.display = 'none';
                btn.style.display = 'block';
            } else {
                box.style.backgroundImage = '';
                label.style.display = 'flex';
                btn.style.display = 'none';
            }
        };

        input.addEventListener( 'change', render );

        btn.addEventListener( 'click', e => {
            e.preventDefault();

            input.value = '';
            box.removeAttribute( 'image' );
            render();
        } );

        box.addEventListener( 'drop', e => {
            e.preventDefault();

            if ( e.dataTransfer.files?.length ) {
                input.files = e.dataTransfer.files;
                render();
            }
        } );

        render();
    };

    $$( '.cc-editor--image' ).forEach( setupImageBox );

    /** Reset form */

    $( 'button[type="reset"]' ).addEventListener( 'click', e => {
        e.preventDefault();

        if ( confirm( 'Do you really want to discard all changes?' ) ) {
            location.reload();
        }
    } );

} );
