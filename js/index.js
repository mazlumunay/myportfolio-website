// Portfolio Website JavaScript
// Author: Mazlum Unay
// Description: External JavaScript file for portfolio website functionality

(function () {
  "use strict";

  // Utility Functions
  const utils = {
    // Smooth scroll to element
    smoothScrollTo: function (target) {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },

    // Animate counter numbers
    animateCounter: function (element) {
      const target = parseInt(element.getAttribute("data-count"));
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

    // Check if element is in viewport
    isInViewport: function (element) {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom >= 0;
    },

    // Add fade-in animation to elements
    addFadeInAnimation: function () {
      setTimeout(() => {
        document.querySelectorAll(".fade-in-up").forEach((el, index) => {
          setTimeout(() => {
            el.classList.add("animate");
          }, index * 200);
        });
      }, 300);
    },
  };

  // EmailJS Configuration (for contact form)
  const emailJS = {
    publicKey: "IGYf_20wd6PVSqMbe",
    serviceID: "service_vniltzj",
    templateID: "template_2tlsc4l",

    init: function () {
      if (typeof emailjs !== "undefined") {
        emailjs.init({
          publicKey: this.publicKey,
        });
      }
    },

    sendEmail: function (templateParams) {
      return emailjs.send(this.serviceID, this.templateID, templateParams);
    },
  };

  // Navbar Functionality
  const navbar = {
    init: function () {
      window.addEventListener("scroll", this.handleScroll.bind(this));
    },

    handleScroll: function () {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    },
  };

  // Contact Form Functionality
  const contactForm = {
    form: null,

    init: function () {
      this.form = document.getElementById("contactForm");
      if (this.form) {
        this.form.addEventListener("submit", this.handleSubmit.bind(this));
      }
    },

    handleSubmit: function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (this.form.checkValidity()) {
        this.sendEmail();
      }

      this.form.classList.add("was-validated");
    },

    sendEmail: function () {
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
      submitBtn.disabled = true;

      // Collect form data
      const formData = new FormData(this.form);
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
        .then((response) => {
          this.showSuccess(submitBtn, originalText);
        })
        .catch((error) => {
          this.showError(submitBtn, originalText);
          console.error("EmailJS Error:", error);
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
      this.form.reset();
      this.form.classList.remove("was-validated");

      // Reset button after delay
      this.resetButton(submitBtn, originalText, "btn-info");
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

    showAlert: function (type, message) {
      const alertDiv = document.createElement("div");
      alertDiv.className = `alert alert-${type} mt-3`;
      alertDiv.innerHTML = `
                <i class="bi bi-${
                  type === "success" ? "check-circle-fill" : "x-circle-fill"
                } me-2"></i>
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

    resetButton: function (submitBtn, originalText, btnClass) {
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-success", "btn-danger");
        submitBtn.classList.add(btnClass);
      }, 5000);
    },
  };

  // Counter Animation
  const counters = {
    started: false,

    init: function () {
      window.addEventListener("scroll", this.checkCounters.bind(this));
      // Initial check
      this.checkCounters();
    },

    checkCounters: function () {
      if (this.started) return;

      const counters = document.querySelectorAll("[data-count]");
      if (counters.length === 0) return;

      // Check if any counter is visible
      for (let counter of counters) {
        if (utils.isInViewport(counter)) {
          this.startAllCounters();
          this.started = true;
          break;
        }
      }
    },

    startAllCounters: function () {
      const counters = document.querySelectorAll("[data-count]");
      counters.forEach((counter) => {
        utils.animateCounter(counter);
      });
    },
  };

  // Project Card Hover Effects
  const projectCards = {
    init: function () {
      const cards = document.querySelectorAll(".project-card");
      cards.forEach((card) => {
        card.addEventListener("mouseenter", this.handleMouseEnter);
        card.addEventListener("mouseleave", this.handleMouseLeave);
      });
    },

    handleMouseEnter: function () {
      this.style.transform = "translateY(-4px)";
      this.style.transition = "transform 0.3s ease";
    },

    handleMouseLeave: function () {
      this.style.transform = "";
    },
  };

  // Smooth Scroll for Anchor Links
  const smoothScroll = {
    init: function () {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", this.handleClick.bind(this));
      });
    },

    handleClick: function (e) {
      e.preventDefault();
      const target = e.target.getAttribute("href");
      if (target && target !== "#") {
        utils.smoothScrollTo(target);
      }
    },
  };

  // Hero Animations
  const heroAnimations = {
    init: function () {
      // Add fade-in animations for hero elements
      utils.addFadeInAnimation();
    },
  };

  // Page-specific initializations
  const pageSpecific = {
    init: function () {
      const currentPage = this.getCurrentPage();

      switch (currentPage) {
        case "contact":
          emailJS.init();
          break;
        case "projects":
        case "publications":
          // These pages have fade-in animations
          utils.addFadeInAnimation();
          break;
      }
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

  // Main Application
  const app = {
    init: function () {
      // Wait for DOM to be fully loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", this.start.bind(this));
      } else {
        this.start();
      }
    },

    start: function () {
      // Initialize all modules
      navbar.init();
      contactForm.init();
      counters.init();
      projectCards.init();
      smoothScroll.init();
      heroAnimations.init();
      pageSpecific.init();

      // Log that the app has started (for debugging)
      console.log("Portfolio app initialized successfully");
    },
  };

  // Auto-initialize when script loads
  app.init();

  // Export for global access if needed
  window.PortfolioApp = {
    utils: utils,
    navbar: navbar,
    contactForm: contactForm,
    counters: counters,
    projectCards: projectCards,
    smoothScroll: smoothScroll,
  };
})();
