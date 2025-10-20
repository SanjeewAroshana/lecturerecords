// Initialize workingRecords with data from Django context
let workingRecords = workingRecordsData.map(record => ({
    id: record.pk,
    date: record.fields.date,
    month: record.fields.month,
    lecturerName: record.fields.lecturer_name,
    facultyName: record.fields.faculty_name,
    sourceName: record.fields.source_name,
    lessonName: record.fields.lesson_name,
    startTime: record.fields.start_time,
    endTime: record.fields.end_time,
    mode: record.fields.mode
}));

// Initialize travelingRecords with data from Django context
let travelingRecords = travelingRecordsData.map(record => ({
    id: record.pk,
    date: record.fields.date,
    startTime: record.fields.start_time,
    endTime: record.fields.end_time,
    purpose: record.fields.purpose,
    confirmationToken: record.fields.confirmation_token
}));

// Current user state (from Django context)
let currentUser = {
    username: userData.username,
    is_admin: userData.is_admin,
    fullName: userData.full_name,
    email: userData.email,
    role: userData.is_admin ? 'admin' : 'lecturer' // Assuming non-admin users are lecturers
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appContainer = document.getElementById('appContainer');
const logoutBtn = document.getElementById('logoutBtn');
const userWelcome = document.getElementById('userWelcome');
const userRole = document.getElementById('userRole');
const userAvatar = document.getElementById('userAvatar');
const tabs = document.querySelectorAll('.tab');
const formSections = document.querySelectorAll('.form-section');
const workingForm = document.getElementById('workingRecordForm');
const travelingForm = document.getElementById('travelingRecordForm');
const workingRecordsBody = document.getElementById('workingRecordsBody');
const travelingRecordsBody = document.getElementById('travelingRecordsBody');
const workingEmptyState = document.getElementById('workingEmptyState');
const travelingEmptyState = document.getElementById('travelingEmptyState');
const recordFilter = document.getElementById('recordFilter');
const usersTableBody = document.getElementById('usersTableBody');
const addUserBtn = document.getElementById('addUserBtn');

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Show application after login
function showApplication() {
    appContainer.style.display = 'block';
    
    // Update UI with user info
    userWelcome.textContent = `Welcome, ${currentUser.fullName}`;
    userRole.textContent = `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}`;
    userAvatar.textContent = currentUser.fullName.charAt(0).toUpperCase();
    
    // Set role-based UI
    document.body.className = `role-${currentUser.role}`;
    
    // Auto-fill lecturer name if user is a lecturer
    if (currentUser.role === 'lecturer') {
        document.getElementById('lecturerName').value = currentUser.fullName;
        // document.getElementById('facultyName').value = currentUser.faculty; // Faculty not in Django User model
    }
    
    // Initialize the display
    displayRecords();
    displayUsers();
}

// Logout functionality
logoutBtn.addEventListener('click', async function() {
    try {
        const response = await fetch('/home/logout_user/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });
        const data = await response.json();
        if (data.status === 'success') {
            window.location.href = data.redirect_url;
        } else {
            alert('Error logging out.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
});

// Tab switching functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target section
        formSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
        
        // If viewing records, refresh the display
        if (targetId === 'records-view') {
            displayRecords();
        } else if (targetId === 'user-management') {
            displayUsers();
        }
    });
});

// Form submission handlers
workingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newRecordData = {
        date: document.getElementById('workDate').value,
        month: document.getElementById('workMonth').value,
        lecturerName: document.getElementById('lecturerName').value,
        facultyName: document.getElementById('facultyName').value,
        sourceName: document.getElementById('sourceName').value,
        lessonName: document.getElementById('lessonName').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        mode: document.querySelector('input[name="mode"]:checked').value
    };

    try {
        const response = await fetch('/home/add_working_record/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(newRecordData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            newRecordData.id = result.id; // Assign the ID from the backend
            workingRecords.push(newRecordData);
            this.reset();
            const workingRecordMessage = document.getElementById('workingRecordMessage');
            console.log('Working record message element:', workingRecordMessage);
            if (workingRecordMessage) {
                workingRecordMessage.style.display = 'block';
                console.log('Working record message display set to block.');
                setTimeout(() => {
                    workingRecordMessage.style.display = 'none';
                    console.log('Working record message display set to none.');
                }, 3000); // Hide after 3 seconds
            }
            document.querySelector('.tab[data-target="records-view"]').click();
        } else {
            alert(result.message || 'Error adding working record.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the working record.');
    }
});

travelingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newRecordData = {
        date: document.getElementById('travelDate').value,
        startTime: document.getElementById('travelStartTime').value,
        endTime: document.getElementById('travelEndTime').value,
        purpose: document.getElementById('purpose').value,
        confirmationToken: document.getElementById('confirmationToken').value
    };
    
    try {
        const response = await fetch('/home/add_traveling_record/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(newRecordData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            newRecordData.id = result.id; // Assign the ID from the backend
            travelingRecords.push(newRecordData);
            this.reset();
            const travelingRecordMessage = document.getElementById('travelingRecordMessage');
            console.log('Traveling record message element:', travelingRecordMessage);
            if (travelingRecordMessage) {
                travelingRecordMessage.style.display = 'block';
                console.log('Traveling record message display set to block.');
                setTimeout(() => {
                    travelingRecordMessage.style.display = 'none';
                    console.log('Traveling record message display set to none.');
                }, 3000); // Hide after 3 seconds
            }
            document.querySelector('.tab[data-target="records-view"]').click();
        } else {
            alert(result.message || 'Error adding traveling record.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the traveling record.');
    }
});

// Display records in the tables
function displayRecords() {
    const filterValue = recordFilter.value;
    
    // Working Records
    const userWorkingRecords = workingRecords; // No filtering needed as Django view already filters
        
    if (userWorkingRecords.length > 0 && (filterValue === 'all' || filterValue === 'working')) {
        workingEmptyState.style.display = 'none';
        workingRecordsBody.innerHTML = '';
        
        userWorkingRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.lecturerName}</td>
                <td>${record.facultyName}</td>
                <td>${record.lessonName}</td>
                <td>${record.startTime} - ${record.endTime}</td>
                <td><span class="status-badge ${record.mode === 'Online' ? 'status-online' : 'status-physical'}">${record.mode}</span></td>
                <td class="action-buttons">
                    ${currentUser.is_admin || record.lecturerName === currentUser.fullName ? 
                        `<button class="btn-action btn-edit" onclick="editWorkingRecord(${record.id})">Edit</button>
                         <button class="btn-action btn-delete" onclick="deleteWorkingRecord(${record.id})">Delete</button>` : 
                        `<span>No actions</span>`
                    }
                </td>
            `;
            workingRecordsBody.appendChild(row);
        });
    } else {
        workingEmptyState.style.display = 'block';
        workingRecordsBody.innerHTML = '';
    }
    
    // Traveling Records
    const userTravelingRecords = travelingRecords; // No filtering needed for traveling records for now
        
    if (userTravelingRecords.length > 0 && (filterValue === 'all' || filterValue === 'traveling')) {
        travelingEmptyState.style.display = 'none';
        travelingRecordsBody.innerHTML = '';
        
        userTravelingRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.startTime} - ${record.endTime}</td>
                <td>${record.purpose}</td>
                <td>${record.confirmationToken}</td>
                <td class="action-buttons">
                    ${currentUser.is_admin || record.lecturerName === currentUser.fullName ? 
                        `<button class="btn-action btn-edit" onclick="editTravelingRecord(${record.id})">Edit</button>
                         <button class="btn-action btn-delete" onclick="deleteTravelingRecord(${record.id})">Delete</button>` : 
                        `<span>No actions</span>`
                    }
                </td>
            `;
            travelingRecordsBody.appendChild(row);
        });
    } else {
        travelingEmptyState.style.display = 'block';
        travelingRecordsBody.innerHTML = '';
    }
}

