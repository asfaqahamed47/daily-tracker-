class StorageDB {
    constructor() {
        this.usersKey = 'daily_tracker_users';
        this.expensesKey = 'daily_tracker_expenses';
        this.currentUserKey = 'daily_tracker_current_user';
    }

    // User Methods
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.currentUserKey));
        } catch (e) {
            console.error("Error parsing user:", e);
            return null;
        }
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    logoutUser() {
        localStorage.removeItem(this.currentUserKey);
    }

    // Expense Methods
    getExpenses(userId) {
        const allExpenses = JSON.parse(localStorage.getItem(this.expensesKey)) || [];
        return allExpenses.filter(exp => exp.userId === userId);
    }

    addExpense(expense) {
        const allExpenses = JSON.parse(localStorage.getItem(this.expensesKey)) || [];
        allExpenses.push(expense);
        localStorage.setItem(this.expensesKey, JSON.stringify(allExpenses));
    }

    deleteExpense(expenseId) {
        let allExpenses = JSON.parse(localStorage.getItem(this.expensesKey)) || [];
        allExpenses = allExpenses.filter(exp => exp.id !== expenseId);
        localStorage.setItem(this.expensesKey, JSON.stringify(allExpenses));
    }

    clearAllExpenses(userId) {
        let allExpenses = JSON.parse(localStorage.getItem(this.expensesKey)) || [];
        // Keep expenses that do NOT match the current userId
        allExpenses = allExpenses.filter(exp => exp.userId !== userId);
        localStorage.setItem(this.expensesKey, JSON.stringify(allExpenses));
    }

    // Budget Methods
    getBudget() {
        return parseFloat(localStorage.getItem('daily_tracker_budget')) || 50000;
    }

    saveBudget(amount) {
        localStorage.setItem('daily_tracker_budget', amount);
    }

    // Income Methods
    getIncome() {
        return parseFloat(localStorage.getItem('daily_tracker_income')) || 0;
    }

    saveIncome(amount) {
        localStorage.setItem('daily_tracker_income', amount);
    }
}

const db = new StorageDB();
