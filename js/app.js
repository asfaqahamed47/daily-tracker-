class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.init();
    }

    init() {
        try {
            const user = db.getCurrentUser();
            if (user) {
                this.renderDashboard();
            } else {
                this.renderLogin();
            }
        } catch (error) {
            console.error("App Init Failed:", error);
            this.appContainer.innerHTML = `<div style="color:red; padding:20px; text-align:center;">
                <h2>Something went wrong</h2>
                <p>${error.message}</p>
                <button onclick="localStorage.clear(); location.reload();" class="btn btn-primary">Reset App Data</button>
            </div>`;
        }
    }

    renderLogin() {
        this.appContainer.innerHTML = `
            <div class="view-container center-content" id="login-view">
                <div class="login-card-center">
                    <div class="tree-container" style="margin-bottom: 20px;">
                        <img src="money_tree_growth.png" alt="Growth Tree" style="width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 0 15px gold);">
                    </div>
                    
                    <h1 style="font-size: 2.2rem; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Daily ₹ Tracker</h1>
                    <p style="color: #ccc; margin-bottom: 30px;">Login to manage your wealth</p>

                    <input type="email" id="login-email" placeholder="Email Address" class="modern-input">
                    <input type="password" id="login-password" placeholder="Password" class="modern-input">
                    
                    <button class="btn btn-primary" onclick="app.handleLogin()" style="width: 100%; margin-top: 10px; padding: 12px;">Login</button>
                    
                    <div class="or-divider">
                        <span>OR LOGIN WITH VOICE</span>
                    </div>

                    <div class="voice-login-section">
                        <div class="voice-status" id="login-voice-status">Tap mic to speak phrase</div>
                        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 10px;">
                            <button class="mic-btn small" id="login-mic-btn" onclick="app.handleVoiceLogin()" title="Login with Voice">🎙️</button>
                            <button class="btn btn-secondary circle-btn" onclick="app.toggleManualVoiceInput()" title="Type Phrase">⌨️</button>
                        </div>
                    </div>

                    <div id="manual-voice-input" class="hidden" style="margin-top: 15px; text-align: center;">
                        <input type="text" id="manual-phrase" placeholder="Type secret phrase..." class="modern-input" onkeypress="app.handleManualkey(event)">
                        <button class="btn btn-primary" onclick="app.handleManualLogin()" style="width: 100%; margin-top: 5px;">Enter</button>
                    </div>

                    <p style="margin-top: 30px; font-size: 0.9rem; color: #aaa;">
                        New here? <a href="#" onclick="app.renderRegister()" style="color: var(--primary-color); text-decoration: none;">Create Account</a>
                    </p>
                </div>
            </div>
        `;
    }

    toggleManualVoiceInput() {
        const el = document.getElementById('manual-voice-input');
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            document.getElementById('manual-phrase').focus();
        } else {
            el.classList.add('hidden');
        }
    }

    handleManualkey(e) {
        if (e.key === 'Enter') this.handleManualLogin();
    }

    handleManualLogin() {
        const phrase = document.getElementById('manual-phrase').value;
        const statusEl = document.getElementById('login-voice-status');

        if (!phrase) return;

        const result = auth.loginVoice(phrase);
        if (result.success) {
            statusEl.innerText = "Success! Logging in...";
            statusEl.style.color = "#4CAF50";
            setTimeout(() => this.renderDashboard(), 800);
        } else {
            statusEl.innerText = "Failed: " + result.message;
            statusEl.style.color = "#FF5252";
        }
    }

    renderRegister() {
        this.appContainer.innerHTML = `
            <div class="view-container center-content" id="register-view">
                <h2>Create Account</h2>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Join proper financial tracking</p>
                
                <input type="text" id="reg-name" placeholder="Full Name">
                <input type="email" id="reg-email" placeholder="Email Address">
                <input type="password" id="reg-password" placeholder="Password">
                
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
                    <input type="text" id="reg-voice-phrase" placeholder="Voice Phrase (e.g. 'Hello Jarvis')" style="margin-bottom: 0;">
                    <button class="btn btn-secondary" style="width: auto; padding: 10px; margin: 0;" onclick="app.recordVoicePhrase()">🎙️</button>
                </div>
                <div class="voice-status" id="reg-voice-status" style="text-align: left; margin-bottom: 15px;">Click mic to set phrase</div>

                <button class="btn btn-primary" onclick="app.handleRegister()">Register</button>
                <button class="btn btn-secondary" onclick="app.renderLogin()">Back to Login</button>
            </div>
        `;
    }

    // ... [Rest of renderDashboard and other methods remain same] ...

    handleRegister() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        const voicePhrase = document.getElementById('reg-voice-phrase').value;

        if (!name || !email || !pass) {
            alert("Please fill all fields");
            return;
        }

        const result = auth.register(name, email, pass, voicePhrase);
        if (result.success) {
            alert(result.message);
            this.renderLogin();
        } else {
            alert(result.message);
        }
    }

    // Voice Handlers
    recordVoicePhrase() {
        const statusEl = document.getElementById('reg-voice-status');
        const inputEl = document.getElementById('reg-voice-phrase');

        statusEl.innerText = "Listening... Speak now";
        statusEl.style.color = "var(--primary-color)";

        voice.startListening(
            (transcript) => {
                inputEl.value = transcript;
                statusEl.innerText = "Phrase captured!";
                statusEl.style.color = "#4CAF50";
            },
            (error) => {
                statusEl.innerText = "Error: " + error;
                statusEl.style.color = "#FF5252";
            }
        );
    }

    handleVoiceLogin() {
        const micBtn = document.getElementById('login-mic-btn');
        const statusEl = document.getElementById('login-voice-status');

        micBtn.classList.add('listening');
        statusEl.innerText = "Listening... Say your phrase";
        statusEl.style.color = "var(--primary-color)";

        voice.startListening(
            (transcript) => {
                micBtn.classList.remove('listening');
                statusEl.innerText = `Heard: "${transcript}"`;

                const result = auth.loginVoice(transcript);
                if (result.success) {
                    statusEl.innerText = "Success! Logging in...";
                    statusEl.style.color = "#4CAF50";
                    setTimeout(() => this.renderDashboard(), 800);
                } else {
                    statusEl.innerText = "Failed: " + result.message;
                    statusEl.style.color = "#FF5252";
                }
            },
            (error) => {
                micBtn.classList.remove('listening');
                console.log("Voice Error:", error);

                if (error === 'offline' || error.includes('Internet')) {
                    statusEl.innerText = "Offline Mode: Switching to Keyboard...";
                    statusEl.style.color = "#FFC107";

                    // Auto-open manual input
                    setTimeout(() => {
                        const manualDiv = document.getElementById('manual-voice-input');
                        if (manualDiv.classList.contains('hidden')) {
                            this.toggleManualVoiceInput();
                        }
                    }, 500);
                } else {
                    statusEl.innerText = "Error: " + error;
                    statusEl.style.color = "#FF5252";
                }
            }
        );
    }

    renderDashboard() {
        const user = db.getCurrentUser();
        if (!user) {
            this.handleLogout();
            return;
        }

        this.appContainer.innerHTML = `
            <div class="view-container" id="dashboard-view">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h3>Hello, ${user.name}</h3>
                        <button class="privacy-toggle" onclick="app.togglePrivacy()" title="Toggle Privacy Mode">👁️</button>
                    </div>
                    <button class="btn btn-secondary" style="width: auto; padding: 8px 12px; margin:0; font-size: 0.8rem;" onclick="app.handleLogout()">Logout</button>
                </div>

                <!-- 1. Gamification Streak -->
                <div id="streak-container"></div>

                <!-- 2. Badges Bar -->
                <div id="badges-container" class="gamification-bar">
                    <!-- Badges injected here -->
                </div>

                <!-- 3. Health & Insights (Removed) -->
                
                <div id="ai-insights-container"></div>

                <!-- 4. Life-Area Chart -->
                <div class="chart-section" id="chart-section">
                    <h4 style="margin:0; font-weight:500;">Life-Area Mapping</h4>
                    <div class="chart-container" id="life-area-chart">
                        <!-- Chart injected here -->
                    </div>
                </div>

                <!-- 5. Advanced Tools (Subscriptions & Budget) -->
                <div class="tools-grid">
                    <!-- Subscriptions -->
                    <div class="tool-card">
                        <div class="tool-title">📅 Recurring / Subs</div>
                        <div id="subs-list">
                            <p style="color: grey; font-size: 0.8rem;">Analyzing...</p>
                        </div>
                    </div>
                    
                    <!-- Prediction -->
                    <div class="tool-card">
                        <div class="tool-title">🔮 Month Projection</div>
                        <div id="budget-projection">
                            <!-- Injected -->
                        </div>
                    </div>
                </div>

                <!-- 6. Summary Cards -->
                <div class="summary-grid">
                    <div style="background: #232323; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #333;">
                        <span style="color: var(--text-muted); font-size: 0.8rem;">Today</span>
                        <h2 id="total-today" class="money-val" style="color: var(--secondary-color); margin-bottom: 0;">₹0</h2>
                    </div>
                    <div style="background: #232323; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #333;">
                        <span style="color: var(--text-muted); font-size: 0.8rem;">This Month</span>
                        <h2 id="total-month" class="money-val" style="color: var(--primary-color); margin-bottom: 0;">₹0</h2>
                    </div>
                </div>

                <!-- Universal Input (Omnibar) -->
                <div class="universal-input-container">
                    <h4 style="margin-bottom: 15px; font-weight: 500; display: flex; justify-content: space-between; align-items: center;">
                        <span>✨ AI Assistant</span>
                        <div id="omnibar-status" style="font-size: 0.8rem;"></div>
                    </h4>
                    
                    <div class="omnibar-wrapper" id="omnibar-wrapper">
                        <input type="text" id="omnibar-input" class="omnibar-input" placeholder="Type or say: '200 for Taxi' or Upload file..." onkeypress="app.handleOmnibarKey(event)">
                        
                        <div class="omnibar-actions">
                            <!-- File Upload -->
                            <input type="file" id="omnibar-file" class="omnibar-file-upload" accept=".txt,.csv" onchange="app.handleFileUpload(this)">
                            <button class="omnibar-btn" onclick="document.getElementById('omnibar-file').click()" title="Upload File (Bulk)">
                                📎
                            </button>
                            
                            <!-- Mic Button -->
                            <button class="omnibar-btn primary" id="omnibar-mic" onclick="app.toggleOmnibarVoice()" title="Speak">
                                🎙️
                            </button>
                            
                            <!-- Submit Button (Arrow) -->
                            <button class="omnibar-btn" onclick="app.processOmnibarInput()" title="Send">
                                ➔
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recent List -->

                <!-- Recent List -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-weight: 500;">Recent Expenses</h4>
                    <button onclick="app.handleClearAll()" style="background: none; border: none; color: #FF5252; font-size: 0.8rem; cursor: pointer;">Clear All</button>
                </div>
                
                <div style="flex-grow: 1; overflow-y: auto; padding-bottom: 80px;" id="expense-list">
                    <!-- Expenses injected here -->
                </div>
            </div>
        `;

        this.updateDashboardData();
    }

    addIncome(data) {
        const currentIncome = db.getIncome();
        const newIncome = currentIncome + data.amount;
        db.saveIncome(newIncome);
    }

    // --- Universal Omnibar Methods ---

    handleOmnibarKey(e) {
        if (e.key === 'Enter') this.processOmnibarInput();
    }

    toggleOmnibarVoice() {
        const input = document.getElementById('omnibar-input');
        const micBtn = document.getElementById('omnibar-mic');
        const status = document.getElementById('omnibar-status');
        const wrapper = document.getElementById('omnibar-wrapper');

        // Check Offline
        if (!navigator.onLine) {
            status.innerHTML = '<span class="status-badge offline">Offline Mode</span>';
            input.placeholder = "Offline: Type command manually...";
            input.focus();
            wrapper.classList.add('error');
            setTimeout(() => wrapper.classList.remove('error'), 500);
            return;
        }

        // Start Listening
        if (micBtn.classList.contains('recording')) {
            // Stop if already recording
            voice.stop();
            micBtn.classList.remove('recording');
            status.innerText = "";
            return;
        }

        micBtn.classList.add('recording');
        status.innerText = "Listening...";
        input.placeholder = "Listening...";

        voice.startListening(
            (text) => {
                micBtn.classList.remove('recording');
                input.value = text;
                status.innerText = "Processing...";
                // Auto-submit after 1s
                setTimeout(() => this.processOmnibarInput(), 800);
            },
            (error) => {
                micBtn.classList.remove('recording');
                console.error(error);

                // Smart Fallback
                status.innerHTML = `<span class="status-badge error">${error}</span>`;
                input.placeholder = "Mic failed. Please type command...";
                input.focus();
                wrapper.classList.add('error');
                setTimeout(() => wrapper.classList.remove('error'), 500);
            }
        );
    }

    processOmnibarInput() {
        const input = document.getElementById('omnibar-input');
        const text = input.value;
        const status = document.getElementById('omnibar-status');
        const wrapper = document.getElementById('omnibar-wrapper');

        if (!text) return;

        const result = parser.parse(text);

        if (result.error) {
            status.innerHTML = `<span class="status-badge error">Unrecognized Command</span>`;
            wrapper.classList.add('error');
            setTimeout(() => wrapper.classList.remove('error'), 500);
            return;
        }

        // Route Command (Income vs Expense)
        if (result.type === 'income') {
            this.addIncome(result);
            status.innerHTML = `<span class="status-badge success">Income: +₹${result.amount}</span>`;
        } else {
            this.addExpense(result);
            status.innerHTML = `<span class="status-badge success">Spent: -₹${result.amount}</span>`;
        }

        input.value = '';
        this.updateDashboardData();

        setTimeout(() => status.innerHTML = '', 3000);
    }

    handleFileUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        const status = document.getElementById('omnibar-status');

        status.innerText = "Reading file...";

        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/);
            let count = 0;

            lines.forEach(line => {
                if (line.trim()) {
                    const result = parser.parse(line);
                    if (!result.error) {
                        this.addExpense(result);
                        count++;
                    }
                }
            });

            status.innerHTML = `<span class="status-badge success">Imported ${count} items!</span>`;
            this.updateDashboardData();
            setTimeout(() => status.innerHTML = '', 3000);
        };

        reader.readAsText(file);
    }

    addExpense(data) {
        const user = db.getCurrentUser();

        // Ensure userId is added to the expense object
        const newExpense = {
            id: Date.now().toString() + Math.random().toString().slice(2, 5),
            userId: user.id, // Important for filter
            amount: parseFloat(data.amount),
            category: data.category,
            note: data.note,
            date: new Date().toISOString()
        };

        db.addExpense(newExpense);
    }

    updateDashboardData() {
        try {
            const user = db.getCurrentUser();
            const expenses = db.getExpenses(user.id);

            // --- 1. PRO Features: Analytics, Streaks, Chart ---

            // A. Health Score (Removed per user request)

            // B. Gamification (Streaks & Badges)

            // B. Gamification (Streaks & Badges)
            if (typeof game !== 'undefined') {
                const streakData = game.updateStreak(user.id, expenses);
                const newBadges = game.checkBadges(user.id, expenses);

                // Render Streak
                const streakContainer = document.getElementById('streak-container');
                if (streakData.currentStreak > 0) {
                    streakContainer.innerHTML = `
                        <div class="streak-card">
                            <span>🔥 Login Streak</span>
                            <span>${streakData.currentStreak} Days</span>
                        </div>
                    `;
                } else {
                    streakContainer.innerHTML = '';
                }

                // Render Badges
                const badgesContainer = document.getElementById('badges-container');
                const allBadges = [
                    { id: 'frugal_starter', name: 'Frugal Starter', icon: '🌱' },
                    { id: 'saver_week', name: 'Week Warrior', icon: '🔥' }
                    // Add more definitions here
                ];

                badgesContainer.innerHTML = allBadges.map(b => {
                    const isUnlocked = streakData.badges.includes(b.id);
                    return `<div class="badge ${isUnlocked ? 'unlocked' : ''}">${b.icon} ${b.name}</div>`;
                }).join('');

                if (newBadges.length > 0) {
                    setTimeout(() => alert(`🎉 Congratulations! You unlocked: ${newBadges.map(b => b.name).join(', ')}`), 500);
                }
            }

            // C. Insights
            const insights = analytics.getInsights(expenses, user.id ? db.getIncome() : 0);
            const insightsContainer = document.getElementById('ai-insights-container');
            insightsContainer.innerHTML = insights.map(text =>
                `<div class="insight-card"><span>🔮</span> <div>${text}</div></div>`
            ).join('');

            // D. PRO: Subscriptions & Budget
            // 1. Subscriptions
            const subs = analytics.getSubscriptions(expenses);
            const subsList = document.getElementById('subs-list');
            if (subs.length > 0) {
                subsList.innerHTML = subs.map(s => `
                    <div class="sub-item">
                        <span>${s.name}</span>
                        <span class="money-val">₹${s.amount}</span>
                    </div>
                `).join('');
            } else {
                subsList.innerHTML = '<p style="color: #666; font-size: 0.8rem;">No recurring detected yet.</p>';
            }

            // 2. Financial Overview (Income, Balance, Budget)
            const income = db.getIncome();
            const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

            // Calculate Balance
            const balance = income - totalSpent;

            // Calculate Safe Daily Spend
            const userBudget = db.getBudget();
            const effectiveLimit = income > 0 ? income : userBudget;

            const projection = analytics.getBudgetProjection(expenses, effectiveLimit);

            // Override Safe Spend to be based on Actual Balance if income is set
            if (income > 0) {
                const today = new Date();
                const dayOfMonth = today.getDate();
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const daysLeftInclusive = (daysInMonth - dayOfMonth) + 1;

                // Safe spend logic removed per user request
            }

            const projContainer = document.getElementById('budget-projection');

            const balanceColor = balance >= 0 ? '#4CAF50' : '#FF5252';

            projContainer.innerHTML = `
                <div class="financial-overview">
                    <!-- Row 1: Income & Expenses -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <div style="font-size: 0.75rem; color: #888; display: flex; align-items: center; gap: 5px;">
                                Income <button onclick="app.handleEditIncome()" style="background:none; border:none; cursor:pointer; font-size: 0.8rem; color: var(--primary-color);" title="Edit Budget">✎</button>
                            </div>
                            <div style="font-size: 1rem; color: #fff;">₹${income.toLocaleString('en-IN')}</div>
                        </div>
                        <div style="text-align: right;">
                             <div style="font-size: 0.75rem; color: #888;">Expenses</div>
                             <div style="font-size: 1rem; color: #fff;">₹${Math.round(totalSpent).toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <!-- Row 2: Balance (Highlight) -->
                    <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333;">
                        <div style="font-size: 0.8rem; color: #aaa; margin-bottom: 5px;">Current Balance</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: ${balanceColor};">
                            ₹${balance.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <!-- Row 3: Daily Metrics (Safe Spend & Avg Txns) -->
                    <!-- Row 3: Daily Metrics (Avg Txns Only) -->
                    <div style="padding-top: 10px; border-top: 1px solid #333; text-align: center;">
                         <div style="font-size: 0.7rem; color: #888;">Avg Txns/Day</div>
                         <div style="font-size: 0.9rem; color: #2196F3; font-weight: bold;">${projection.avgTxns}</div>
                    </div>
                </div>
            `;

            // --- 2. Update List & Totals ---
            const listContainer = document.getElementById('expense-list');
            listContainer.innerHTML = '';

            // Sort by date descending (newest first)
            const sortedExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (sortedExpenses.length === 0) {
                listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 30px;">No expenses recorded yet.</p>';
            } else {
                sortedExpenses.forEach(exp => {
                    const date = new Date(exp.date);
                    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                    const item = document.createElement('div');
                    item.className = 'expense-item';
                    item.innerHTML = `
                        <div class="expense-info">
                            <div class="expense-category">${exp.category}</div>
                            <div class="expense-note">${exp.note || '-'}</div>
                            <div class="expense-date">${dateStr}, ${timeStr}</div>
                        </div>
                        <div class="expense-actions">
                            <div class="expense-amount money-val">₹${parseFloat(exp.amount).toFixed(2)}</div>
                            <button class="btn-delete" onclick="app.handleDeleteExpense('${exp.id}')">×</button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });
            }

            // --- 3. Update Totals & Calculate Chart Data ---
            const today = new Date();
            const todayStr = today.toDateString();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            let dailyTotal = 0;
            let monthlyTotal = 0;
            const categoryTotals = {};

            expenses.forEach(exp => {
                const expDate = new Date(exp.date);
                const amount = parseFloat(exp.amount);

                if (expDate.toDateString() === todayStr) dailyTotal += amount;
                if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                    monthlyTotal += amount;
                    if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
                    categoryTotals[exp.category] += amount;
                }
            });

            document.getElementById('total-today').innerText = `₹${dailyTotal.toLocaleString('en-IN')}`;
            document.getElementById('total-month').innerText = `₹${monthlyTotal.toLocaleString('en-IN')}`;

            // --- 4. Render Life-Area Chart ---
            const chartContainer = document.getElementById('life-area-chart');

            if (monthlyTotal > 0 && Object.keys(categoryTotals).length > 0) {
                let conicStr = '';
                let currentDeg = 0;
                let legendHtml = '<div class="chart-legend">';

                // Fixed colors for categories
                const catColors = {
                    'Food': '#FF5252',
                    'Travel': '#2196F3',
                    'Snacks': '#FFC107',
                    'Shopping': '#E91E63',
                    'Bills': '#FF9800',
                    'Entertainment': '#9C27B0',
                    'Health': '#009688',
                    'Education': '#3F51B5',
                    'Investment': '#4CAF50',
                    'Others': '#607D8B'
                };

                for (const [cat, total] of Object.entries(categoryTotals)) {
                    const percent = (total / monthlyTotal) * 100;
                    const deg = (percent / 100) * 360;
                    const color = catColors[cat] || '#888';

                    conicStr += `${color} ${currentDeg}deg ${currentDeg + deg}deg, `;
                    currentDeg += deg;

                    legendHtml += `
                        <div class="legend-item">
                            <div class="legend-color" style="background: ${color}"></div>
                            <span style="color: var(--text-muted);">${cat} (${Math.round(percent)}%)</span>
                        </div>
                    `;
                }

                conicStr = conicStr.slice(0, -2); // remove last comma
                legendHtml += '</div>';

                chartContainer.innerHTML = `
                    <div class="donut-chart" style="background: conic-gradient(${conicStr})"></div>
                    ${legendHtml}
                `;
            } else {
                chartContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Add expenses to see the wheel.</p>';
            }

            // --- 5. Render Category Pills ---
            const catContainer = document.getElementById('category-breakdown');
            if (catContainer) {
                catContainer.innerHTML = '';
                if (Object.keys(categoryTotals).length > 0) {
                    for (const [cat, total] of Object.entries(categoryTotals)) {
                        const pill = document.createElement('div');
                        pill.style.cssText = `
                            background: #2C2C2C; 
                            padding: 8px 12px; 
                            border-radius: 20px; 
                            white-space: nowrap; 
                            font-size: 0.8rem; 
                            border: 1px solid #333;
                        `;
                        pill.innerHTML = `<span style="color: var(--text-muted);">${cat}:</span> <span class="money-val" style="color: var(--primary-color); font-weight: 600;">₹${total}</span>`;
                        catContainer.appendChild(pill);
                    }
                }
            }

            this.applyPrivacyMode();
        } catch (err) {
            console.error(err);
            alert("Error updating dashboard: " + err.message);
        }
    }

    togglePrivacy() {
        this.privacyMode = !this.privacyMode;
        this.applyPrivacyMode();
    }

    applyPrivacyMode() {
        const moneyElements = document.querySelectorAll('.money-val');
        moneyElements.forEach(el => {
            if (this.privacyMode) {
                el.classList.add('blur-text');
            } else {
                el.classList.remove('blur-text');
            }
        });
    }

    // Handlers
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        const result = auth.login(email, pass);
        if (result.success) {
            this.renderDashboard();
        } else {
            alert(result.message);
        }
    }

    handleRegister() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        const voicePhrase = document.getElementById('reg-voice-phrase').value;

        if (!name || !email || !pass) {
            alert("Please fill all fields");
            return;
        }

        const result = auth.register(name, email, pass, voicePhrase);
        if (result.success) {
            alert(result.message);
            this.renderLogin();
        } else {
            alert(result.message);
        }
    }

    handleLogout() {
        auth.logout();
        this.renderLogin();
    }

    handleAddExpense() {
        try {
            console.log("Add Expense Triggered");
            const amountBtn = document.getElementById('exp-amount');
            const categoryBtn = document.getElementById('exp-category');
            const noteBtn = document.getElementById('exp-note');

            const amount = parseFloat(amountBtn.value);
            const category = categoryBtn.value;
            const note = noteBtn.value;

            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }

            // Use Unified Add Method
            this.addExpense({
                amount: amount,
                category: category,
                note: note
            });

            alert("Expense Added Successfully!");

            // Clear inputs
            amountBtn.value = '';
            noteBtn.value = '';

            // Refresh Data
            this.updateDashboardData();
        } catch (err) {
            console.error(err);
            alert("Error adding expense: " + err.message);
        }
    }

    handleEditBudget() {
        const current = db.getBudget();
        const newBudget = prompt("Set your Monthly Budget Target (₹):", current);

        if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
            db.saveBudget(parseFloat(newBudget));
            this.updateDashboardData(); // Refresh to show new status
        } else if (newBudget !== null) {
            alert("Please enter a valid amount.");
        }
    }

    handleDeleteExpense(id) {
        if (confirm('Delete this expense?')) {
            db.deleteExpense(id);
            this.updateDashboardData();
        }
    }

    handleEditBudget() {
        const current = db.getBudget();
        const newBudget = prompt("Set your Monthly Budget Target (₹):", current);

        if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
            db.saveBudget(parseFloat(newBudget));
            this.updateDashboardData();
        }
    }

    handleEditIncome() {
        const current = db.getIncome();
        const newIncome = prompt("Set your Monthly Income (₹):", current);

        if (newIncome && !isNaN(newIncome) && parseFloat(newIncome) > 0) {
            db.saveIncome(parseFloat(newIncome));
            this.updateDashboardData();
        }
    }

    handleClearAll() {
        if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
            const user = db.getCurrentUser();
            db.clearAllExpenses(user.id);
            this.updateDashboardData();
            alert('All expenses cleared.');
        }
    }
}


const app = new App();
