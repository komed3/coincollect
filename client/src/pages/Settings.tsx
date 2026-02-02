import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const [ isWiping, setIsWiping ] = useState( false );
}
