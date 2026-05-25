// js/auth.js

// Global variable to hold the current user session
let currentUser = null;

// DOM Elements
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const authForm = document.getElementById('auth-form');
const authName = document.getElementById('auth-name');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const toggleAuthMode = document.getElementById('toggle-auth-mode');
const authPrompt = document.getElementById('auth-prompt');
const authError = document.getElementById('auth-error');

let isRegisterMode = false;

// --- 1. Check Session on Page Load ---
async function checkSession() {
    try {
        currentUser = await account.get(); // Fails if no active session
        updateUIForUser(currentUser);
    } catch (err) {
        currentUser = null;
        updateUIForGuest();
    }
}

// --- 2. Update UI based on Auth State ---
function updateUIForUser(user) {
    authBtn.textContent = 'Logout';
    // Optionally show the user's name in the navbar
    // document.getElementById('user-greeting').textContent = `Hi, ${user.name}`;
}

function updateUIForGuest() {
    authBtn.textContent = 'Login';
    // Hide dashboard, kick them to search/help if you want to strictly protect the dashboard
}

// --- 3. Handle Login / Logout / Register ---
authBtn.addEventListener('click', async () => {
    if (currentUser) {
        // Handle Logout
        try {
            await account.deleteSession('current');
            currentUser = null;
            updateUIForGuest();
            alert('Successfully logged out.');
            window.location.reload(); // Quick way to clear data from the screen
        } catch (err) {
            console.error('Logout failed', err);
        }
    } else {
        // Show Login Modal
        authModal.classList.remove('hidden');
    }
});

// --- 4. Form Submission ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    authSubmit.textContent = 'Processing...';

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = authName.value;

    try {
        if (isRegisterMode) {
            // Appwrite requires a unique ID for new users, ID.unique() handles this
            await account.create(ID.unique(), email, password, name);
        }
        
        // Log the user in (runs for both login AND right after registration)
        await account.createEmailPasswordSession(email, password);
        
        // Hide modal & update state
        authModal.classList.add('hidden');
        authForm.reset();
        await checkSession(); 

    } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
    } finally {
        authSubmit.textContent = isRegisterMode ? 'Register' : 'Login';
    }
});

// --- 5. Modal UI Toggles ---
closeAuth.addEventListener('click', () => authModal.classList.add('hidden'));

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    
    if (isRegisterMode) {
        authTitle.textContent = 'Create an Account';
        authSubmit.textContent = 'Register';
        authPrompt.textContent = 'Already have an account?';
        toggleAuthMode.textContent = 'Login here';
        authName.classList.remove('hidden');
        authName.required = true;
    } else {
        authTitle.textContent = 'Login to ShowTraxer';
        authSubmit.textContent = 'Login';
        authPrompt.textContent = "Don't have an account?";
        toggleAuthMode.textContent = 'Register here';
        authName.classList.add('hidden');
        authName.required = false;
    }
});

// Initialize app state
checkSession();
