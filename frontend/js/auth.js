// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Password strength meter (for signup)
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const strengthBar = document.querySelector('.strength-bar');
        if (strengthBar) {
            const strength = calculatePasswordStrength(this.value);
            strengthBar.style.width = strength + '%';
        }
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
}

// Login Form Submit
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to dashboard
                window.location.href = '/pages/dashboard.html';
            } else {
                alert(data.detail || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error. Please try again.');
        }
    });
}

// Signup Form Submit
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    full_name: fullname,
                    email, 
                    password 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Account created successfully! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(data.detail || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Network error. Please try again.');
        }
    });
}

// Google OAuth Login
document.getElementById('googleLoginBtn')?.addEventListener('click', function() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/auth/google/login';
});

// Google OAuth Signup
document.getElementById('googleSignupBtn')?.addEventListener('click', function() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/auth/google/login';
});

// Create particles animation
function createAuthParticles() {
    const container = document.getElementById('particles-auth');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `radial-gradient(circle, rgba(124, 58, 237, ${Math.random() * 0.5}) 0%, transparent 70%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', createAuthParticles);
