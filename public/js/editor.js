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

        const fd = new FormData( e.target );
        const id = val( fd.get( 'id' ), 'string' );

        const material = [];
        fd.getAll( 'material.material[]' ).forEach( ( m, i ) => {
            if ( m = val( m, 'string' ) ) material.push( {
                material: m,
                fineness: val( fd.getAll( 'material.fineness[]' )[ i ], 'number' ),
                portion: val( fd.getAll( 'material.portion[]' )[ i ], 'number' )
            } );
        } );

        const omv = [];
        fd.getAll( 'omv.date[]' ).forEach( ( d, i ) => {
            if ( d = val( d, 'date' ) ) omv.push( {
                date: d, value: val( fd.getAll( 'omv.value[]' )[ i ], 'number' )
            } );
        } );

        const coin = {
            name: val( fd.get( 'name' ), 'string' ),
            type: val( fd.get( 'type' ), 'string' ),
            country: val( fd.get( 'country' ), 'string' ),
            series: val( fd.get( 'series' ), 'string' ),
            tags: val( fd.get( 'tags' ), 'string' ).split( ',' ).map( t => t.trim() ),
            grade: val( fd.get( 'grade' ), 'string' ),
            status: val( fd.get( 'status' ), 'string' ),
            amount: val( fd.get( 'amount' ), 'number', 1 ),
            mint: {
                year: val( fd.get( 'mint.year' ), 'number' ),
                mark: val( fd.get( 'mint.mark' ), 'string' ),
                issueDate: val( fd.get( 'mint.issueDate' ), 'date' ),
                mintage: val( fd.get( 'mint.mintage' ), 'number' )
            },
            currency: val( fd.get( 'currency' ), 'string' ),
            nominalValue: {
                value: val( fd.get( 'nominalValue.value' ), 'number' ),
                unit: val( fd.get( 'nominalValue.value' ), 'string' )
            },
            description: val( fd.get( 'description' ), 'string' ),
            note: val( fd.get( 'note' ), 'string' ),
            design: {
                shape: val( fd.get( 'shape' ), 'string' ),
                obverse: val( fd.get( 'design.obverse' ), 'string' ),
                reverse: val( fd.get( 'design.reverse' ), 'string' ),
                edge: val( fd.get( 'design.edge' ), 'string' )
            },
            material,
            dimension: {
                diameter: val( fd.get( 'dimension.diameter' ), 'number' ),
                thickness: val( fd.get( 'dimension.thickness' ), 'number' ),
                weight: val( fd.get( 'dimension.weight' ), 'number' )
            },
            purchase: {
                value: val( fd.get( 'purchase.value' ), 'number' ),
                date: val( fd.get( 'purchase.date' ), 'date' )
            },
            omv
        };
    } );

    /** Reset form */

    $( 'button[type="reset"]' ).addEventListener( 'click', e => {
        e.preventDefault();

        if ( confirm( 'Do you really want to discard all changes?' ) ) {
            location.reload();
        }
    } );

} );
