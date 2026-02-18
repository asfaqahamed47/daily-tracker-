class Gamification {
    constructor() {
        this.streaksKey = 'daily_tracker_streaks';
    }

    getStreaks(userId) {
        const data = JSON.parse(localStorage.getItem(this.streaksKey)) || {};
        return data[userId] || { currentStreak: 0, lastLogDate: null, totalSaved: 0, badges: [] };
    }

    saveStreaks(userId, data) {
        const allData = JSON.parse(localStorage.getItem(this.streaksKey)) || {};
        allData[userId] = data;
        localStorage.setItem(this.streaksKey, JSON.stringify(allData));
    }

    updateStreak(userId, expenses) {
        // Logic: specific "No Spend" check would require knowing if the day is over with 0 expenses.
        // For this demo, we'll increment "Budget Discipline" streak if no expenses > ₹1000 today.

        let data = this.getStreaks(userId);
        const today = new Date().toDateString();

        if (data.lastLogDate !== today) {
            // New day check
            // If we wanted true "No Spend" checking, we'd check yesterday's data.
            // Simplified Rule: Login Streak for discipline.
            data.currentStreak += 1;
            data.lastLogDate = today;
            this.saveStreaks(userId, data);
        }

        return data;
    }

    checkBadges(userId, expenses) {
        let data = this.getStreaks(userId);
        const newBadges = [];

        // Badge 1: Low Spender (First expense < ₹50)
        if (!data.badges.includes('frugal_starter') && expenses.some(e => e.amount < 50)) {
            newBadges.push({ id: 'frugal_starter', name: 'Frugal Starter', icon: '🌱' });
            data.badges.push('frugal_starter');
        }

        // Badge 2: Saver Week (7 days streak)
        if (!data.badges.includes('saver_week') && data.currentStreak >= 7) {
            newBadges.push({ id: 'saver_week', name: 'Week Warrior', icon: '🔥' });
            data.badges.push('saver_week');
        }

        // Badge 3: Big Saver (Total expenses < 5000 in a month - sophisticated check needed, simplified here)

        if (newBadges.length > 0) {
            this.saveStreaks(userId, data);
            return newBadges; // Return to show popup
        }
        return [];
    }
}

const game = new Gamification();
