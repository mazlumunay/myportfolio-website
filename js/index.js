/* 
 * index.js - Optimized version
 * Performance improvements and production-ready updates
 */

(function() {
    'use strict';

    // Utility Functions
    const utils = {
        smoothScrollTo: function(target) {
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },

        animateCounter: function(element) {
            const target = parseInt(element.getAttribute('data-count'));
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 30);
        },

        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom >= 0;
        },

        addFadeInAnimation: function() {
            // Use requestAnimationFrame for improved performance
            requestAnimationFrame(() => {
                setTimeout(() => {
                    document.querySelectorAll('.fade-in-up').forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('animate');
                        }, index * 200);
                    });
                }, 300);
            });
        },
        
        debounce: function(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(context, args);
                }, wait);
            };
        }
    };

    // EmailJS Configuration (for contact form)
    const emailJS = {
        publicKey: 'IGYf_20wd6PVSqMbe',
        serviceID: 'service_vniltzj',
        templateID: 'template_2tlsc4l',

        init: function() {
            if (typeof emailjs !== 'undefined') {
                emailjs.init({
                    publicKey: this.publicKey
                });
            }
        },

        sendEmail: function(templateParams) {
            return emailjs.send(this.serviceID, this.templateID, templateParams);
        }
    };

    // Navbar Functionality
    const navbar = {
        init: function() {
            // Use debounced scroll listener for better performance
            window.addEventListener('scroll', utils.debounce(this.handleScroll.bind(this), 10));
            // Call once on load to set initial state
            this.handleScroll();
        },

        handleScroll: function() {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        }
    };

    // Contact Form Functionality with spam protection
    const contactForm = {
        form: null,
        isSubmitting: false,

        init: function() {
            this.form = document.getElementById('contactForm');
            if (this.form) {
                this.form.addEventListener('submit', this.handleSubmit.bind(this));
                
                // Add honeypot field for spam protection
                this.addHoneypot();
            }
        },
        
        addHoneypot: function() {
            if (!this.form) return;
            
            // Create hidden honeypot field that only bots would fill out
            const honeypot = document.createElement('div');
            honeypot.style.display = 'none';
            honeypot.innerHTML = `
                <label for="website">Website (leave empty)</label>
                <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
            `;
            this.form.appendChild(honeypot);
        },

        handleSubmit: function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent multiple submissions
            if (this.isSubmitting) return;
            
            // Simple spam protection - check honeypot field
            const honeypot = this.form.querySelector('#website');
            if (honeypot && honeypot.value) {
                // Bot detected, silently reject
                console.warn('Spam submission detected');
                this.form.reset();
                return;
            }

            if (this.form.checkValidity()) {
                this.isSubmitting = true;
                this.sendEmail();
            }

            this.form.classList.add('was-validated');
        },

        sendEmail: function() {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(this.form);
            const templateParams = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company') || 'Not provided',
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            // Send email using EmailJS
            emailJS.sendEmail(templateParams)
                .then((response) => {
                    this.showSuccess(submitBtn, originalText);
                })
                .catch((error) => {
                    this.showError(submitBtn, originalText);
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },

        showSuccess: function(submitBtn, originalText) {
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Message Sent!';
            submitBtn.classList.remove('btn-warning');
            submitBtn.classList.add('btn-success');

            // Show success message
            this.showAlert('success', 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.');

            // Reset form
            this.form.reset();
            this.form.classList.remove('was-validated');

            // Reset button after delay
            this.resetButton(submitBtn, originalText, 'btn-info');
            
            // Track successful submission (if analytics is available)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form'
                });
            }
        },

        showError: function(submitBtn, originalText) {
            submitBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Failed to Send';
            submitBtn.classList.remove('btn-info');
            submitBtn.classList.add('btn-danger');

            // Show error message
            this.showAlert('danger', 'Sorry! There was an error sending your message. Please try again or contact me directly at unaymazlum@gmail.com.');

            // Reset button after delay
            this.resetButton(submitBtn, originalText, 'btn-info');
        },

        showAlert: function(type, message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} mt-3`;
            alertDiv.setAttribute('role', 'alert');
            alertDiv.innerHTML = `
                <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'x-circle-fill'} me-2"></i>
                ${message}
            `;
            
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.parentNode.insertBefore(alertDiv, submitBtn.nextSibling);

            // Remove alert after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        },

        resetButton: function(submitBtn, originalText, btnClass) {
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-success', 'btn-danger');
                submitBtn.classList.add(btnClass);
            }, 5000);
        }
    };

    // Counter Animation with Intersection Observer for better performance
    const counters = {
        observer: null,
        
        init: function() {
            const counters = document.querySelectorAll('[data-count]');
            if (counters.length === 0) return;
            
            // Use Intersection Observer API for better performance
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        utils.animateCounter(entry.target);
                        // Stop observing once animated
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            // Observe each counter
            counters.forEach(counter => {
                this.observer.observe(counter);
            });
        }
    };

    // Project Card Hover Effects with event delegation for better performance
    const projectCards = {
        init: function() {
            // Use event delegation for better performance
            const containers = document.querySelectorAll('.row, .container');
            containers.forEach(container => {
                container.addEventListener('mouseover', this.handleMouseOver.bind(this));
                container.addEventListener('mouseout', this.handleMouseOut.bind(this));
            });
        },

        handleMouseOver: function(e) {
            const card = e.target.closest('.project-card');
            if (card) {
                card.style.transform = 'translateY(-4px)';
                card.style.transition = 'transform 0.3s ease';
            }
        },

        handleMouseOut: function(e) {
            const card = e.target.closest('.project-card');
            if (card) {
                card.style.transform = '';
            }
        }
    };

    // Smooth Scroll for Anchor Links with event delegation
    const smoothScroll = {
        init: function() {
            // Use event delegation for better performance
            document.addEventListener('click', this.handleClick.bind(this));
        },

        handleClick: function(e) {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                if (target && target !== '#') {
                    utils.smoothScrollTo(target);
                    
                    // Update URL if supported
                    if (history.pushState) {
                        history.pushState(null, null, target);
                    }
                    
                    // Track navigation (if analytics is available)
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'navigation', {
                            'event_category': 'Internal Links',
                            'event_label': target
                        });
                    }
                }
            }
        }
    };

    // Loading Performance
    const performance = {
        init: function() {
            // Lazy load images that are out of viewport
            this.setupLazyLoading();
            
            // Mark page as fully loaded
            window.addEventListener('load', this.pageLoaded);
        },
        
        setupLazyLoading: function() {
            // Use native lazy loading if available
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        },
        
        pageLoaded: function() {
            document.body.classList.add('page-loaded');
            
            // Report performance metrics if available
            if (window.performance && window.performance.timing && typeof gtag !== 'undefined') {
                // Wait for all timing data to be available
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                    
                    gtag('event', 'timing_complete', {
                        'name': 'page_load',
                        'value': pageLoadTime,
                        'event_category': 'Performance'
                    });
                }, 0);
            }
        }
    };

    // Page-specific initializations
    const pageSpecific = {
        init: function() {
            const currentPage = this.getCurrentPage();
            
            switch(currentPage) {
                case 'contact':
                    emailJS.init();
                    break;
                case 'projects':
                case 'publications':
                    // These pages have fade-in animations
                    utils.addFadeInAnimation();
                    break;
            }
            
            // Add page name as class to body for page-specific styling
            document.body.classList.add(`page-${currentPage}`);
        },

        getCurrentPage: function() {
            const path = window.location.pathname;
            if (path.includes('contact.html')) return 'contact';
            if (path.includes('projects.html')) return 'projects';
            if (path.includes('publications.html')) return 'publications';
            if (path.includes('about.html')) return 'about';
            return 'home';
        }
    };

    // Enhanced accessibility
    const accessibility = {
        init: function() {
            this.improveKeyboardNavigation();
            this.enhanceAriaAttributes();
        },
        
        improveKeyboardNavigation: function() {
            // Focus outline is only shown for keyboard navigation
            document.body.addEventListener('mousedown', () => {
                document.body.classList.add('using-mouse');
            });
            
            document.body.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.remove('using-mouse');
                }
            });
        },
        
        enhanceAriaAttributes: function() {
            // Add missing aria attributes
            const navToggle = document.querySelector('.navbar-toggler');
            if (navToggle && !navToggle.getAttribute('aria-expanded')) {
                navToggle.setAttribute('aria-expanded', 'false');
            }
            
            // Ensure all interactive elements have appropriate ARIA roles
            document.querySelectorAll('button').forEach(btn => {
                if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                    // Try to find an icon and use its class for a label
                    const icon = btn.querySelector('i.bi');
                    if (icon) {
                        const iconClass = Array.from(icon.classList)
                            .find(cls => cls.startsWith('bi-'));
                        if (iconClass) {
                            btn.setAttribute('aria-label', 
                                iconClass.replace('bi-', '').replace(/-/g, ' '));
                        }
                    }
                }
            });
        }
    };

    // Main Application
    const app = {
        init: function() {
            // Check for browser support
            if (!this.checkBrowserSupport()) {
                this.showBrowserWarning();
                return;
            }
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.start.bind(this));
            } else {
                this.start();
            }
        },
        
        checkBrowserSupport: function() {
            // Check for critical browser features
            return (
                'querySelector' in document &&
                'addEventListener' in window &&
                'classList' in document.createElement('div')
            );
        },
        
        showBrowserWarning: function() {
            // Create a warning for outdated browsers
            const warning = document.createElement('div');
            warning.className = 'browser-warning';
            warning.innerHTML = `
                <div style="padding: 20px; background-color: #f44336; color: white; text-align: center;">
                    <p>Your browser is outdated and may not display this website correctly.</p>
                    <p>Please update to a modern browser like Chrome, Firefox, Safari, or Edge.</p>
                </div>
            `;
            document.body.insertBefore(warning, document.body.firstChild);
        },

        start: function() {
            // Initialize all modules
            performance.init();
            navbar.init();
            contactForm.init();
            counters.init();
            projectCards.init();
            smoothScroll.init();
            accessibility.init();
            utils.addFadeInAnimation();
            pageSpecific.init();
        }
    };

    // Auto-initialize when script loads
    app.init();

})();