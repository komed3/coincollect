import { Smartphone, Globe, Shield, Database, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FormField, Select } from '../components/common/FormComponents';
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
            alert( t( 'exportFail' ) );
        }
    };

    const handleWipe = async () => {
        if ( ! window.confirm( t( 'wipeConfirm' ) ) ) return;

        const token = ( Math.random() + 1 ).toString( 36 ).substring( 4 );
        const confirm = window.prompt( t( 'wipePrompt', { token } ) );
        if ( confirm !== token ) {
            alert( t( 'wipeCancel' ) );
            return;
        }

        setIsWiping( true );
        try {
            await APIService.delete( '/coins' );
            alert( t( 'wipeSuccess' ) );
            window.location.reload();
        } catch ( error ) {
            alert( t( 'wipeFail' ) );
        } finally {
            setIsWiping( false );
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">
            <div className="border-b border-slate-100 pb-8">
                <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-slate-900">
                    { t( 'collection' ) } <span className="font-bold">{ t( 'settings' ) }</span>
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">{ t( 'appSettings' ) }</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Localization */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 text-slate-300">
                        <Globe size={18} />
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em]">{ t( 'localization' ) }</h2>
                    </div>
                    <div className="space-y-6">
                        <FormField label={ t( 'currency' ) }>
                            <Select value={settings.currency} onChange={ e => updateSettings( { currency: e.target.value } ) }>
                                <option value="EUR">{ t( 'EUR' ) }</option>
                                <option value="USD">{ t( 'USD' ) }</option>
                                <option value="CHF">{ t( 'CHF' ) }</option>
                                <option value="GBP">{ t( 'GBP' ) }</option>
                            </Select>
                        </FormField>
                        <FormField label={ t( 'language' ) }>
                            <Select value={settings.language} onChange={ e => updateSettings( { language: e.target.value } ) }>
                                <option value="de">{ t( 'de' ) }</option>
                                <option value="en">{ t( 'en' ) }</option>
                            </Select>
                        </FormField>
                    </div>
                </section>

                {/* Pairing / Mobile */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 text-slate-300">
                        <Smartphone size={18} />
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em]">{ t( 'pairing' ) }</h2>
                    </div>
                    <div className="bg-slate-50 p-8 border border-slate-100 space-y-6">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                            { t( 'pairingDesc' ) }
                        </p>
                        <Link to="/pair" className="inline-block bg-slate-900 text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-500 transition-colors">
                            { t( 'pairNow' ) }
                        </Link>
                    </div>
                </section>

                {/* System & Security */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 text-slate-300">
                        <Shield size={18} />
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em]">{ t( 'systemSEC' ) }</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{ t( 'apiStatus' ) }</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 font-bold flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> { t( 'online' ) }
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Socket.io</span>
                            <span className="text-[10px] text-slate-400 font-mono">{ t( 'connected' ) }</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{ t( 'version' ) }</span>
                            <span className="text-[10px] text-slate-400 font-mono">0.1.0-alpha</span>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="space-y-8 bg-slate-50 p-8 border border-slate-200">
                    <div className="flex items-center gap-3 text-slate-900">
                        <Database size={18} />
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em]">{ t( 'dataManagement' ) }</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button onClick={ handleExport } className="flex items-center justify-center gap-3 bg-white border border-slate-200 p-4 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-900 hover:text-white transition-all group">
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> { t( 'exportBackup' ) }
                        </button>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="text-[9px] uppercase tracking-widest font-bold text-red-500 mb-4 flex items-center gap-2">
                                <AlertTriangle size={12} /> { t( 'dangerZone' ) }
                            </h3>
                            <button onClick={ handleWipe } disabled={ isWiping } className="w-full flex items-center justify-center gap-3 border border-red-200 p-4 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                                <Trash2 size={14} /> { isWiping ? t( 'loading' ) : t( 'wipeData' ) }
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
