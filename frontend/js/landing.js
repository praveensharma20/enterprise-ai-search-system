// Particle animation
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
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
        
        particlesContainer.appendChild(particle);
    }
}

// CSS animation for particles
const style = document.createElement('style');
style.innerHTML = `
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
            opacity: 0;
        }
        50% {
            opacity: 0.8;
        }
        25% {
            transform: translate(100px, -100px);
        }
        75% {
            transform: translate(-100px, 100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});
