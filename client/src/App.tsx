import { Smartphone, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-8 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-light tracking-[0.4em] uppercase text-slate-900 group">
                        Coin<span className="font-bold group-hover:text-amber-500 transition-colors">Collect</span>
                    </Link>
                    <nav className="flex items-center gap-12">
                        <Link to="/" className="text-[11px] uppercase tracking-[0.4em] font-bold text-slate-400 hover:text-slate-900 transition-colors">{ t( 'catalog' ) }</Link>
                        <Link to="/add" className="text-[11px] uppercase tracking-[0.4em] font-bold text-slate-400 hover:text-slate-900 transition-colors">{ t( 'addCoin' ) }</Link>
                        <Link to="/stats" className="text-[11px] uppercase tracking-[0.4em] font-bold text-slate-400 hover:text-slate-900 transition-colors">{ t( 'stats' ) }</Link>
                        <Link to="/settings" className="text-[11px] uppercase tracking-[0.4em] font-bold text-slate-400 hover:text-slate-900 transition-colors">{ t( 'settings' ) }</Link>
                    </nav>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-8 py-12">
                {children}
            </main>
            <footer className="p-12 border-t border-slate-50 bg-slate-50/30">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">© 2026 CoinCollect</p>
                    </div>
                    <div className="flex gap-8 items-center bg-white px-8 py-4 border border-slate-100 rounded-full shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={ `w-1.5 h-1.5 rounded-full ${ socketConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300' }` } />
                                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                                    <Activity size={12} /> { t( 'server' ) }: { socketConnected ? t( 'online' ) : t( 'offline' ) }
                                </span>
                            </div>
                            <div className="w-px h-4 bg-slate-100" />
                            <div className="flex items-center gap-3">
                            <div className={ `w-1.5 h-1.5 rounded-full ${ phoneConnected ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-300' }` } />
                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                                <Smartphone size={12} /> { t( 'smartphone' ) }: { phoneConnected ? t( 'connected_status' ) : t( 'disconnected_status' ) }
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

function App () {
    return ( <></> )
}

export default App;
