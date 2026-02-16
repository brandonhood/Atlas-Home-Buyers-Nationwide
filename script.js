/**
 * Atlas Home Buyers — PPC Landing Page JavaScript
 *
 * Features:
 * - Google Places API autocomplete for address field
 * - Real-time form validation
 * - Phone number auto-formatting (US format)
 * - Form submission handling (FormSpree / webhook)
 * - Google Analytics 4 event tracking
 * - Facebook Pixel event tracking
 * - UTM parameter capture
 * - Exit-intent popup
 * - Countdown timer
 * - Smooth scroll
 * - Scroll-triggered animations
 * - Sticky header on scroll
 * - Mobile sticky CTA
 * - FAQ accordion
 */

(function () {
    'use strict';

    /* ============================================
       CONFIGURATION
       TODO: Update these values before deployment
       ============================================ */
    const CONFIG = {
        // Form submission endpoint
        // TODO: Replace with your FormSpree endpoint or custom webhook URL
        formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',

        // Google Analytics 4 Measurement ID
        // TODO: Replace with your GA4 measurement ID
        ga4MeasurementId: 'G-XXXXXXXXXX',

        // Phone number for click-to-call
        phoneNumber: '+18005550199',

        // Countdown timer duration in minutes
        countdownMinutes: 10,

        // Exit popup delay (ms) — minimum time on page before showing
        exitPopupDelay: 5000,

        // Thank you page URL
        thankYouPage: '/thank-you.html',

        // Target cities for dynamic headline insertion
        targetCities: [
            'Atlanta', 'Charlotte', 'Jacksonville', 'Memphis',
            'Indianapolis', 'Columbus', 'San Antonio', 'Phoenix',
            'Las Vegas', 'Tampa'
        ]
    };


    /* ============================================
       DOM ELEMENTS
       ============================================ */
    const dom = {
        leadForm: document.getElementById('leadForm'),
        propertyAddress: document.getElementById('propertyAddress'),
        fullName: document.getElementById('fullName'),
        phoneNumber: document.getElementById('phoneNumber'),
        emailAddress: document.getElementById('emailAddress'),
        privacyConsent: document.getElementById('privacyConsent'),
        smsOptIn: document.getElementById('smsOptIn'),
        submitBtn: document.getElementById('submitBtn'),
        stickyHeader: document.getElementById('stickyHeader'),
        mobileCta: document.getElementById('mobileCta'),
        exitPopup: document.getElementById('exitPopup'),
        exitOverlay: document.getElementById('exitOverlay'),
        exitClose: document.getElementById('exitClose'),
        exitCta: document.getElementById('exitCta'),
        countdownTimer: document.getElementById('countdownTimer'),
        urgencyBanner: document.getElementById('urgencyBanner'),
        cityName: document.getElementById('cityName'),
        faqList: document.querySelector('.faq__list')
    };


    /* ============================================
       UTILITY FUNCTIONS
       ============================================ */

    /**
     * Get URL parameter by name
     */
    function getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    /**
     * Safely push events to dataLayer (GTM / GA4)
     */
    function trackEvent(eventName, eventParams) {
        // console.log('Track event:', eventName, eventParams);
        try {
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push({
                    event: eventName,
                    ...eventParams
                });
            }
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, eventParams);
            }
        } catch (e) {
            // console.error('Analytics tracking error:', e);
        }
    }

    /**
     * Safely fire Facebook Pixel event
     */
    function trackFbEvent(eventName, params) {
        // console.log('FB Pixel event:', eventName, params);
        try {
            if (typeof window.fbq === 'function') {
                if (params) {
                    window.fbq('track', eventName, params);
                } else {
                    window.fbq('track', eventName);
                }
            }
        } catch (e) {
            // console.error('Facebook Pixel error:', e);
        }
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(this, args);
            }, wait);
        };
    }


    /* ============================================
       UTM PARAMETER CAPTURE
       Captures UTM parameters and ad click IDs
       from the URL and stores them in hidden fields
       ============================================ */
    function captureUtmParams() {
        var utmFields = {
            utm_source: 'utmSource',
            utm_medium: 'utmMedium',
            utm_campaign: 'utmCampaign',
            utm_term: 'utmTerm',
            utm_content: 'utmContent',
            gclid: 'gclid',
            fbclid: 'fbclid'
        };

        Object.keys(utmFields).forEach(function (param) {
            var value = getUrlParam(param);
            var el = document.getElementById(utmFields[param]);
            if (el && value) {
                el.value = value;
            }
        });

        // Also store landing page URL
        var landingPageEl = document.getElementById('landingPage');
        if (landingPageEl) {
            landingPageEl.value = window.location.href;
        }

        // Persist UTMs in sessionStorage for cross-page tracking
        try {
            var utms = {};
            Object.keys(utmFields).forEach(function (param) {
                var value = getUrlParam(param);
                if (value) {
                    utms[param] = value;
                }
            });
            if (Object.keys(utms).length > 0) {
                sessionStorage.setItem('atlas_utms', JSON.stringify(utms));
            }
        } catch (e) {
            // sessionStorage not available
        }
    }


    /* ============================================
       DYNAMIC CITY NAME INSERTION
       Updates H1 based on UTM parameters or geo
       ============================================ */
    function initCityName() {
        // Check for city in UTM term or campaign
        var utmTerm = getUrlParam('utm_term') || '';
        var utmCampaign = getUrlParam('utm_campaign') || '';
        var city = getUrlParam('city') || '';

        // Try to match a city from the URL params
        if (city) {
            updateCityName(city);
            return;
        }

        var searchStr = (utmTerm + ' ' + utmCampaign).toLowerCase();
        for (var i = 0; i < CONFIG.targetCities.length; i++) {
            if (searchStr.indexOf(CONFIG.targetCities[i].toLowerCase()) !== -1) {
                updateCityName(CONFIG.targetCities[i]);
                return;
            }
        }

        // Default: keep "House" in headline
    }

    function updateCityName(city) {
        if (dom.cityName) {
            dom.cityName.textContent = city;
        }
    }


    /* ============================================
       PHONE NUMBER AUTO-FORMATTING
       Formats phone input as (XXX) XXX-XXXX
       ============================================ */
    function formatPhoneNumber(value) {
        // Strip all non-digit characters
        var digits = value.replace(/\D/g, '');

        // Limit to 10 digits (US)
        digits = digits.substring(0, 10);

        if (digits.length === 0) {
            return '';
        } else if (digits.length <= 3) {
            return '(' + digits;
        } else if (digits.length <= 6) {
            return '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
        } else {
            return '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6);
        }
    }

    function initPhoneFormatting() {
        if (!dom.phoneNumber) return;

        dom.phoneNumber.addEventListener('input', function (e) {
            var cursorPos = e.target.selectionStart;
            var prevLength = e.target.value.length;
            var formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;

            // Try to maintain cursor position
            var newLength = formatted.length;
            var diff = newLength - prevLength;
            var newPos = cursorPos + diff;
            if (newPos < 0) newPos = 0;
            if (newPos > newLength) newPos = newLength;
            e.target.setSelectionRange(newPos, newPos);
        });

        // Prevent non-numeric characters on keypress
        dom.phoneNumber.addEventListener('keypress', function (e) {
            var char = String.fromCharCode(e.which || e.keyCode);
            if (!/[\d\b]/.test(char) && e.which !== 8 && e.which !== 0) {
                e.preventDefault();
            }
        });
    }


    /* ============================================
       FORM VALIDATION
       Real-time validation with helpful error messages
       ============================================ */
    var validators = {
        propertyAddress: function (value) {
            if (!value.trim()) {
                return 'Please enter your property address.';
            }
            if (value.trim().length < 5) {
                return 'Please enter a complete street address.';
            }
            return '';
        },

        fullName: function (value) {
            if (!value.trim()) {
                return 'Please enter your name.';
            }
            if (value.trim().length < 2) {
                return 'Please enter your full name.';
            }
            return '';
        },

        phoneNumber: function (value) {
            var digits = value.replace(/\D/g, '');
            if (!digits) {
                return 'Please enter your phone number.';
            }
            if (digits.length < 10) {
                return 'Please enter a valid 10-digit phone number.';
            }
            return '';
        },

        emailAddress: function (value) {
            if (!value.trim()) {
                return 'Please enter your email address.';
            }
            // Basic email regex
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) {
                return 'Please enter a valid email address.';
            }
            return '';
        },

        privacyConsent: function (checked) {
            if (!checked) {
                return 'Please agree to the Privacy Policy to continue.';
            }
            return '';
        }
    };

    /**
     * Validate a single field and update UI
     */
    function validateField(field, validatorName) {
        var value = field.type === 'checkbox' ? field.checked : field.value;
        var error = validators[validatorName](value);
        var errorEl = field.getAttribute('aria-describedby')
            ? document.getElementById(field.getAttribute('aria-describedby'))
            : null;

        if (error) {
            field.classList.add('error');
            field.classList.remove('valid');
            field.setAttribute('aria-invalid', 'true');
            if (errorEl) {
                errorEl.textContent = error;
            }
            return false;
        } else {
            field.classList.remove('error');
            if (field.type !== 'checkbox') {
                field.classList.add('valid');
            }
            field.setAttribute('aria-invalid', 'false');
            if (errorEl) {
                errorEl.textContent = '';
            }
            return true;
        }
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        var isValid = true;
        var firstInvalid = null;

        var fields = [
            { el: dom.propertyAddress, validator: 'propertyAddress' },
            { el: dom.fullName, validator: 'fullName' },
            { el: dom.phoneNumber, validator: 'phoneNumber' },
            { el: dom.emailAddress, validator: 'emailAddress' },
            { el: dom.privacyConsent, validator: 'privacyConsent' }
        ];

        fields.forEach(function (field) {
            if (field.el) {
                var valid = validateField(field.el, field.validator);
                if (!valid && !firstInvalid) {
                    firstInvalid = field.el;
                    isValid = false;
                } else if (!valid) {
                    isValid = false;
                }
            }
        });

        // Focus first invalid field
        if (firstInvalid) {
            firstInvalid.focus();
        }

        return isValid;
    }

    /**
     * Set up real-time validation listeners
     */
    function initValidation() {
        var fieldMap = [
            { el: dom.propertyAddress, validator: 'propertyAddress', event: 'blur' },
            { el: dom.fullName, validator: 'fullName', event: 'blur' },
            { el: dom.phoneNumber, validator: 'phoneNumber', event: 'blur' },
            { el: dom.emailAddress, validator: 'emailAddress', event: 'blur' },
            { el: dom.privacyConsent, validator: 'privacyConsent', event: 'change' }
        ];

        fieldMap.forEach(function (field) {
            if (field.el) {
                field.el.addEventListener(field.event, function () {
                    validateField(field.el, field.validator);
                });

                // Also validate on input after first blur (for better UX)
                if (field.event === 'blur') {
                    var hasBlurred = false;
                    field.el.addEventListener('blur', function () {
                        hasBlurred = true;
                    });
                    field.el.addEventListener('input', function () {
                        if (hasBlurred) {
                            validateField(field.el, field.validator);
                        }
                    });
                }
            }
        });
    }


    /* ============================================
       FORM SUBMISSION
       Handles form submit via fetch API
       ============================================ */
    function initFormSubmission() {
        if (!dom.leadForm) return;

        dom.leadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate
            if (!validateForm()) {
                trackEvent('form_validation_error', {
                    event_category: 'form',
                    event_label: 'validation_failed'
                });
                return;
            }

            // Prevent double submission
            if (dom.leadForm.classList.contains('submitting')) return;
            dom.leadForm.classList.add('submitting');

            if (dom.submitBtn) {
                dom.submitBtn.disabled = true;
                dom.submitBtn.textContent = 'Submitting...';
            }

            // Collect form data
            var formData = new FormData(dom.leadForm);

            // Track form start event
            trackEvent('form_submit_attempt', {
                event_category: 'form',
                event_label: 'lead_form'
            });

            // Submit to endpoint
            fetch(CONFIG.formEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Form submission failed');
            })
            .then(function () {
                // Track successful lead
                trackEvent('generate_lead', {
                    event_category: 'form',
                    event_label: 'lead_submitted',
                    value: 1
                });

                // Facebook Pixel Lead event
                trackFbEvent('Lead', {
                    content_name: 'Cash Offer Request',
                    content_category: 'Lead Form'
                });

                // Google Ads conversion tracking
                if (typeof window.gtag === 'function') {
                    // TODO: Replace with your actual Google Ads conversion ID and label
                    window.gtag('event', 'conversion', {
                        'send_to': 'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXX'
                    });
                }

                // Redirect to thank you page
                window.location.href = CONFIG.thankYouPage;
            })
            .catch(function (error) {
                // console.error('Form submission error:', error);

                trackEvent('form_submit_error', {
                    event_category: 'form',
                    event_label: error.message || 'unknown_error'
                });

                // Reset form state
                dom.leadForm.classList.remove('submitting');
                if (dom.submitBtn) {
                    dom.submitBtn.disabled = false;
                    dom.submitBtn.textContent = 'Get My Cash Offer Now';
                }

                // Show user-friendly error
                alert('There was a problem submitting your information. Please try again or call us at (800) 555-0199.');
            });
        });
    }


    /* ============================================
       GOOGLE PLACES AUTOCOMPLETE
       ============================================ */
    // This function is called by the Google Maps API callback
    window.initAutocomplete = function () {
        if (!dom.propertyAddress) return;

        try {
            var autocomplete = new google.maps.places.Autocomplete(dom.propertyAddress, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });

            autocomplete.addListener('place_changed', function () {
                var place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    dom.propertyAddress.value = place.formatted_address;
                    validateField(dom.propertyAddress, 'propertyAddress');

                    trackEvent('address_autocomplete_selected', {
                        event_category: 'form',
                        event_label: 'address_selected'
                    });
                }
            });
        } catch (e) {
            // console.error('Google Places Autocomplete error:', e);
            // Form still works without autocomplete
        }
    };


    /* ============================================
       COUNTDOWN TIMER
       Shows urgency countdown in form header
       ============================================ */
    function initCountdownTimer() {
        if (!dom.countdownTimer) return;

        var totalSeconds = CONFIG.countdownMinutes * 60;

        // Check sessionStorage for existing timer
        try {
            var storedEnd = sessionStorage.getItem('atlas_countdown_end');
            if (storedEnd) {
                var remaining = Math.floor((parseInt(storedEnd, 10) - Date.now()) / 1000);
                if (remaining > 0) {
                    totalSeconds = remaining;
                } else {
                    // Timer expired, restart
                    sessionStorage.removeItem('atlas_countdown_end');
                }
            } else {
                // Store end time
                sessionStorage.setItem('atlas_countdown_end', String(Date.now() + totalSeconds * 1000));
            }
        } catch (e) {
            // sessionStorage not available
        }

        function updateTimer() {
            if (totalSeconds <= 0) {
                if (dom.urgencyBanner) {
                    dom.urgencyBanner.style.display = 'none';
                }
                return;
            }

            var minutes = Math.floor(totalSeconds / 60);
            var seconds = totalSeconds % 60;
            dom.countdownTimer.textContent =
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

            totalSeconds--;
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    }


    /* ============================================
       STICKY HEADER
       Shows/hides on scroll
       ============================================ */
    function initStickyHeader() {
        if (!dom.stickyHeader) return;

        var lastScroll = 0;
        var heroHeight = document.querySelector('.hero')
            ? document.querySelector('.hero').offsetHeight
            : 400;

        window.addEventListener('scroll', debounce(function () {
            var currentScroll = window.pageYOffset;

            if (currentScroll > heroHeight) {
                dom.stickyHeader.classList.add('visible');
            } else {
                dom.stickyHeader.classList.remove('visible');
            }

            lastScroll = currentScroll;
        }, 10), { passive: true });
    }


    /* ============================================
       MOBILE STICKY CTA
       Shows bottom CTA bar on mobile when scrolled
       ============================================ */
    function initMobileCta() {
        if (!dom.mobileCta) return;

        // Only on mobile
        if (window.innerWidth >= 768) return;

        var heroHeight = document.querySelector('.hero')
            ? document.querySelector('.hero').offsetHeight
            : 400;

        window.addEventListener('scroll', debounce(function () {
            if (window.pageYOffset > heroHeight) {
                dom.mobileCta.classList.add('visible');
            } else {
                dom.mobileCta.classList.remove('visible');
            }
        }, 10), { passive: true });
    }


    /* ============================================
       EXIT-INTENT POPUP
       Triggers when mouse leaves viewport (desktop)
       or on back-button behavior (mobile)
       ============================================ */
    function initExitPopup() {
        if (!dom.exitPopup) return;

        var hasShown = false;
        var pageLoadTime = Date.now();

        // Desktop: mouse leave detection
        document.addEventListener('mouseout', function (e) {
            if (hasShown) return;
            if (Date.now() - pageLoadTime < CONFIG.exitPopupDelay) return;

            // Check if mouse is leaving the viewport from the top
            if (e.clientY <= 0 && e.relatedTarget === null) {
                showExitPopup();
            }
        });

        // Close popup handlers
        if (dom.exitClose) {
            dom.exitClose.addEventListener('click', hideExitPopup);
        }
        if (dom.exitOverlay) {
            dom.exitOverlay.addEventListener('click', hideExitPopup);
        }
        if (dom.exitCta) {
            dom.exitCta.addEventListener('click', function () {
                hideExitPopup();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !dom.exitPopup.hidden) {
                hideExitPopup();
            }
        });

        function showExitPopup() {
            if (hasShown) return;
            hasShown = true;
            dom.exitPopup.hidden = false;
            document.body.style.overflow = 'hidden';

            trackEvent('exit_popup_shown', {
                event_category: 'engagement',
                event_label: 'exit_intent'
            });

            // Store that we've shown it this session
            try {
                sessionStorage.setItem('atlas_exit_popup_shown', 'true');
            } catch (e) {
                // sessionStorage not available
            }
        }

        function hideExitPopup() {
            dom.exitPopup.hidden = true;
            document.body.style.overflow = '';

            trackEvent('exit_popup_closed', {
                event_category: 'engagement',
                event_label: 'exit_intent'
            });
        }

        // Don't show if already shown this session
        try {
            if (sessionStorage.getItem('atlas_exit_popup_shown') === 'true') {
                hasShown = true;
            }
        } catch (e) {
            // sessionStorage not available
        }
    }


    /* ============================================
       FAQ ACCORDION
       ============================================ */
    function initFaqAccordion() {
        if (!dom.faqList) return;

        var buttons = dom.faqList.querySelectorAll('.faq__question');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var expanded = this.getAttribute('aria-expanded') === 'true';
                var answerId = this.getAttribute('aria-controls');
                var answer = document.getElementById(answerId);

                // Close all others
                buttons.forEach(function (otherBtn) {
                    if (otherBtn !== button) {
                        otherBtn.setAttribute('aria-expanded', 'false');
                        var otherId = otherBtn.getAttribute('aria-controls');
                        var otherAnswer = document.getElementById(otherId);
                        if (otherAnswer) {
                            otherAnswer.hidden = true;
                        }
                    }
                });

                // Toggle current
                this.setAttribute('aria-expanded', String(!expanded));
                if (answer) {
                    answer.hidden = expanded;
                }

                trackEvent('faq_toggle', {
                    event_category: 'engagement',
                    event_label: answerId,
                    event_action: expanded ? 'close' : 'open'
                });
            });
        });
    }


    /* ============================================
       SMOOTH SCROLL
       Handles smooth scrolling for anchor links
       ============================================ */
    function initSmoothScroll() {
        var scrollLinks = document.querySelectorAll('.scroll-to-form, a[href^="#"]');

        scrollLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (!href || href === '#') return;

                var target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                var headerOffset = 80;
                var elementPosition = target.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Focus the form for accessibility
                if (href === '#hero') {
                    setTimeout(function () {
                        if (dom.propertyAddress) {
                            dom.propertyAddress.focus();
                        }
                    }, 500);
                }

                trackEvent('cta_click', {
                    event_category: 'engagement',
                    event_label: href
                });
            });
        });
    }


    /* ============================================
       SCROLL ANIMATIONS (Fade-in on scroll)
       Uses IntersectionObserver for performance
       ============================================ */
    function initScrollAnimations() {
        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.fade-in').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements
            document.querySelectorAll('.fade-in').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.fade-in').forEach(function (el) {
            observer.observe(el);
        });
    }


    /* ============================================
       SCROLL DEPTH TRACKING
       Tracks how far users scroll (25%, 50%, 75%, 100%)
       ============================================ */
    function initScrollTracking() {
        var milestones = [25, 50, 75, 100];
        var reached = {};

        window.addEventListener('scroll', debounce(function () {
            var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight <= 0) return;

            var scrollPercent = Math.round((window.pageYOffset / scrollHeight) * 100);

            milestones.forEach(function (milestone) {
                if (scrollPercent >= milestone && !reached[milestone]) {
                    reached[milestone] = true;
                    trackEvent('scroll_depth', {
                        event_category: 'engagement',
                        event_label: milestone + '%',
                        value: milestone
                    });
                }
            });
        }, 200), { passive: true });
    }


    /* ============================================
       FORM INTERACTION TRACKING
       Tracks which fields users interact with
       ============================================ */
    function initFormTracking() {
        var trackedFields = {};

        var fields = [
            dom.propertyAddress,
            dom.fullName,
            dom.phoneNumber,
            dom.emailAddress
        ];

        fields.forEach(function (field) {
            if (!field) return;

            field.addEventListener('focus', function () {
                var fieldName = this.name || this.id;
                if (!trackedFields[fieldName]) {
                    trackedFields[fieldName] = true;
                    trackEvent('form_field_focus', {
                        event_category: 'form',
                        event_label: fieldName
                    });
                }
            });
        });

        // Track form start (first interaction)
        if (dom.leadForm) {
            var formStarted = false;
            dom.leadForm.addEventListener('focusin', function () {
                if (!formStarted) {
                    formStarted = true;
                    trackEvent('form_start', {
                        event_category: 'form',
                        event_label: 'lead_form'
                    });

                    trackFbEvent('InitiateCheckout', {
                        content_name: 'Lead Form Start'
                    });
                }
            });
        }
    }


    /* ============================================
       TIME ON PAGE TRACKING
       ============================================ */
    function initTimeTracking() {
        var intervals = [30, 60, 120, 300]; // seconds
        var tracked = {};

        setInterval(function () {
            var elapsed = Math.floor((Date.now() - window.performance.timing.navigationStart) / 1000);

            intervals.forEach(function (interval) {
                if (elapsed >= interval && !tracked[interval]) {
                    tracked[interval] = true;
                    trackEvent('time_on_page', {
                        event_category: 'engagement',
                        event_label: interval + 's',
                        value: interval
                    });
                }
            });
        }, 5000);
    }


    /* ============================================
       MULTI-STEP FORM ALTERNATIVE
       Uncomment to use a progressive disclosure form

    function initMultiStepForm() {
        var steps = [
            { fields: ['propertyAddress'], label: 'Step 1 of 3: Property Address' },
            { fields: ['fullName', 'phoneNumber'], label: 'Step 2 of 3: Your Info' },
            { fields: ['emailAddress'], label: 'Step 3 of 3: Email' }
        ];

        var currentStep = 0;

        // Hide all fields except first step
        steps.forEach(function(step, index) {
            if (index > 0) {
                step.fields.forEach(function(fieldId) {
                    var group = document.getElementById(fieldId).closest('.form-group');
                    if (group) group.style.display = 'none';
                });
            }
        });

        // Add next/prev buttons
        // ... implementation continues
    }
       ============================================ */


    /* ============================================
       INITIALIZATION
       ============================================ */
    function init() {
        captureUtmParams();
        initCityName();
        initPhoneFormatting();
        initValidation();
        initFormSubmission();
        initCountdownTimer();
        initStickyHeader();
        initMobileCta();
        initExitPopup();
        initFaqAccordion();
        initSmoothScroll();
        initScrollAnimations();
        initScrollTracking();
        initFormTracking();
        initTimeTracking();

        // Track page view
        trackEvent('landing_page_view', {
            event_category: 'pageview',
            event_label: window.location.pathname
        });

        // console.log('Atlas Home Buyers landing page initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
