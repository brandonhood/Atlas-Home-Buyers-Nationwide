// =================================================================
// ATLAS HOME BUYERS - HYBRID LANDING PAGE JAVASCRIPT
// Dynamic city insertion, form handling, testimonial toggles
// =================================================================

// Dynamic City Insertion
(function() {
    // Get city from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    
    if (city) {
        // Decode and capitalize city name
        const cityName = decodeURIComponent(city)
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        // Update city-specific elements
        const cityElements = document.querySelectorAll('#city-name');
        cityElements.forEach(el => {
            el.textContent = `${cityName} Homeowners`;
        });
        
        const cityHeadline = document.querySelectorAll('#city-headline, .city-inline');
        cityHeadline.forEach(el => {
            el.textContent = ` in ${cityName}`;
        });
        
        // Update page title
        document.title = `Sell Your House Fast in ${cityName} | Fair Cash Offer in 24 Hours | Atlas Home Buyers`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `Get a fair cash offer for your ${cityName} house in 24 hours. No repairs, no fees, no waiting. We buy houses in any condition. Close in 7-14 days.`;
        }
    } else {
        // No city specified - use nationwide messaging
        const cityHeadline = document.querySelectorAll('#city-headline, .city-inline');
        cityHeadline.forEach(el => {
            el.textContent = '';
        });
    }
})();

// Form Handling
(function() {
    const form = document.getElementById('leadForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Don't prevent default - let form submit naturally
            // But track the submission
            
            // Get form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Track submission in console (for debugging)
            console.log('Form submitted:', data);
            
            // Google Analytics event (if GA is configured)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Form',
                    'event_label': 'Hero Form Submission',
                    'value': 1
                });
            }
            
            // Facebook Pixel event (if configured)
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Cash Offer Form',
                    content_category': 'Lead Generation'
                });
            }
            
            // Show success message (you can customize this)
            // Note: This will only show if form submission fails or for testing
            // In production, form will submit to webhook and redirect
        });
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                
                if (value.length >= 6) {
                    e.target.value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
                } else if (value.length >= 3) {
                    e.target.value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                } else if (value.length > 0) {
                    e.target.value = `(${value}`;
                }
            });
        }
    }
})();

// Testimonial "Read More" Functionality
(function() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.testimonial-card');
            const fullText = card.querySelector('.testimonial-full');
            
            if (fullText.style.display === 'none' || !fullText.style.display) {
                fullText.style.display = 'block';
                this.textContent = 'Read less';
            } else {
                fullText.style.display = 'none';
                this.textContent = 'Read more';
            }
        });
    });
})();

// Smooth Scroll for Anchor Links
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Account for sticky header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
})();

// Mobile Sticky CTA - Show/Hide Based on Scroll
(function() {
    const stickyCTA = document.querySelector('.mobile-sticky-cta');
    const heroSection = document.querySelector('.hero');
    
    if (stickyCTA && heroSection) {
        let isVisible = false;
        
        window.addEventListener('scroll', function() {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            
            if (heroBottom < 0 && !isVisible) {
                // User has scrolled past hero
                stickyCTA.style.display = 'block';
                isVisible = true;
            } else if (heroBottom >= 0 && isVisible) {
                // User is back in hero section
                stickyCTA.style.display = 'none';
                isVisible = false;
            }
        });
    }
})();

// Form Validation Enhancement
(function() {
    const form = document.getElementById('leadForm');
    
    if (form) {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            // Real-time validation feedback
            input.addEventListener('blur', function() {
                if (!this.validity.valid) {
                    this.style.borderColor = 'var(--error-color)';
                } else {
                    this.style.borderColor = 'var(--success-color)';
                }
            });
            
            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.style.borderColor = 'var(--success-color)';
                }
            });
        });
    }
})();

// FAQ Accordion (Optional Enhancement)
// Uncomment if you want FAQ items to be collapsible
/*
(function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Initially hide all answers
        answer.style.display = 'none';
        
        // Add click handler
        question.style.cursor = 'pointer';
        question.addEventListener('click', function() {
            const isOpen = answer.style.display === 'block';
            
            // Close all other items
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.display = 'none';
            });
            
            // Toggle current item
            if (!isOpen) {
                answer.style.display = 'block';
            }
        });
    });
})();
*/

// Track Outbound Links (Phone Clicks, etc.)
(function() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'Phone Click',
                    'event_label': this.getAttribute('href'),
                    'value': 1
                });
            }
        });
    });
})();

// Performance: Lazy Load Images (if you add images later)
(function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
})();

// Add city parameter to all internal form links
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    
    if (city) {
        // Add city to all CTA links that point to #hero
        document.querySelectorAll('a[href="#hero"]').forEach(link => {
            link.addEventListener('click', function(e) {
                // Scroll is already handled, just ensure city is visible
                const cityElements = document.querySelectorAll('#city-name');
                cityElements.forEach(el => {
                    if (!el.textContent.includes(city)) {
                        const cityName = decodeURIComponent(city)
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        el.textContent = `${cityName} Homeowners`;
                    }
                });
            });
        });
    }
})();

console.log('Atlas Home Buyers - Landing Page Loaded');
console.log('City parameter:', new URLSearchParams(window.location.search).get('city') || 'None (Nationwide)');
