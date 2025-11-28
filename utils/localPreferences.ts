const LocalPreferences = {
    getUid: (): string | null => {
        return localStorage.getItem('uid');
    },

    setUid: (uid: string): void => {
        localStorage.setItem('uid', uid);
    },

    getEmail: (): string | null => {
        return localStorage.getItem('email');
    },

    setEmail: (email: string): void => {
        localStorage.setItem('email', email);
    },

    clearAll: (): void => {
        localStorage.clear();
    },
};

export default LocalPreferences;
