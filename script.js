// script.js - Final Version
window.addEventListener('load', function() {
    let progressBar = document.getElementById('progress');
    let width = 0;

    let loadingInterval = setInterval(function() {
        if (width >= 100) {
            clearInterval(loadingInterval);
            document.getElementById('loading-screen').style.display = 'none';
            checkAuthStatus();
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, 30);
});

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        document.getElementById('welcome-screen').style.display = 'flex';
        setTimeout(function() {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('doctor-listing').style.display = 'block';
        }, 3000);
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
    }
}

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Modal functionality
const bookAppointmentBtn = document.getElementById('book-appointment-btn');
const modal = document.getElementById('appointment-modal');
const closeModal = document.querySelector('.modal .close');

if (bookAppointmentBtn) {
    bookAppointmentBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form submission
const appointmentForm = document.getElementById('appointment-form');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                data['file-data'] = event.target.result;
                data['file-name'] = file.name;
                saveAppointmentData(data);
            };
            reader.readAsDataURL(file);
        } else {
            saveAppointmentData(data);
        }
    });
}

function saveAppointmentData(data) {
    const now = new Date();
    const expectedDate = new Date(now);
    expectedDate.setDate(expectedDate.getDate() + 3);
    data['expected-appointment-date'] = expectedDate.toISOString().split('T')[0];

    const expectedTime = new Date(now);
    expectedTime.setHours(expectedTime.getHours() + 18);
    data['expected-appointment-time'] = expectedTime.toTimeString().split(' ')[0];

    data['appointment-id'] = 'APT-' + Date.now();

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(data);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    appointmentForm.reset();
    showNotification('Appointment booked successfully!', 'success');
}

// File upload display
const fileUpload = document.getElementById('file-upload');
if (fileUpload) {
    fileUpload.addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
        const fileUploadLabel = document.querySelector('.file-upload-label');
        if (fileUploadLabel) {
            fileUploadLabel.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> ${fileName}`;
        }
    });
}

// Set minimum date for appointment to today
const opdDate = document.getElementById('opd-date');
if (opdDate) {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    opdDate.min = formattedDate;
}

// Notification function
function showNotification(message, type) {
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
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}