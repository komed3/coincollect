import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/APIService';
import type { AppSettings, SettingsContextType } from '../../../shared/types';

const SettingsContext = createContext< SettingsContextType | undefined >( undefined );

export const SettingsProvider: React.FC< { children: React.ReactNode } > = ( { children } ) => {
    const [ settings, setSettings ] = useState< AppSettings >( { currency: 'EUR', language: 'de' } );
    const [ loading, setLoading ] = useState( true );
    const { i18n } = useTranslation();

    useEffect( () => {
        const fetchSettings = async () => {
            try {
                const response = await apiClient.get< AppSettings >( '/settings' );
                setSettings( response.data );

                if ( response.data.language !== i18n.language ) i18n.changeLanguage( response.data.language );
            } catch ( error ) {
                console.error( 'Failed to fetch settings:', error );
            } finally {
                setLoading( false );
            }
        };

        fetchSettings();
    }, [ i18n ] );

    const updateSettings = async ( newSettings: Partial< AppSettings > ) => {
        try {
            const response = await apiClient.patch< AppSettings >( '/settings', newSettings );
            setSettings( response.data );

            if ( newSettings.language ) i18n.changeLanguage( newSettings.language );
        } catch ( error ) {
            console.error( 'Failed to update settings:', error );
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={ { settings, loading, updateSettings } }>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext( SettingsContext );
    if ( context === undefined ) throw new Error( 'useSettings must be used within a SettingsProvider' );
    return context;
};
