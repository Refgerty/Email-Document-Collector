// Email Document Collector Application
document.addEventListener('DOMContentLoaded', () => {
    // Application data
    const appData = {
        statistics: {
            totalDocuments: 2846,
            activeAccounts: 3,
            errorsToday: 0,
            storageUsed: "45.7 GB"
        },
        emailAccounts: [
            {
                id: 1,
                provider: "Gmail",
                email: "user@gmail.com",
                status: "Connected",
                lastSync: "2 minutes ago",
                documents: 1234
            },
            {
                id: 2,
                provider: "Outlook",
                email: "user@outlook.com", 
                status: "Connected",
                lastSync: "5 minutes ago",
                documents: 892
            },
            {
                id: 3,
                provider: "Yahoo",
                email: "user@yahoo.com",
                status: "Syncing",
                lastSync: "1 hour ago",
                documents: 720
            }
        ],
        documentCategories: [
            {name: "Invoices", count: 856, color: "#ef4444"},
            {name: "Contracts", count: 432, color: "#3b82f6"},
            {name: "Reports", count: 789, color: "#10b981"},
            {name: "Presentations", count: 234, color: "#f59e0b"},
            {name: "Images", count: 345, color: "#8b5cf6"},
            {name: "Archives", count: 123, color: "#06b6d4"},
            {name: "Other", count: 67, color: "#6b7280"}
        ]
    };

    // Authentication API mock service
    const authService = {
        login: (email, password) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Mock authentication - accept any email with password length > 5
                    if (email && password && password.length > 5) {
                        const user = {
                            id: 123,
                            firstName: email.split('@')[0],
                            lastName: 'User',
                            email: email,
                            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
                        };
                        resolve(user);
                    } else {
                        reject(new Error('Invalid email or password'));
                    }
                }, 1000);
            });
        },
        register: (firstName, lastName, email, password, confirmPassword) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Mock registration - validate input and create user
                    if (password !== confirmPassword) {
                        reject(new Error('Passwords do not match'));
                        return;
                    }
                    if (password.length < 6) {
                        reject(new Error('Password must be at least 6 characters'));
                        return;
                    }
                    if (!firstName || !lastName || !email) {
                        reject(new Error('Please fill all required fields'));
                        return;
                    }
                    const user = {
                        id: 123,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
                    };
                    resolve(user);
                }, 1000);
            });
        }
    };

    // DOM Elements
    const elements = {
        // Auth forms
        authSection: document.getElementById('auth-section'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginFormElement: document.getElementById('login-form-element'),
        registerFormElement: document.getElementById('register-form-element'),
        showRegisterBtn: document.getElementById('show-register'),
        showLoginBtn: document.getElementById('show-login'),
        
        // Password toggles
        loginPasswordToggle: document.getElementById('login-password-toggle'),
        registerPasswordToggle: document.getElementById('register-password-toggle'),
        registerConfirmPasswordToggle: document.getElementById('register-confirm-password-toggle'),
        
        // Error messages
        loginEmailError: document.getElementById('login-email-error'),
        loginPasswordError: document.getElementById('login-password-error'),
        registerFirstnameError: document.getElementById('register-firstname-error'),
        registerLastnameError: document.getElementById('register-lastname-error'),
        registerEmailError: document.getElementById('register-email-error'),
        registerPasswordError: document.getElementById('register-password-error'),
        registerConfirmPasswordError: document.getElementById('register-confirm-password-error'),
        
        // Dashboard
        dashboardSection: document.getElementById('dashboard-section'),
        userName: document.getElementById('user-name'),
        logoutBtn: document.getElementById('logout-btn'),
        navLinks: document.querySelectorAll('.nav-link'),
        contentSections: document.querySelectorAll('.content-section'),
        
        // Statistics
        totalDocuments: document.getElementById('total-documents'),
        activeAccounts: document.getElementById('active-accounts'),
        errorsToday: document.getElementById('errors-today'),
        storageUsed: document.getElementById('storage-used'),
        
        // Dynamic content containers
        categoriesList: document.getElementById('categories-list'),
        emailAccountsList: document.getElementById('email-accounts-list'),
        
        // Profile form
        profileForm: document.getElementById('profile-form'),
        profileFirstname: document.getElementById('profile-firstname'),
        profileLastname: document.getElementById('profile-lastname'),
        profileEmail: document.getElementById('profile-email'),
        
        // Toast container
        toastContainer: document.getElementById('toast-container')
    };

    // Authentication handlers
    function initAuth() {
        // Check if user is already logged in
        const user = getUserFromStorage();
        if (user && user.token) {
            showDashboard(user);
        } else {
            hideLoaders();
        }

        // Switch between login and register forms
        elements.showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.loginForm.classList.remove('active');
            elements.registerForm.classList.add('active');
        });

        elements.showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.registerForm.classList.remove('active');
            elements.loginForm.classList.add('active');
        });

        // Password toggle functionality
        setupPasswordToggle(elements.loginPasswordToggle, 'login-password');
        setupPasswordToggle(elements.registerPasswordToggle, 'register-password');
        setupPasswordToggle(elements.registerConfirmPasswordToggle, 'register-confirm-password');

        // Form submission
        elements.loginFormElement.addEventListener('submit', handleLogin);
        elements.registerFormElement.addEventListener('submit', handleRegister);
    }

    function setupPasswordToggle(toggleBtn, inputId) {
        const passwordInput = document.getElementById(inputId);
        toggleBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.querySelector('.password-toggle-icon').textContent = '👁️‍🗨️';
            } else {
                passwordInput.type = 'password';
                toggleBtn.querySelector('.password-toggle-icon').textContent = '👁️';
            }
        });
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        resetErrors();
        
        // Form validation
        let isValid = true;
        
        if (!email) {
            elements.loginEmailError.textContent = 'Please enter your email';
            isValid = false;
        } else if (!isValidEmail(email)) {
            elements.loginEmailError.textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        if (!password) {
            elements.loginPasswordError.textContent = 'Please enter your password';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        showLoaders();
        const authBtn = e.target.querySelector('.auth-btn');
        authBtn.querySelector('.btn-text').classList.add('hidden');
        authBtn.querySelector('.btn-loader').classList.remove('hidden');
        
        try {
            const user = await authService.login(email, password);
            saveUserToStorage(user, rememberMe);
            showToast('Login successful!', 'success');
            showDashboard(user);
        } catch (error) {
            showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            hideLoaders();
            authBtn.querySelector('.btn-text').classList.remove('hidden');
            authBtn.querySelector('.btn-loader').classList.add('hidden');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const firstName = document.getElementById('register-firstname').value.trim();
        const lastName = document.getElementById('register-lastname').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        resetErrors();
        
        // Form validation
        let isValid = true;
        
        if (!firstName) {
            elements.registerFirstnameError.textContent = 'First name is required';
            isValid = false;
        }
        
        if (!lastName) {
            elements.registerLastnameError.textContent = 'Last name is required';
            isValid = false;
        }
        
        if (!email) {
            elements.registerEmailError.textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            elements.registerEmailError.textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        if (!password) {
            elements.registerPasswordError.textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            elements.registerPasswordError.textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if (!confirmPassword) {
            elements.registerConfirmPasswordError.textContent = 'Please confirm your password';
            isValid = false;
        } else if (password !== confirmPassword) {
            elements.registerConfirmPasswordError.textContent = 'Passwords do not match';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        showLoaders();
        const authBtn = e.target.querySelector('.auth-btn');
        authBtn.querySelector('.btn-text').classList.add('hidden');
        authBtn.querySelector('.btn-loader').classList.remove('hidden');
        
        try {
            const user = await authService.register(firstName, lastName, email, password, confirmPassword);
            saveUserToStorage(user, true);
            showToast('Registration successful!', 'success');
            showDashboard(user);
        } catch (error) {
            showToast(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            hideLoaders();
            authBtn.querySelector('.btn-text').classList.remove('hidden');
            authBtn.querySelector('.btn-loader').classList.add('hidden');
        }
    }

    function resetErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showLoaders() {
        document.querySelectorAll('.auth-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    function hideLoaders() {
        document.querySelectorAll('.auth-btn').forEach(btn => {
            btn.disabled = false;
            const btnLoader = btn.querySelector('.btn-loader');
            const btnText = btn.querySelector('.btn-text');
            if (btnLoader) btnLoader.classList.add('hidden');
            if (btnText) btnText.classList.remove('hidden');
        });
    }

    // Dashboard handlers
    function initDashboard() {
        // Populate statistics
        elements.totalDocuments.textContent = appData.statistics.totalDocuments.toLocaleString();
        elements.activeAccounts.textContent = appData.statistics.activeAccounts;
        elements.errorsToday.textContent = appData.statistics.errorsToday;
        elements.storageUsed.textContent = appData.statistics.storageUsed;
        
        // Logout button
        elements.logoutBtn.addEventListener('click', handleLogout);
        
        // Dashboard navigation
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                // Deactivate all links and sections
                elements.navLinks.forEach(navLink => navLink.classList.remove('active'));
                elements.contentSections.forEach(section => section.classList.remove('active'));
                
                // Activate selected link and section
                link.classList.add('active');
                document.getElementById(`${targetSection}-content`).classList.add('active');
            });
        });
        
        // Populate document categories
        populateCategories();
        
        // Populate email accounts
        populateEmailAccounts();
        
        // Profile form
        elements.profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = getUserFromStorage();
            if (user) {
                user.firstName = elements.profileFirstname.value.trim();
                user.lastName = elements.profileLastname.value.trim();
                saveUserToStorage(user, true);
                elements.userName.textContent = `${user.firstName} ${user.lastName}`;
                showToast('Profile updated successfully', 'success');
            }
        });
    }

    function populateCategories() {
        elements.categoriesList.innerHTML = '';
        
        appData.documentCategories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.style.setProperty('--category-color', category.color);
            
            categoryItem.innerHTML = `
                <span class="category-name">${category.name}</span>
                <span class="category-count">${category.count.toLocaleString()}</span>
            `;
            
            elements.categoriesList.appendChild(categoryItem);
        });
    }

    function populateEmailAccounts() {
        elements.emailAccountsList.innerHTML = '';
        
        appData.emailAccounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            
            let statusClass = '';
            if (account.status === 'Connected') {
                statusClass = 'status--success';
            } else if (account.status === 'Syncing') {
                statusClass = 'status--info';
            } else {
                statusClass = 'status--error';
            }
            
            accountCard.innerHTML = `
                <div class="account-provider">${account.provider.charAt(0)}</div>
                <div class="account-info">
                    <h4>${account.email}</h4>
                    <p>${account.provider} account</p>
                </div>
                <div class="account-status">
                    <div class="status ${statusClass}">${account.status}</div>
                    <div class="account-meta">
                        <div>Last sync: ${account.lastSync}</div>
                        <div>Documents: ${account.documents}</div>
                    </div>
                </div>
            `;
            
            elements.emailAccountsList.appendChild(accountCard);
        });
    }

    function showDashboard(user) {
        // Set user name
        elements.userName.textContent = `${user.firstName} ${user.lastName}`;
        
        // Fill profile form
        elements.profileFirstname.value = user.firstName;
        elements.profileLastname.value = user.lastName;
        elements.profileEmail.value = user.email;
        
        // Hide auth section and show dashboard
        elements.authSection.classList.add('hidden');
        elements.dashboardSection.classList.remove('hidden');
    }

    function handleLogout() {
        removeUserFromStorage();
        elements.dashboardSection.classList.add('hidden');
        elements.authSection.classList.remove('hidden');
        
        // Reset forms
        elements.loginFormElement.reset();
        elements.registerFormElement.reset();
        elements.loginForm.classList.add('active');
        elements.registerForm.classList.remove('active');
        
        showToast('You have been logged out', 'info');
    }

    // User session management
    function saveUserToStorage(user, remember) {
        // If remember me is checked, use localStorage, otherwise sessionStorage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));
    }

    function getUserFromStorage() {
        // Check both localStorage and sessionStorage
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    function removeUserFromStorage() {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    }

    // Toast notifications
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message;
        
        elements.toastContainer.appendChild(toast);
        
        // Force reflow to enable animations
        toast.offsetHeight;
        
        // Show toast with animation
        toast.classList.add('show');
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                elements.toastContainer.removeChild(toast);
            }, 300); // Match the CSS transition time
        }, 3000);
    }

    // Initialize the application
    initAuth();
    initDashboard();
});