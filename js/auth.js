class Auth {
    constructor() {
        // Dependencies
    }

    register(name, email, password, voicePhrase = '') {
        const users = db.getUsers();
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            voicePhrase: voicePhrase.toLowerCase().trim() // Normalize phrase
        };

        db.saveUser(newUser);
        return { success: true, message: 'Registration successful! Please login.' };
    }

    login(email, password) {
        const users = db.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            db.setCurrentUser(user);
            return { success: true, user };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    loginVoice(spokenPhrase) {
        if (!spokenPhrase) return { success: false, message: 'No phrase heard' };

        const users = db.getUsers();
        const normalizedInput = spokenPhrase.toLowerCase().trim();

        // Find user with matching voice phrase (Loose Matching)
        // Check if the stored phrase is found within the spoken phrase (or vice versa)
        const user = users.find(u => {
            if (!u.voicePhrase) return false;
            const stored = u.voicePhrase;
            // Match if input includes stored phrase OR stored includes input (partial match)
            return normalizedInput.includes(stored) || stored.includes(normalizedInput);
        });

        if (user) {
            db.setCurrentUser(user);
            return { success: true, user };
        } else {
            return { success: false, message: `Phrase "${spokenPhrase}" not found.` };
        }
    }

    logout() {
        db.logoutUser();
    }

    isLoggedIn() {
        return !!db.getCurrentUser();
    }
}

const auth = new Auth();
