import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deviceClient } from './services/DeviceClientService';

const Layout = ( { children }: { children: React.ReactNode } ) => {
    const { t } = useTranslation();
    const [ socketConnected, setSocketConnected ] = useState( false );
    const [ phoneConnected, setPhoneConnected ] = useState( false );

    useEffect( () => {
        const socket = deviceClient.connect();

        const handleConnect = () => setSocketConnected( true );
        const handleDisconnect = () => {
            setSocketConnected( false );
            setPhoneConnected( false );
        };

        const handlePhoneConnect = () => setPhoneConnected( true );
        const handlePhoneDisconnect = () => setPhoneConnected( false );

        setSocketConnected( socket.connected );

        socket.on( 'connect', handleConnect );
        socket.on( 'disconnect', handleDisconnect );
        socket.on( 'device-connected', handlePhoneConnect );
        socket.on( 'device-disconnected', handlePhoneDisconnect );

        return () => {
            socket.off( 'connect', handleConnect );
            socket.off( 'disconnect', handleDisconnect );
            socket.off( 'device-connected', handlePhoneConnect );
            socket.off( 'device-disconnected', handlePhoneDisconnect );
        };
    }, [] );
};

function App () {
    return ( <></> )
}

export default App;
