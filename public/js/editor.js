document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor' );

    /** Helper */

    const $$ = ( s, el = form ) => Array.from( el.querySelectorAll( s ) );
    const $  = ( s, el = form ) => el.querySelector( s );

    const val = ( v, type, d = undefined ) => {
        if ( ! v || ! v.length || v === '' ) return d;
        switch ( type ) {
            case 'string': return String( v ).trim();
            case 'number': return Number( v );
            case 'date': return new Date( v ).toISOString();
            default: return d;
        }
    };

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

    /** Submit form */

    form.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();

        const form = new FormData( e.target );

        const coin = {
            name: val( form.get( 'name' ), 'string' ),
            type: val( form.get( 'type' ), 'string' ),
            country: val( form.get( 'country' ), 'string' ),
            series: val( form.get( 'series' ), 'string' ),
            tags: val( form.get( 'tags' ), 'string' ).split( ',' ).map( t => t.trim() ),
            grade: val( form.get( 'grade' ), 'string' ),
            status: val( form.get( 'status' ), 'string' ),
            amount: val( form.get( 'amount' ), 'number', 1 ),
            mint: {
                year: val( form.get( 'mint.year' ), 'number' ),
                mark: val( form.get( 'mint.mark' ), 'string' ),
                issueDate: val( form.get( 'mint.issueDate' ), 'date' ),
                mintage: val( form.get( 'mint.mintage' ), 'number' )
            },
            currency: val( form.get( 'currency' ), 'string' ),
            nominalValue: {
                value: val( form.get( 'nominalValue.value' ), 'number' ),
                unit: val( form.get( 'nominalValue.value' ), 'string' )
            },
            description: val( form.get( 'description' ), 'string' ),
            note: val( form.get( 'note' ), 'string' ),
            design: {
                shape: val( form.get( 'shape' ), 'string' ),
                obverse: val( form.get( 'design.obverse' ), 'string' ),
                reverse: val( form.get( 'design.reverse' ), 'string' ),
                edge: val( form.get( 'design.edge' ), 'string' )
            }
        };

        console.log( coin );
    } );

    /** Reset form */

    $( 'button[type="reset"]' ).addEventListener( 'click', e => {
        e.preventDefault();

        if ( confirm( 'Do you really want to discard all changes?' ) ) {
            location.reload();
        }
    } );

} );
