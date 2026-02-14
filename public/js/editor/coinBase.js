document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor--form' );

    /** Set up images */

    const setupImageBox = box => {
        const input = $( 'input[type="file"]', box );
        const label = $( 'label', box );
        const trash = $( 'button', box );

        const render = () => {
            const existing = box.getAttribute( 'image' );

            if ( input.files?.length ) {
                const r = new FileReader();

                r.readAsDataURL( input.files[ 0 ] );
                r.onload = ( e ) => {
                    box.style.backgroundImage = `url(${e.target.result})`;
                    label.style.display = 'none';
                    trash.style.display = 'block';
                };
            } else if ( existing ) {
                box.style.backgroundImage = `url(/uploads/${existing})`;
                label.style.display = 'none';
                trash.style.display = 'block';
            } else {
                box.style.backgroundImage = '';
                label.style.display = 'flex';
                trash.style.display = 'none';
            }
        };

        input.addEventListener( 'change', render );

        trash.addEventListener( 'click', e => {
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

    $$( '.cc-form--image' ).forEach( setupImageBox );
} );
