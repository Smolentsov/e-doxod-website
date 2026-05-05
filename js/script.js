/* ============================================
   e-doxod.ru — Main JavaScript
   Features: Scroll animations, Mobile menu,
   Click tracking, Lazy loading, Analytics
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        // Telegram bot link with UTM tracking
        botUrl: 'https://t.me/e_doxod_bot',

        // Analytics (Google Analytics 4 ID — замените на свой)
        gaId: 'G-XXXXXXXXXX',

        // Scroll animation offset
        revealOffset: 100,

        // Smooth scroll duration
        scrollDuration: 800
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // MOBILE MENU
    // ============================================

    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');

        if (!menuBtn || !nav) return;

        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuBtn.classList.toggle('active');

            // Animate hamburger
            const spans = menuBtn.querySelectorAll('span');
            if (nav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================

    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================

    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const revealOnScroll = () => {
            reveals.forEach(el => {
                const windowHeight = window.innerHeight;
                const elementTop = el.getBoundingClientRect().top;
                const revealPoint = CONFIG.revealOffset;

                if (elementTop < windowHeight - revealPoint) {
                    el.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', throttle(revealOnScroll, 50), { passive: true });
        revealOnScroll(); // Initial check
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // CLICK TRACKING (Analytics)
    // ============================================

    function initClickTracking() {
        // Track all CTA clicks
        document.querySelectorAll('[data-track]').forEach(el => {
            el.addEventListener('click', function(e) {
                const trackEvent = this.getAttribute('data-track');
                const trackLabel = this.getAttribute('data-track-label') || '';

                // Google Analytics 4 event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'cta',
                        event_label: trackEvent,
                        value: trackLabel
                    });
                }

                // Console log for debugging
                console.log('[TRACK] Click:', trackEvent, trackLabel);

                // Send to Telegram bot with UTM
                if (this.href && this.href.includes('t.me/e_doxod_bot')) {
                    const url = new URL(this.href);
                    url.searchParams.set('start', trackEvent);
                    this.href = url.toString();
                }
            });
        });

        // Track Telegram widget clicks
        const tgWidget = document.querySelector('.telegram-widget a');
        if (tgWidget) {
            tgWidget.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'telegram_widget',
                        event_label: 'floating_button'
                    });
                }
            });
        }
    }

    // ============================================
    // LAZY LOADING IMAGES
    // ============================================

    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // ============================================
    // GOOGLE ANALYTICS 4 INIT
    // ============================================

    function initAnalytics() {
        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', CONFIG.gaId, {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
        });
    }

    // ============================================
    // TELEGRAM BOT DEEP LINK HANDLER
    // ============================================

    function initTelegramLinks() {
        // Add UTM parameters to all Telegram bot links
        document.querySelectorAll('a[href*="t.me/e_doxod_bot"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const currentUrl = new URL(this.href);
                const pagePath = window.location.pathname.replace(/\//g, '_').replace(/^_/, '') || 'main';

                // Add start parameter for bot tracking
                if (!currentUrl.searchParams.has('start')) {
                    currentUrl.searchParams.set('start', `site_${pagePath}`);
                }

                this.href = currentUrl.toString();
            });
        });
    }

    // ============================================
    // EMAIL FORM HANDLER (Google Forms)
    // ============================================

    function initEmailForm() {
        const form = document.querySelector('.email-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;

            if (!email || !email.includes('@')) {
                showNotification('Пожалуйста, введите корректный email', 'error');
                return;
            }

            // Here you can integrate with Google Forms, Mailchimp, etc.
            // Example Google Forms integration:
            // const formUrl = 'YOUR_GOOGLE_FORM_URL';
            // fetch(formUrl, { method: 'POST', body: new FormData(this) });

            showNotification('Спасибо! Вы подписаны на обновления.', 'success');
            this.reset();

            // Track subscription
            if (typeof gtag !== 'undefined') {
                gtag('event', 'subscribe', {
                    event_category: 'engagement',
                    event_label: 'email_subscription'
                });
            }
        });
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 24px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#00C853' : '#ff4444'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;

        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // ============================================
    // DARK MODE TOGGLE (Optional)
    // ============================================

    function initDarkMode() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedMode = localStorage.getItem('dark-mode');

        if (savedMode === 'dark' || (!savedMode && prefersDark)) {
            document.documentElement.classList.add('dark');
        }

        toggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('dark-mode', isDark ? 'dark' : 'light');
        });
    }

    // ============================================
    // PAGE LOAD OPTIMIZATION
    // ============================================

    function initPageLoad() {
        document.body.classList.add('loaded');

        // Preload critical resources
        const criticalImages = document.querySelectorAll('img[loading="eager"]');
        criticalImages.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => img.classList.add('loaded'));
            }
        });
    }

    // ============================================
    // COUNTER ANIMATION
    // ============================================

    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-counter'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const update = () => {
                current += step;
                if (current < target) {
                    el.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target.toLocaleString();
                }
            };

            update();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ============================================
    // INITIALIZE EVERYTHING
    // ============================================

    document.addEventListener('DOMContentLoaded', () => {
        initMobileMenu();
        initHeaderScroll();
        initScrollReveal();
        initSmoothScroll();
        initClickTracking();
        initLazyLoading();
        initTelegramLinks();
        initEmailForm();
        initDarkMode();
        initPageLoad();
        initCounters();

        // Initialize analytics (uncomment when GA ID is set)
        // initAnalytics();

        console.log('✅ e-doxod.ru initialized successfully');
    });

    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        body.loaded { opacity: 1; }
        body { opacity: 0; transition: opacity 0.3s ease; }
        img[data-src] { opacity: 0; transition: opacity 0.5s ease; }
        img.loaded { opacity: 1; }
    `;
    document.head.appendChild(style);

})();
