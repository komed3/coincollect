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
}
