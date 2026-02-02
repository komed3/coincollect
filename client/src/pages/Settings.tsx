import randomstring from 'randomstring';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { APIService } from '../services/APIService';

export default function Settings() {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const [ isWiping, setIsWiping ] = useState( false );

    const handleExport = async () => {
        try {
            const response = await APIService.get( '/coins' );
            const data = response.data;
            const blob = new Blob( [ JSON.stringify( data, null, 2 ) ], { type: 'application/json' } );
            const url = URL.createObjectURL( blob );

            const link = document.createElement( 'a' );
            link.href = url;
            link.download = `coincollect_export_${ new Date().toISOString().split( 'T' )[ 0 ] }.json`;

            document.body.appendChild( link );
            link.click();
            document.body.removeChild( link );

            URL.revokeObjectURL( url );
        } catch ( error ) {
            alert( t( 'export_fail' ) );
        }
    };

    const handleWipe = async () => {
        if ( ! window.confirm( t( 'wipe_confirm' ) ) ) return;

        const token = randomstring.generate( 7 );
        const confirm = window.prompt( t( 'wipe_prompt', { token } ) );
        if ( confirm !== token ) {
            alert( t( 'wipe_cancel' ) );
            return;
        }

        setIsWiping( true );
        try {
            await APIService.delete( '/coins' );
            alert( t( 'wipe_success' ) );
            window.location.reload();
        } catch ( error ) {
            alert( t( 'wipe_fail' ) );
        } finally {
            setIsWiping( false );
        }
    };
}