// Display users in admin panel
function displayUsers() {
    if (!currentUser.is_admin) return;
    
    usersTableBody.innerHTML = '';
    // In a real app, you would fetch users from the backend
    const dummyUsers = [
        { id: 1, username: 'admin', fullName: 'System Administrator', role: 'admin', faculty: 'Administration', status: 'Active' },
        { id: 2, username: 'lecturer1', fullName: 'Dr. Sarah Johnson', role: 'lecturer', faculty: 'Computer Science', status: 'Active' },
        { id: 3, username: 'lecturer2', fullName: 'Prof. Michael Chen', role: 'lecturer', faculty: 'Mathematics', status: 'Active' }
    ];

    dummyUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
            <td>${user.faculty}</td>
            <td><span class="status-badge status-online">${user.status}</span></td>
            <td class="action-buttons">
                <button class="btn-action btn-edit" onclick="editUser(${user.id})">Edit</button>
                ${user.id !== 1 ? `<button class="btn-action btn-delete" onclick="deleteUser(${user.id})">Delete</button>` : ''}
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Record management functions
function editWorkingRecord(id) {
    const record = workingRecords.find(r => r.id === id);
    if (record && (currentUser.is_admin || record.lecturerName === currentUser.fullName)) {
        // Populate form with record data
        document.getElementById('workDate').value = record.date;
        document.getElementById('workMonth').value = record.month;
        document.getElementById('lecturerName').value = record.lecturerName;
        document.getElementById('facultyName').value = record.facultyName;
        document.getElementById('sourceName').value = record.sourceName;
        document.getElementById('lessonName').value = record.lessonName;
        document.getElementById('startTime').value = record.startTime;
        document.getElementById('endTime').value = record.endTime;
        
        if (record.mode === 'Online') {
            document.getElementById('online').checked = true;
        } else {
            document.getElementById('physical').checked = true;
        }
        
        // Remove record from list
        deleteWorkingRecord(id, false);
        
        // Switch to working form tab
        document.querySelector('.tab[data-target="working-form"]').click();
    }
}

function deleteWorkingRecord(id, confirm = true) {
    if (!confirm || window.confirm('Are you sure you want to delete this working record?')) {
        workingRecords = workingRecords.filter(record => record.id !== id);
        displayRecords();
    }
}

function editTravelingRecord(id) {
    const record = travelingRecords.find(r => r.id === id);
    if (record && (currentUser.is_admin || record.lecturerName === currentUser.fullName)) {
        // Populate form with record data
        document.getElementById('travelDate').value = record.date;
        document.getElementById('travelStartTime').value = record.startTime;
        document.getElementById('travelEndTime').value = record.endTime;
        document.getElementById('purpose').value = record.purpose;
        document.getElementById('confirmationToken').value = record.confirmationToken;
        
        // Remove record from list
        deleteTravelingRecord(id, false);
        
        // Switch to traveling form tab
        document.querySelector('.tab[data-target="traveling-form"]').click();
    }
}

function deleteTravelingRecord(id, confirm = true) {
    if (!confirm || window.confirm('Are you sure you want to delete this traveling record?')) {
        travelingRecords = travelingRecords.filter(record => record.id !== id);
        displayRecords();
    }
}

// User management functions (admin only)
function editUser(id) {
    alert('Edit user functionality would go here for user ID: ' + id);
}

function deleteUser(id) {
    if (id !== 1 && window.confirm('Are you sure you want to delete this user?')) {
        // In a real app, you would make an API call here
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            displayUsers();
        }
    }
}

addUserBtn.addEventListener('click', function() {
    alert('Add new user functionality would go here');
});

// Filter records when filter changes
recordFilter.addEventListener('change', displayRecords);

// Set today's date as default for date fields
const today = new Date().toISOString().split('T')[0];
document.getElementById('workDate').value = today;
document.getElementById('travelDate').value = today;

// Initial display based on authentication status
if (currentUser.username) {
    showApplication();
} else {
    // This case should ideally be handled by Django's login_required decorator
    // but as a fallback, we can redirect to login
    window.location.href = '/home/login/';
}
