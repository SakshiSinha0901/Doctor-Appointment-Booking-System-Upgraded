// auth.js - Final Version
const ADMIN_CREDENTIALS = {
    email: "sakshi123sinha@gmail.com",
    password: "1234as"
};

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingAuth();
        this.setupEventListeners();
    }

    checkExistingAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateNavigation();
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        document.querySelectorAll('.switch-tab').forEach(link => {
            link.addEventListener('click', (e) => this.switchTab(e));
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    switchTab(e) {
        e.preventDefault();
        const targetTab = e.target.getAttribute('data-tab');
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${targetTab}-form`).classList.add('active');
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const adminUser = {
                email: ADMIN_CREDENTIALS.email,
                role: 'admin',
                firstName: 'Sakshi',
                lastName: 'Admin'
            };
            this.handleSuccessfulLogin(adminUser);
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.handleSuccessfulLogin(user);
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            role: 'user',
            createdAt: new Date().toISOString()
        };

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === userData.email)) {
            this.showNotification('User with this email already exists', 'error');
            return;
        }

        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.handleSuccessfulLogin(userData);
        this.showNotification('Account created successfully!', 'success');
    }

    handleSuccessfulLogin(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateNavigation();
        
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('doctor-listing').style.display = 'block';
        }, 3000);
    }

    handleLogout(e) {
        if (e) e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        
        document.getElementById('doctor-listing').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        
        this.showNotification('Logged out successfully', 'success');
    }

    updateNavigation() {
        const adminNav = document.getElementById('admin-nav');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.currentUser) {
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (adminNav) {
                adminNav.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
            }
        } else {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (adminNav) adminNav.style.display = 'none';
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'success' ? 'var(--secondary)' : 'var(--danger)'};
            color: white;
            padding: 15px 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            z-index: 1002;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
