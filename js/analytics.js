class Analytics {
    constructor() {
        this.healthScore = 0;
        this.healthStatus = 'Calculating...';
    }

    calculateHealthScore(expenses, income) {
        // If no income is set, we can't calculate a proper score, return neutral
        if (!income || income <= 0) {
            return { score: 0, status: 'Set Income', color: '#9E9E9E' };
        }

        if (!expenses || expenses.length === 0) {
            return { score: 100, status: 'Excellent', color: '#4CAF50' };
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        // simple logic: 
        // < 30% of income = Excellent (Score 90-100)
        // 30-50% = Good (Score 75-90)
        // 50-80% = Average (Score 50-75)
        // > 80% = Risk (Score < 50)

        const ratio = totalSpent / income;
        let score = 100 - (ratio * 100);

        // Cap score
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        let status = 'Excellent';
        let color = '#4CAF50'; // Green

        if (ratio > 0.3) { status = 'Good'; color = '#8BC34A'; }
        if (ratio > 0.5) { status = 'Average'; color = '#FFC107'; } // Amber
        if (ratio > 0.8) { status = 'Risk Zone'; color = '#FF5252'; } // Red

        return { score: Math.round(score), status, color, totalSpent };
    }

    getInsights(expenses, income = 0) {
        if (!expenses || expenses.length < 2) return ["Start adding expenses to get AI tips!"];

        const insights = [];
        const categories = {};
        let totalSpent = 0;

        expenses.forEach(e => {
            if (!categories[e.category]) categories[e.category] = 0;
            categories[e.category] += parseFloat(e.amount);
            totalSpent += parseFloat(e.amount);
        });

        // 1. Total Spending Insight
        insights.push(`Total Spending: <strong>₹${totalSpent.toLocaleString('en-IN')}</strong>`);

        // 2. Income Context
        if (income > 0) {
            const percentage = Math.round((totalSpent / income) * 100);
            if (percentage > 80) {
                insights.push(`⚠️ Critial: You've spent <strong>${percentage}%</strong> of your income!`);
            } else if (percentage < 30) {
                insights.push(`✅ Great: You've saved <strong>${100 - percentage}%</strong> of your income.`);
            }
        }

        // 3. Category Analysis
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        const highest = sortedCats[0];

        insights.push(`Top Category: <strong>${highest[0]}</strong> (₹${highest[1].toLocaleString('en-IN')})`);

        // 4. Smart Detailed Saving Tips
        if (highest[0] === 'Food') {
            if (highest[1] > 5000) insights.push("💡 <strong>Food High Alert:</strong> You're spending over ₹5k on food. Try meal prepping on Sundays!");
            else if (highest[1] > 3000) insights.push("💡 <strong>Cooking Tip:</strong> Cooking dinner 3x a week could save you ~₹1200 this month.");
            else insights.push("💡 <strong>Food:</strong> Carry a water bottle to avoid buying drinks outside.");
        }
        else if (highest[0] === 'Travel') {
            if (highest[1] > 4000) insights.push("💡 <strong>Travel Alert:</strong> High travel costs! Look for a monthly metro/bus pass immediately.");
            else if (highest[1] > 2000) insights.push("💡 <strong>Commute Tip:</strong> Carpooling or sharing rides can cut this bill by 40%.");
            else insights.push("💡 <strong>Travel:</strong> Walking short distances saves money and keeps you fit! 🚶");
        }
        else if (highest[0] === 'Shopping') {
            if (highest[1] > 8000) insights.push("💡 <strong>Impulse Alert:</strong> Freeze your credit card for 3 days. Focus on needs only.");
            else if (highest[1] > 5000) insights.push("💡 <strong>30-Day Rule:</strong> Wait 24hrs before buying non-essentials. 70% of urges pass.");
            else insights.push("💡 <strong>Shopping:</strong> Always search for coupons or cashback deals before checkout.");
        }
        else if (highest[0] === 'Entertainment') {
            if (highest[1] > 3000) insights.push("💡 <strong>Fun Budget:</strong> Limit paid outings to once a week. Try house parties instead!");
            else insights.push("💡 <strong>Entertainment:</strong> Look for free local events or cheaper streaming plans.");
        }
        else if (highest[0] === 'Bills') {
            insights.push("💡 <strong>Bills:</strong> Unplug unused electronics. It can save ~10% on electricity.");
        }
        else if (highest[0] === 'Health') {
            insights.push("💡 <strong>Health:</strong> Preventive checkups are cheaper than huge hospital bills later.");
        }
        else {
            insights.push("💡 <strong>Tip:</strong> Try the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.");
        }

        return insights;
    }

    getSubscriptions(expenses) {
        const subs = [];
        const processedIds = new Set();

        // 1. Keyword / Category Detection (Immediate)
        const subscriptionKeywords = ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'gym', 'subscription', 'wifi', 'broadband', 'recharge', 'mobile'];

        expenses.forEach(e => {
            const noteLower = (e.note || '').toLowerCase();
            const isBill = e.category === 'Bills';
            const hasKeyword = subscriptionKeywords.some(kw => noteLower.includes(kw));

            if ((isBill || hasKeyword) && !processedIds.has(e.id)) {
                subs.push({
                    name: e.note || e.category,
                    amount: e.amount,
                    type: 'Detected Service'
                });
                processedIds.add(e.id);
            }
        });

        // 2. Pattern Detection (Recurring Exact Amounts)
        const groups = {};
        expenses.forEach(e => {
            if (processedIds.has(e.id)) return; // Skip already added

            const key = `${e.category}-${e.amount}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });

        for (const [key, list] of Object.entries(groups)) {
            if (list.length >= 2) {
                subs.push({
                    name: list[0].category + ' (Repeated)',
                    amount: list[0].amount,
                    type: 'Recurring Pattern'
                });
                // Mark all as processed
                list.forEach(item => processedIds.add(item.id));
            }
        }

        return subs;
    }

    getBudgetProjection(expenses, monthlyLimit = 20000) {
        const today = new Date();
        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        // Projection
        const avgDaily = totalSpent / dayOfMonth;
        const projectedTotal = avgDaily * daysInMonth;

        const status = projectedTotal > monthlyLimit ? 'Over Budget ⚠️' : 'On Track ✅';

        // Calculate Safe Daily Spend
        const remainingBudget = monthlyLimit - totalSpent;
        const daysLeft = daysInMonth - dayOfMonth;
        let safeDailySpend = 0;

        if (remainingBudget > 0 && daysLeft > 0) {
            safeDailySpend = remainingBudget / daysLeft;
        }

        // Calculate Avg Transactions/Day
        const avgTxns = dayOfMonth > 0 ? (currentMonthExpenses.length / dayOfMonth).toFixed(1) : 0;

        return {
            spent: Math.round(totalSpent),
            projected: Math.round(projectedTotal || 0),
            limit: monthlyLimit,
            status,
            daysLeft,
            safeDailySpend: Math.round(safeDailySpend),
            avgTxns
        };
    }
}

const analytics = new Analytics();
