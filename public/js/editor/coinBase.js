document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor--form' );

    // set up image

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

    // submit form

    form.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();

        const fd = new FormData( form );
        const id = val( fd.get( 'id' ), 'string' );

        const material = [];
        for ( let i = 0; fd.has( `material__${i}` ); i++ ) {
            const m = val( fd.get( `material__${i}` ), 'string' );
            if ( m ) material.push( {
                material: m,
                fineness: val( fd.getAll( `fineness__${i}` ), 'number' ),
                portion: val( fd.getAll( `portion__${i}` ), 'number' )
            } );
        }

        const identifier = [];
        for ( let i = 0; fd.has( `catalog__${i}` ) && fd.has( `id__${i}` ); i++ ) {
            const c = val( fd.get( `catalog__${i}` ), 'string' );
            const n = val( fd.get( `id__${i}` ), 'string' );
            if ( c && n ) identifier.push( { catalog: c, id: n } );
        }

        const coinData = {
            id,
            name: val( fd.get( 'name' ), 'string' ),
            description: val( fd.get( 'description' ), 'string' ),
            notes: val( fd.get( 'notes' ), 'string' ),
            type: val( fd.get( 'type' ), 'string' ),
            country: val( fd.get( 'country' ), 'string' ),
            series: val( fd.get( 'series' ), 'string' ),
            tags: val( fd.get( 'tags' ), 'list' ) ?? [],
            currency: val( fd.get( 'currency' ), 'string' ),
            nominal: {
                value: val( fd.get( 'nominalValue' ), 'string' ),
                unit: val( fd.get( 'nominalUnit' ), 'string' )
            },
            issuer: val( fd.get( 'issuer' ), 'string' ),
            issueDate: val( fd.get( 'issueDate' ), 'date' ),
            devaluationDate: val( fd.get( 'devaluationDate' ), 'date' ),
            mintStartYear: val( fd.get( 'mintStartYear' ), 'number' ),
            mintEndYear: val( fd.get( 'mintEndYear' ), 'number' ),
            mintMarks: val( fd.get( 'mintMarks' ), 'list' ),
            design: {
                shape: val( fd.get( 'shape' ), 'string' ),
                obverse: val( fd.get( 'obverse' ), 'string' ),
                reverse: val( fd.get( 'reverse' ), 'string' ),
                edge: val( fd.get( 'edge' ), 'string' )
            },
            dimension: {
                diameter: val( fd.get( 'diameter' ), 'number' ),
                thickness: val( fd.get( 'thickness' ), 'number' ),
                weight: val( fd.get( 'weight' ), 'number' )
            },
            material,
            identifier,
            image: {
                obverse: val( $( '#obverseImage' ).getAttribute( 'image' ), 'string' ),
                reverse: val( $( '#reverseImage' ).getAttribute( 'image' ), 'string' ),
                other: val( $( '#otherImage' ).getAttribute( 'image' ), 'string' )
            }
        };

        try {
            const res = await fetch( id ? `/api/base/${id}/set` : `/api/base/add`, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( coinData )
            } );

            if ( ! res.ok ) {
                const err = await res.json();
                throw new Error( err.msg || err.error || 'Save failed' );
            }

            const saved = await res.json();
            if ( ! saved?.id ) throw new Error( 'Invalid save response' );

            const obv = fd.get( 'obverseImage' );
            const rev = fd.get( 'reverseImage' );
            const oth = fd.get( 'otherImage' );

            const upload = new FormData();
            if ( obv?.name?.length ) upload.append( 'obverse', obv );
            if ( rev?.name?.length ) upload.append( 'reverse', rev );
            if ( oth?.name?.length ) upload.append( 'other', oth );

            if ( [ ...upload.keys() ].length ) {
                const up = await fetch( `/api/base/${saved.id}/upload`, {
                    method: 'POST', body: upload
                } );

                if ( ! up.ok ) throw new Error( 'Image upload failed' );
            }

            window.location.href = `/base/${saved.id}`;
        } catch ( err ) {
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
