/*
 * index.js - Highly optimized version
 * Performance improvements and production-ready updates
 */

(function () {
  "use strict";

  // Cache DOM selectors and frequently accessed elements
  const DOM = {
    body: document.body,
    navbar: document.querySelector(".navbar"),
    contactForm: document.getElementById("contactForm"),
    counters: document.querySelectorAll("[data-count]"),
    fadeElements: document.querySelectorAll(".fade-in-up"),
  };

  // Utility Functions - optimized with performance in mind
  const utils = {
    smoothScrollTo: function (target) {
      const element = document.querySelector(target);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },

    animateCounter: function (element) {
      const target = parseInt(element.getAttribute("data-count"), 10);
      let current = 0;
      const increment = Math.max(1, target / 50);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
          return;
        }
        element.textContent = Math.floor(current);
      }, 30);
    },

    // Removed isInViewport as it's replaced by IntersectionObserver

    addFadeInAnimation: function () {
      // Use requestAnimationFrame for best visual performance
      if (!DOM.fadeElements.length) return;

      requestAnimationFrame(() => {
        DOM.fadeElements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add("animate");
          }, 100 + index * 150); // Staggered animation
        });
      });
    },

    // Improved debounce with immediate option
    debounce: function (func, wait, immediate = false) {
      let timeout;
      return function () {
        const context = this;
        const args = arguments;
        const later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    // Added throttle for scroll events
    throttle: function (func, limit) {
      let inThrottle;
      return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
  };

  // EmailJS Configuration - unchanged but moved to a module pattern
  const emailJS = {
    // Credentials should ideally be moved to environment variables
    publicKey: "IGYf_20wd6PVSqMbe",
    serviceID: "service_vniltzj",
    templateID: "template_2tlsc4l",

    init: function () {
      if (typeof emailjs !== "undefined") {
        emailjs.init({ publicKey: this.publicKey });
      }
    },

    sendEmail: function (templateParams) {
      return emailjs.send(this.serviceID, this.templateID, templateParams);
    },
  };

  // Navbar Functionality - optimized with throttle
  const navbar = {
    init: function () {
      if (!DOM.navbar) return;

      // Use throttled scroll listener for better performance
      window.addEventListener("scroll", utils.throttle(this.handleScroll, 100));

      // Set initial state
      this.handleScroll();
    },

    handleScroll: function () {
      if (!DOM.navbar) return;

      // Simplified class toggle based on scroll position
      const scrolled = window.scrollY > 50;
      DOM.navbar.classList.toggle("scrolled", scrolled);
      DOM.navbar.classList.toggle("navbar-scrolled", scrolled);

      // Apply styles directly instead of manipulating in both JS locations
      if (scrolled) {
        DOM.navbar.style.backgroundColor = "rgba(26, 31, 46, 0.9)";
        DOM.navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)";
        DOM.navbar.style.backdropFilter = "blur(10px)";
      } else {
        DOM.navbar.style.backgroundColor = "transparent";
        DOM.navbar.style.boxShadow = "none";
        DOM.navbar.style.backdropFilter = "none";
      }
    },
  };

  // Contact Form Functionality - optimized validation and feedback
  const contactForm = {
    isSubmitting: false,

    init: function () {
      if (!DOM.contactForm) return;

      DOM.contactForm.addEventListener("submit", this.handleSubmit.bind(this));

      // Add honeypot field for spam protection
      this.addHoneypot();
    },

    addHoneypot: function () {
      if (!DOM.contactForm) return;

      // Create hidden honeypot field using fragment for better performance
      const fragment = document.createDocumentFragment();
      const honeypot = document.createElement("div");
      honeypot.style.cssText =
        "position:absolute;left:-9999px;visibility:hidden;";
      honeypot.innerHTML = `
                <label for="website">Website (leave empty)</label>
                <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
            `;
      fragment.appendChild(honeypot);
      DOM.contactForm.appendChild(fragment);
    },

    handleSubmit: function (e) {
      e.preventDefault();

      // Prevent multiple submissions and check honeypot
      if (this.isSubmitting) return;
      const honeypot = DOM.contactForm.querySelector("#website");
      if (honeypot?.value) {
        // Bot detected, silently reject without any feedback
        DOM.contactForm.reset();
        return;
      }

      if (DOM.contactForm.checkValidity()) {
        this.isSubmitting = true;
        this.sendEmail();
      }

      DOM.contactForm.classList.add("was-validated");
    },

    sendEmail: function () {
      const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
      submitBtn.disabled = true;

      // Collect form data more efficiently
      const formData = new FormData(DOM.contactForm);
      const templateParams = {
        name: formData.get("name"),
        email: formData.get("email"),
        company: formData.get("company") || "Not provided",
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      // Send email using EmailJS
      emailJS
        .sendEmail(templateParams)
        .then(() => this.showSuccess(submitBtn, originalText))
        .catch(() => this.showError(submitBtn, originalText))
        .finally(() => {
          this.isSubmitting = false;
        });
    },

    showSuccess: function (submitBtn, originalText) {
      submitBtn.innerHTML =
        '<i class="bi bi-check-circle me-2"></i>Message Sent!';
      submitBtn.classList.remove("btn-warning");
      submitBtn.classList.add("btn-success");

      // Show success message
      this.showAlert(
        "success",
        "Thank you! Your message has been sent successfully. I'll get back to you soon."
      );

      // Reset form
      DOM.contactForm.reset();
      DOM.contactForm.classList.remove("was-validated");

      // Reset button after delay
      this.resetButton(submitBtn, originalText, "btn-info");

      // Track successful submission with modern analytics API
      if (typeof gtag !== "undefined") {
        gtag("event", "form_submission", {
          event_category: "Contact",
          event_label: "Contact Form",
        });
      }
    },

    showError: function (submitBtn, originalText) {
      submitBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Failed to Send';
      submitBtn.classList.remove("btn-info");
      submitBtn.classList.add("btn-danger");

      // Show error message
      this.showAlert(
        "danger",
        "Sorry! There was an error sending your message. Please try again or contact me directly at unaymazlum@gmail.com."
      );

      // Reset button after delay
      this.resetButton(submitBtn, originalText, "btn-info");
    },

    // Create alert with DocumentFragment for better performance
    showAlert: function (type, message) {
      const fragment = document.createDocumentFragment();
      const alertDiv = document.createElement("div");
      alertDiv.className = `alert alert-${type} mt-3`;
      alertDiv.setAttribute("role", "alert");
      alertDiv.innerHTML = `
                <i class="bi bi-${
                  type === "success" ? "check-circle-fill" : "x-circle-fill"
                } me-2"></i>
                ${message}
            `;

      fragment.appendChild(alertDiv);

      const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
      if (submitBtn?.parentNode) {
        submitBtn.parentNode.insertBefore(fragment, submitBtn.nextSibling);
      }

      // Remove alert after 5 seconds
      setTimeout(() => alertDiv.remove(), 5000);
    },

    resetButton: function (submitBtn, originalText, btnClass) {
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.className = `btn ${btnClass}`;
      }, 5000);
    },
  };

  // Counter Animation with Intersection Observer - unchanged but optimized
  const counters = {
    observer: null,

    init: function () {
      if (!DOM.counters.length) return;

      // Use Intersection Observer API for better performance
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              utils.animateCounter(entry.target);
              // Stop observing once animated
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px 50px 0px", // Start animation a bit before elements come into view
        }
      );

      // Observe each counter
      DOM.counters.forEach((counter) => this.observer.observe(counter));
    },
  };

  // Project Card Hover Effects with event delegation - optimized
  const projectCards = {
    init: function () {
      // Use single delegated event listener on body for all cards
      DOM.body.addEventListener("mouseover", this.handleMouseOver);
      DOM.body.addEventListener("mouseout", this.handleMouseOut);
    },

    handleMouseOver: function (e) {
      const card = e.target.closest(".project-card");
      if (card) {
        // Use CSS transform for GPU acceleration
        card.style.transform = "translateY(-4px)";
      }
    },

    handleMouseOut: function (e) {
      const card = e.target.closest(".project-card");
      if (card) {
        card.style.transform = "";
      }
    },
  };

  // Smooth Scroll with event delegation - optimized
  const smoothScroll = {
    init: function () {
      // Single event listener on body for better performance
      DOM.body.addEventListener("click", this.handleClick);
    },

    handleClick: function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const target = anchor.getAttribute("href");
      if (target && target !== "#") {
        e.preventDefault();
        utils.smoothScrollTo(target);

        // Update URL with pushState if supported
        if (history.pushState) {
          history.pushState(null, null, target);
        }

        // Track navigation with modern analytics API
        if (typeof gtag !== "undefined") {
          gtag("event", "navigation", {
            event_category: "Internal Links",
            event_label: target,
          });
        }
      }
    },
  };

  // Loading Performance - optimized image loading
  const performance = {
    init: function () {
      // Setup lazy loading and prefetching
      this.setupLazyLoading();
      this.prefetchCriticalAssets();

      // Mark page as fully loaded
      window.addEventListener("load", this.pageLoaded);
    },

    setupLazyLoading: function () {
      // Use native lazy loading with fallback to Intersection Observer
      if ("loading" in HTMLImageElement.prototype) {
        // Native lazy loading available
        document.querySelectorAll("img:not([loading])").forEach((img) => {
          img.loading = "lazy";
        });
      } else {
        // Fallback for browsers that don't support native lazy loading
        this.setupLazyLoadingFallback();
      }
    },

    setupLazyLoadingFallback: function () {
      const lazyImages = document.querySelectorAll("img[data-src]");
      if (!lazyImages.length) return;

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    },

    prefetchCriticalAssets: function () {
      // Add prefetch for critical resources
      const head = document.head;
      const criticalAssets = [
        // Add your critical CSS/JS/font files here
        "/css/main.css",
        "/js/vendors.min.js",
      ];

      criticalAssets.forEach((asset) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = asset;
        head.appendChild(link);
      });
    },

    pageLoaded: function () {
      DOM.body.classList.add("page-loaded");

      // Report web vitals if available
      if (window.performance && typeof gtag !== "undefined") {
        // Wait for timing data
        setTimeout(() => {
          if (window.performance.timing) {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

            gtag("event", "timing_complete", {
              name: "page_load",
              value: pageLoadTime,
              event_category: "Performance",
            });
          }

          // Report Core Web Vitals if available
          if ("web-vitals" in window) {
            window["web-vitals"].getCLS((metric) => {
              gtag("event", "CLS", { value: metric.value });
            });
            window["web-vitals"].getFID((metric) => {
              gtag("event", "FID", { value: metric.value });
            });
            window["web-vitals"].getLCP((metric) => {
              gtag("event", "LCP", { value: metric.value });
            });
          }
        }, 0);
      }
    },
  };

  // Page-specific initializations - optimized
  const pageSpecific = {
    init: function () {
      const currentPage = this.getCurrentPage();

      // Only run page-specific code when needed
      switch (currentPage) {
        case "contact":
          emailJS.init();
          break;
        case "projects":
        case "publications":
          utils.addFadeInAnimation();
          break;
      }

      // Add page name as class to body for page-specific styling
      DOM.body.classList.add(`page-${currentPage}`);
    },

    getCurrentPage: function () {
      const path = window.location.pathname;
      if (path.includes("contact.html")) return "contact";
      if (path.includes("projects.html")) return "projects";
      if (path.includes("publications.html")) return "publications";
      if (path.includes("about.html")) return "about";
      return "home";
    },
  };

  // Enhanced accessibility - optimized
  const accessibility = {
    init: function () {
      this.improveKeyboardNavigation();
      this.enhanceAriaAttributes();
    },

    improveKeyboardNavigation: function () {
      // Focus outline is only shown for keyboard navigation
      DOM.body.addEventListener("mousedown", () => {
        DOM.body.classList.add("using-mouse");
      });

      DOM.body.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          DOM.body.classList.remove("using-mouse");
        }
      });
    },

    enhanceAriaAttributes: function () {
      // Add missing aria attributes
      const navToggle = document.querySelector(".navbar-toggler");
      if (navToggle && !navToggle.getAttribute("aria-expanded")) {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Toggle navigation");
      }

      // Ensure all interactive elements have appropriate ARIA roles
      document.querySelectorAll("button:not([aria-label])").forEach((btn) => {
        if (!btn.textContent.trim()) {
          // Try to find an icon and use its class for a label
          const icon = btn.querySelector("i.bi");
          if (icon) {
            const iconClass = Array.from(icon.classList).find((cls) =>
              cls.startsWith("bi-")
            );
            if (iconClass) {
              btn.setAttribute(
                "aria-label",
                iconClass.replace("bi-", "").replace(/-/g, " ")
              );
            }
          }
        }
      });
    },
  };

  // Main Application - optimized initialization
  const app = {
    init: function () {
      // Check for browser support
      if (!this.checkBrowserSupport()) {
        this.showBrowserWarning();
        return;
      }

      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", this.start.bind(this));
      } else {
        this.start();
      }
    },

    checkBrowserSupport: function () {
      // Check for critical browser features
      return (
        "querySelector" in document &&
        "addEventListener" in window &&
        "classList" in document.createElement("div")
      );
    },

    showBrowserWarning: function () {
      // Create a warning for outdated browsers using fragment
      const fragment = document.createDocumentFragment();
      const warning = document.createElement("div");
      warning.className = "browser-warning";
      warning.innerHTML = `
                <div style="padding: 20px; background-color: #f44336; color: white; text-align: center;">
                    <p>Your browser is outdated and may not display this website correctly.</p>
                    <p>Please update to a modern browser like Chrome, Firefox, Safari, or Edge.</p>
                </div>
            `;
      fragment.appendChild(warning);
      DOM.body.insertBefore(fragment, DOM.body.firstChild);
    },

    start: function () {
      // Initialize core modules first
      performance.init();

      // Initialize UI modules
      navbar.init();
      smoothScroll.init();
      projectCards.init();

      // Initialize page-specific functionality
      pageSpecific.init();

      // Initialize remaining modules
      contactForm.init();
      counters.init();
      accessibility.init();
      utils.addFadeInAnimation();
    },
  };

  // Auto-initialize when script loads
  app.init();
})();
