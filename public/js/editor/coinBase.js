document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.querySelector( '.cc-editor--form' );

    // set up images

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

        const coinData = {
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
            // material
            dimension: {
                diameter: val( fd.get( 'diameter' ), 'number' ),
                thickness: val( fd.get( 'thickness' ), 'number' ),
                weight: val( fd.get( 'weight' ), 'number' )
            },
            // images
            // identifiers
        };
    } );

    // reset form

    $( '.cc-form--abort', form ).addEventListener( 'click', e => {
        e.preventDefault();

        if ( confirm( 'Do you really want to discard all changes?' ) ) {
            location.reload();
        }
    } );
} );
