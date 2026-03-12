// App State Management
let apps = [];
let currentApp = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadApps();
    loadSettings();
    setupEventListeners();
    setupServiceWorker();
});

// Load apps from localStorage
function loadApps() {
    const savedApps = localStorage.getItem('cloneApps');
    if (savedApps) {
        apps = JSON.parse(savedApps);
    } else {
        // Default apps
        apps = [
            {
                id: generateId(),
                name: 'Google',
                url: 'https://www.google.com',
                icon: '🔍'
            },
            {
                id: generateId(),
                name: 'YouTube',
                url: 'https://www.youtube.com',
                icon: '📺'
            },
            {
                id: generateId(),
                name: 'Facebook',
                url: 'https://www.facebook.com',
                icon: '📱'
            },
            {
                id: generateId(),
                name: 'Twitter',
                url: 'https://www.twitter.com',
                icon: '🐦'
            }
        ];
    }
    renderApps();
}

// Save apps to localStorage
function saveApps() {
    localStorage.setItem('cloneApps', JSON.stringify(apps));
    renderApps();
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Render apps in grid
function renderApps() {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;

    if (apps.length === 0) {
        grid.innerHTML = '<div class="empty-state">No apps added yet. Click "Add App" to get started!</div>';
        return;
    }

    grid.innerHTML = apps.map(app => `
        <div class="app-card" onclick="openApp('${app.id}')">
            <div class="app-icon">
                ${app.icon.startsWith('http') ? `<img src="${app.icon}" alt="${app.name}" loading="lazy">` : app.icon}
            </div>
            <div class="app-name">${app.name}</div>
            <div class="app-actions" onclick="event.stopPropagation()">
                <button class="edit-btn" onclick="editApp('${app.id}')" title="Edit">✏️</button>
                <button class="delete-btn" onclick="deleteApp('${app.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Open app in viewer
function openApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    currentApp = app;
    document.getElementById('viewerTitle').textContent = app.name;
    
    const frame = document.getElementById('appFrame');
    frame.src = app.url;
    
    document.getElementById('appViewer').classList.add('active');
    
    // Add loading indicator
    showLoading();
    
    frame.onload = function() {
        hideLoading();
    };
    
    frame.onerror = function() {
        hideLoading();
        showToast('Failed to load app', 'error');
    };
}

// Close app viewer
function closeAppViewer() {
    document.getElementById('appViewer').classList.remove('active');
    document.getElementById('appFrame').src = 'about:blank';
    currentApp = null;
}

// Add new app
function addNewApp(event) {
    event.preventDefault();
    
    const name = document.getElementById('appName').value.trim();
    const url = document.getElementById('appUrl').value.trim();
    let icon = document.getElementById('appIcon').value.trim();
    
    if (!name || !url) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    // Set default icon if not provided
    if (!icon) {
        icon = '📱';
    }
    
    const newApp = {
        id: generateId(),
        name,
        url,
        icon
    };
    
    apps.push(newApp);
    saveApps();
    
    // Reset form
    document.getElementById('addAppForm').reset();
    
    // Show home screen
    showHome();
    
    showToast('App added successfully!');
}

// Edit app
function editApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    const newName = prompt('Enter new app name:', app.name);
    if (newName && newName.trim()) {
        app.name = newName.trim();
    }
    
    const newUrl = prompt('Enter new app URL:', app.url);
    if (newUrl && newUrl.trim()) {
        try {
            new URL(newUrl.trim());
            app.url = newUrl.trim();
        } catch {
            showToast('Invalid URL', 'error');
        }
    }
    
    const newIcon = prompt('Enter new app icon:', app.icon);
    if (newIcon && newIcon.trim()) {
        app.icon = newIcon.trim();
    }
    
    saveApps();
    showToast('App updated successfully!');
}

// Delete app
function deleteApp(appId) {
    if (confirm('Are you sure you want to delete this app?')) {
        apps = apps.filter(a => a.id !== appId);
        saveApps();
        showToast('App deleted successfully!');
    }
}

// Clear all apps
function clearAllApps() {
    if (confirm('Are you sure you want to delete ALL apps? This cannot be undone!')) {
        apps = [];
        saveApps();
        showToast('All apps cleared!');
    }
}

// Screen navigation
function showHome() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    closeMenu();
}

function showAddApp() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('addAppScreen').classList.add('active');
    closeMenu();
}

function showSettings() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('settingsScreen').classList.add('active');
    closeMenu();
}

function showAbout() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('aboutScreen').classList.add('active');
    closeMenu();
}

// Menu functions
function closeMenu() {
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sideMenu').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    });
    
    document.getElementById('closeMenu').addEventListener('click', closeMenu);
    document.getElementById('overlay').addEventListener('click', closeMenu);
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Grid size selector
    document.getElementById('gridSize').addEventListener('change', (e) => {
        const grid = document.getElementById('appsGrid');
        grid.style.gridTemplateColumns = `repeat(${e.target.value}, 1fr)`;
        localStorage.setItem('gridSize', e.target.value);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAppViewer();
            closeMenu();
        }
    });
    
    // Handle iframe navigation
    window.addEventListener('message', (event) => {
        if (event.data === 'close-app') {
            closeAppViewer();
        }
    });
}

// Load settings
function loadSettings() {
    // Dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
    
    // Grid size
    const gridSize = localStorage.getItem('gridSize');
    if (gridSize) {
        document.getElementById('gridSize').value = gridSize;
        document.getElementById('appsGrid').style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show loading indicator
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.id = 'loadingIndicator';
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.zIndex = '2500';
    
    document.body.appendChild(loader);
}

// Hide loading indicator
function hideLoading() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.remove();
    }
}

// Setup service worker for PWA
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}

// Handle offline detection
window.addEventListener('online', () => {
    showToast('You are back online!');
});

window.addEventListener('offline', () => {
    showToast('You are offline. Some features may be limited.', 'info');
});

// Prevent memory leaks
window.addEventListener('beforeunload', () => {
    if (currentApp) {
        closeAppViewer();
    }
});

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
                  }
