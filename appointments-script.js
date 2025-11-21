// appointments-script.js - Final Version
window.addEventListener('load', function() {
    const tableBody = document.querySelector('#appointments-table tbody');
    const noAppointments = document.getElementById('no-appointments');
    const clearAppointmentsBtn = document.getElementById('clear-appointments');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = currentUser && currentUser.role === 'admin';

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    if (appointments.length === 0) {
        document.querySelector('.appointments-table-container').style.display = 'none';
        noAppointments.style.display = 'block';
        if (clearAppointmentsBtn) clearAppointmentsBtn.style.display = 'none';
    } else {
        if (clearAppointmentsBtn) {
            clearAppointmentsBtn.style.display = isAdmin ? 'block' : 'none';
        }

        appointments.forEach((app, index) => {
            const row = document.createElement('tr');
            
            const opdDate = new Date(app['opd-date']);
            const today = new Date();
            let status = 'Pending';
            let statusClass = 'status-pending';
            
            if (opdDate < today) {
                status = 'Completed';
                statusClass = 'status-confirmed';
            } else if (opdDate.toDateString() === today.toDateString()) {
                status = 'Today';
                statusClass = 'status-confirmed';
            }
            
            row.innerHTML = `
                <td>${app['appointment-id'] || 'APT-' + (index + 1)}</td>
                <td>${app['patient-name']}</td>
                <td>${app['doctor-name']}</td>
                <td>${app['pre-disease']}</td>
                <td>${app['opd-date']}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-view view-details-btn" data-index="${index}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${isAdmin ? `
                        <button class="btn-small btn-danger cancel-appointment-btn" data-index="${index}">
                            <i class="fas fa-times"></i> Delete
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewAppointmentDetails(index);
            });
        });

        if (isAdmin) {
            document.querySelectorAll('.cancel-appointment-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    cancelAppointment(index);
                });
            });
        }
    }

    if (clearAppointmentsBtn && isAdmin) {
        clearAppointmentsBtn.addEventListener('click', function() {
            if (appointments.length > 0) {
                if (confirm('Are you sure you want to clear all appointments? This action cannot be undone.')) {
                    localStorage.removeItem('appointments');
                    location.reload();
                }
            } else {
                alert('No appointments to clear.');
            }
        });
    } else if (clearAppointmentsBtn) {
        clearAppointmentsBtn.style.display = 'none';
    }

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
});

function viewAppointmentDetails(index) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments[index];
    
    let detailsHtml = `
        <div class="appointment-details">
            <h3>Appointment Details</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Appointment ID:</strong> ${appointment['appointment-id'] || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Patient Name:</strong> ${appointment['patient-name']}
                </div>
                <div class="detail-item">
                    <strong>Doctor Name:</strong> ${appointment['doctor-name']}
                </div>
                <div class="detail-item">
                    <strong>Pre-disease:</strong> ${appointment['pre-disease']}
                </div>
                <div class="detail-item">
                    <strong>Still Suffering:</strong> ${appointment['still-suffering']}
                </div>
                <div class="detail-item">
                    <strong>OPD Date:</strong> ${appointment['opd-date']}
                </div>
                <div class="detail-item">
                    <strong>Age:</strong> ${appointment['age']}
                </div>
                <div class="detail-item">
                    <strong>Gender:</strong> ${appointment['gender']}
                </div>
                <div class="detail-item">
                    <strong>Blood Group:</strong> ${appointment['blood-group']}
                </div>
                <div class="detail-item">
                    <strong>Address:</strong> ${appointment['address']}
                </div>
                <div class="detail-item">
                    <strong>City:</strong> ${appointment['city']}
                </div>
                <div class="detail-item">
                    <strong>State:</strong> ${appointment['state']}
                </div>
                <div class="detail-item">
                    <strong>Expected Appointment Date:</strong> ${appointment['expected-appointment-date'] || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Expected Appointment Time:</strong> ${appointment['expected-appointment-time'] || 'N/A'}
                </div>
            </div>
    `;
    
    if (appointment['file-name']) {
        detailsHtml += `
            <div class="detail-item">
                <strong>Uploaded File:</strong> 
                <a href="${appointment['file-data']}" target="_blank" class="file-link">
                    <i class="fas fa-file"></i> ${appointment['file-name']}
                </a>
            </div>
        `;
    }
    
    detailsHtml += `</div>`;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2><i class="fas fa-info-circle"></i> Appointment Details</h2>
                <span class="close-details close">&times;</span>
            </div>
            <div style="padding: 25px; max-height: 70vh; overflow-y: auto;">
                ${detailsHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const closeBtn = modal.querySelector('.close-details');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    });
}

function cancelAppointment(index) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        location.reload();
    }
}