// admin-script.js - Final Version
window.addEventListener('load', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    loadAppointments();

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const tableBody = document.querySelector('#admin-appointments-table tbody');
    
    tableBody.innerHTML = appointments.map((app, index) => {
        const status = getAppointmentStatus(app['opd-date']);
        return `
            <tr>
                <td>${app['appointment-id'] || 'APT-' + (index + 1)}</td>
                <td>${app['patient-name']}</td>
                <td>${app['doctor-name']}</td>
                <td>${app['opd-date']}</td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td>
                    <div class="admin-actions">
                        <button class="btn-small btn-view view-appointment" data-index="${index}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-small btn-danger delete-appointment" data-index="${index}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.view-appointment').forEach(btn => {
        btn.addEventListener('click', (e) => viewAppointment(e));
    });

    document.querySelectorAll('.delete-appointment').forEach(btn => {
        btn.addEventListener('click', (e) => deleteAppointment(e));
    });
}

function getAppointmentStatus(opdDate) {
    const today = new Date();
    const appointmentDate = new Date(opdDate);
    
    if (appointmentDate < today) return 'completed';
    if (appointmentDate.toDateString() === today.toDateString()) return 'confirmed';
    return 'upcoming';
}

function viewAppointment(e) {
    const index = e.target.closest('.view-appointment').getAttribute('data-index');
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments[index];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-file-medical"></i> Appointment Details</h2>
                <span class="close">&times;</span>
            </div>
            <div style="padding: 25px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div>
                        <strong>Patient Name:</strong> ${appointment['patient-name']}
                    </div>
                    <div>
                        <strong>Doctor:</strong> ${appointment['doctor-name']}
                    </div>
                    <div>
                        <strong>OPD Date:</strong> ${appointment['opd-date']}
                    </div>
                    <div>
                        <strong>Pre-disease:</strong> ${appointment['pre-disease']}
                    </div>
                    <div>
                        <strong>Age:</strong> ${appointment['age']}
                    </div>
                    <div>
                        <strong>Gender:</strong> ${appointment['gender']}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function deleteAppointment(e) {
    const index = e.target.closest('.delete-appointment').getAttribute('data-index');
    
    if (confirm('Are you sure you want to delete this appointment?')) {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadAppointments();
        showNotification('Appointment deleted successfully', 'success');
    }
}

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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}