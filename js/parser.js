class CommandParser {
    constructor() {
        this.categories = {
            'Food': ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'snack', 'coffee', 'tea', 'burger', 'pizza', 'restaurant', 'eat'],
            'Travel': ['travel', 'bus', 'train', 'taxi', 'uber', 'ola', 'auto', 'fuel', 'petrol', 'diesel', 'parking', 'flight'],
            'Shopping': ['shopping', 'clothes', 'shoes', 'dress', 'shirt', 'pant', 'jeans', 'buy', 'bought', 'amazon', 'flipkart'],
            'Bills': ['bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'recharge', 'mobile', 'dth', 'rent'],
            'Entertainment': ['movie', 'film', 'cinema', 'netflix', 'prime', 'game', 'play', 'fun', 'trip'],
            'Health': ['health', 'medicine', 'doctor', 'clinic', 'hospital', 'gym', 'fitness', 'yoga'],
            'Education': ['book', 'course', 'class', 'school', 'college', 'fee', 'exam', 'paper', 'pen'],
            'Investment': ['invest', 'stock', 'mutual', 'fund', 'sip', 'gold', 'save', 'saving']
        };
    }

    parse(text) {
        if (!text) return null;
        const lowerText = text.toLowerCase();

        // 1. Extract Amount (First number found)
        const amountMatch = lowerText.match(/\d+(\.\d{1,2})?/);
        if (!amountMatch) return { error: "No amount found. Say something like '100 for Lunch'" };

        const amount = parseFloat(amountMatch[0]);

        // 2. Extract Category
        let category = 'Others';
        let categoryFound = false;

        for (const [cat, keywords] of Object.entries(this.categories)) {
            if (keywords.some(kw => lowerText.includes(kw))) {
                category = cat;
                categoryFound = true;
                break; // Stop at first match
            }
        }

        // 3. Extract Note (Clean up the string)
        // Remove the amount from text to get the note
        let note = text.replace(amountMatch[0], '').trim();
        // Remove common connectives like "for", "on", "at" if they allow start the note
        note = note.replace(/^(for|on|at|in)\s+/i, '');

        // If note is empty, use category as note
        if (!note || note.length < 2) note = category;

        // 4. Determine Type (Expense vs Income)
        let type = 'expense';
        const incomeKeywords = ['save', 'saved', 'income', 'salary', 'deposit', 'received', 'added', 'earn', 'earned'];

        if (incomeKeywords.some(kw => lowerText.includes(kw))) {
            type = 'income';
        }

        return {
            amount: amount,
            category: category,
            note: note,
            type: type,
            original: text
        };
    }
}

const parser = new CommandParser();
