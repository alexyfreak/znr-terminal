import { useEffect, useState } from 'react';
export function useTelegram() {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [tg, setTg] = useState(null);
    useEffect(() => {
        const webapp = window.Telegram?.WebApp;
        if (!webapp)
            return;
        setTg(webapp);
        webapp.ready();
        webapp.expand();
        webapp.setHeaderColor('#0A0A0A');
        webapp.setBackgroundColor('#0A0A0A');
        const raw = webapp.initDataUnsafe?.user;
        if (raw) {
            setUser({
                id: raw.id,
                first_name: raw.first_name,
                last_name: raw.last_name,
                username: raw.username,
            });
        }
        setReady(true);
    }, []);
    const haptic = (style = 'medium') => {
        tg?.HapticFeedback.impactOccurred(style);
    };
    const notify = (type = 'success') => {
        tg?.HapticFeedback.notificationOccurred(type);
    };
    return { tg, user, ready, haptic, notify };
}
