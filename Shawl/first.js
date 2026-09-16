const API_URL = `${window.location.origin}/api`;
let isLoginMode = true;

// DOM Matrix Hooks
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const taskForm = document.getElementById('task-form');
const usernameGroup = document.getElementById('username-group');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleLink = document.getElementById('auth-toggle-link');
const authToggleMsg = document.getElementById('auth-toggle-msg');
const userDisplay = document.getElementById('user-display');
const taskList = document.getElementById('task-list');

// Bootstrapping State Check Lifecycle
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        displayAppSpace();
    }
    
    // Wire UI Action Listeners
    authToggleLink.addEventListener('click', toggleAuthMode);
    authForm.addEventListener('submit', handleAuthSubmit);
    taskForm.addEventListener('submit', handleTaskCreate);
});

// Toast System Controller
function showNotification(msg) {
    const banner = document.getElementById('notification-banner');
    banner.innerText = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 4000);
}

// Authentication Context Switching UI Controllers
function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.innerText = isLoginMode ? 'Account Sign In' : 'Register Account';
    authSubmitBtn.innerText = isLoginMode ? 'Log In' : 'Create Profile';
    authToggleMsg.innerText = isLoginMode ? 'New to the platform?' : 'Have an existing profile?';
    authToggleLink.innerText = isLoginMode ? 'Create Account' : 'Sign In';
    usernameGroup.classList.toggle('hidden', isLoginMode);
    document.getElementById('auth-username').required = !isLoginMode;
}

// Network Request Authentication Orchestrator
async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username').value;

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const payload = isLoginMode ? { email, password } : { username, email, password };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Operation failed Processing Client request');

        if (isLoginMode) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            authForm.reset();
            displayAppSpace();
        } else {
            showNotification('Registration Complete! Proceeding to entry authentication profile.');
            toggleAuthMode({ preventDefault: () => {} });
        }
    } catch (err) {
        showNotification(err.message);
    }
}

function displayAppSpace() {
    authScreen.add('hidden');
    appScreen.classList.remove('hidden');
    userDisplay.innerText = localStorage.getItem('username') || 'Professional';
    loadTasks();
}

function logout() {
    localStorage.clear();
    appScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    taskList.innerHTML = '';
    showNotification('Identity configuration session closed.');
}

// Task Processing Domain Managers
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Data ingestion sync anomaly detected');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (err) {
        showNotification(err.message);
    }
}

function renderTasks(tasks) {
    taskList.innerHTML = tasks.length === 0 ? '<p style="color:#9ca3af; text-align:center;">No pending backlog actions found.</p>' : '';
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
        taskCard.innerHTML = `
            <div class="task-info">
                <strong class="task-title-text">${task.title}</strong>
                <p style="font-size: 13px; color: var(--text-secondary); margin-top:4px;">${task.description || 'No detailed log text input.'}</p>
            </div>
            <div class="task-actions">
                <button class="btn-action" onclick="toggleTaskCompletion('${task._id}', ${task.completed})">
                    ${task.completed ? 'Reopen' : 'Complete'}
                </button>
                <button class="btn-action" style="color:var(--danger);" onclick="deleteTask('${task._id}')">Purge</button>
            </div>
        `;
        taskList.appendChild(taskCard);
    });
}

async function handleTaskCreate(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description })
        });
        if (!response.ok) throw new Error('Persistence request write failure execution');
        taskForm.reset();
        loadTasks();
    } catch (err) {
        showNotification(err.message);
    }
}

async function toggleTaskCompletion(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ completed: !currentStatus })
        });
        if (!response.ok) throw new Error('State adjustment processing error execution');
        loadTasks();
    } catch (err) {
        showNotification(err.message);
    }
}

async function deleteTask(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Purge command failed validation runtime context');
        loadTasks();
    } catch (err) {
        showNotification(err.message);
    }
}
