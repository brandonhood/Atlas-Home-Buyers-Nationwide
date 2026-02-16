/**
 * Atlas Home Buyers — Hybrid Landing Page JavaScript
 *
 * Features:
 * - Dynamic city insertion from URL parameter
 * - Two-step form with progressive disclosure
 * - Real-time form validation
 * - Phone number auto-formatting (US format)
 * - Form submission handling (webhook)
 * - Google Analytics 4 event tracking
 * - Facebook Pixel event tracking
 * - UTM parameter capture
 * - Exit-intent popup
 * - Smooth scroll
 * - Scroll-triggered animations
 * - Sticky header on scroll
 * - Mobile sticky CTA
 * - FAQ accordion
 * - Testimonial "Read more" toggle
 */

(function () {
    'use strict';

    /* ============================================
       CONFIGURATION
       ============================================ */
    var CONFIG = {
        // Form submission endpoint
        // Replace with actual GoHighLevel webhook URL
        formEndpoint: '[GOHIGHLEVEL_WEBHOOK_URL_TBD]',

        // Exit popup delay (ms)
        exitPopupDelay: 5000,

        // Thank you page URL
        thankYouPage: '/thank-you.html'
    };


    /* ============================================
       DOM ELEMENTS
       ============================================ */
    var dom = {
        leadForm: document.getElementById('leadForm'),
        propertyAddress: document.getElementById('propertyAddress'),
        fullName: document.getElementById('fullName'),
        phoneNumber: document.getElementById('phoneNumber'),
        emailAddress: document.getElementById('emailAddress'),
        transactionalConsent: document.getElementById('transactionalConsent'),
        privacyConsent: document.getElementById('privacyConsent'),
        stepOneBtn: document.getElementById('stepOneBtn'),
        submitBtn: document.getElementById('submitBtn'),
        formStep1: document.getElementById('formStep1'),
        formStep2: document.getElementById('formStep2'),
        formSuccess: document.getElementById('formSuccess'),
        stickyHeader: document.getElementById('stickyHeader'),
        mobileCta: document.getElementById('mobileCta'),
        exitPopup: document.getElementById('exitPopup'),
        exitOverlay: document.getElementById('exitOverlay'),
        exitClose: document.getElementById('exitClose'),
        exitCta: document.getElementById('exitCta'),
        cityInsert: document.getElementById('cityInsert'),
        hiddenCity: document.getElementById('hiddenCity'),
        faqList: document.querySelector('.faq__list')
    };


    /* ============================================
       UTILITY FUNCTIONS
       ============================================ */

    function getUrlParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function trackEvent(eventName, eventParams) {
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
            // Analytics tracking error
        }
    }

    function trackFbEvent(eventName, params) {
        try {
            if (typeof window.fbq === 'function') {
                if (params) {
                    window.fbq('track', eventName, params);
                } else {
                    window.fbq('track', eventName);
                }
            }
        } catch (e) {
            // Facebook Pixel error
        }
    }

    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }


    /* ============================================
       UTM PARAMETER CAPTURE
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

        var landingPageEl = document.getElementById('landingPage');
        if (landingPageEl) {
            landingPageEl.value = window.location.href;
        }

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
       Detects ?city= parameter and updates page
       ============================================ */
    function initCityName() {
        var city = getUrlParam('city');

        if (!city) {
            // No city parameter — remove the span or leave blank
            if (dom.cityInsert) {
                dom.cityInsert.textContent = '';
            }
            // Update page title without city
            document.title = 'Sell Your House Fast | Fair Cash Offer in 24 Hours | Atlas Home Buyers';
            return;
        }

        // Capitalize properly
        city = city.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

        // Insert city into headline
        if (dom.cityInsert) {
            dom.cityInsert.textContent = ' in ' + city;
        }

        // Update page title with city
        document.title = 'Sell Your House Fast ' + city + ' | Fair Cash Offer in 24 Hours | Atlas Home Buyers';

        // Update meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content',
                'Get a fair cash offer for your ' + city + ' house in 24 hours. No repairs, no fees, no waiting. We buy houses in any condition. Close in 7-14 days.');
        }

        // Store city in hidden field
        if (dom.hiddenCity) {
            dom.hiddenCity.value = city;
        }
    }


    /* ============================================
       PHONE NUMBER AUTO-FORMATTING
       ============================================ */
    function formatPhoneNumber(value) {
        var digits = value.replace(/\D/g, '');
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

            var newLength = formatted.length;
            var diff = newLength - prevLength;
            var newPos = cursorPos + diff;
            if (newPos < 0) newPos = 0;
            if (newPos > newLength) newPos = newLength;
            e.target.setSelectionRange(newPos, newPos);
        });

        dom.phoneNumber.addEventListener('keypress', function (e) {
            var char = String.fromCharCode(e.which || e.keyCode);
            if (!/[\d\b]/.test(char) && e.which !== 8 && e.which !== 0) {
                e.preventDefault();
            }
        });
    }


    /* ============================================
       FORM VALIDATION
       ============================================ */
    var validators = {
        propertyAddress: function (value) {
            if (!value.trim()) return 'Please enter your property address.';
            if (value.trim().length < 5) return 'Please enter a complete street address.';
            return '';
        },
        fullName: function (value) {
            if (!value.trim()) return 'Please enter your name.';
            if (value.trim().length < 2) return 'Please enter your full name.';
            return '';
        },
        phoneNumber: function (value) {
            var digits = value.replace(/\D/g, '');
            if (!digits) return 'Please enter your phone number.';
            if (digits.length < 10) return 'Please enter a valid 10-digit phone number.';
            return '';
        },
        emailAddress: function (value) {
            if (!value.trim()) return 'Please enter your email address.';
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
            return '';
        },
        transactionalConsent: function (checked) {
            if (!checked) return 'Please agree to receive transactional messages.';
            return '';
        },
        privacyConsent: function (checked) {
            if (!checked) return 'Please agree to the Privacy Policy to continue.';
            return '';
        }
    };

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
            if (errorEl) errorEl.textContent = error;
            return false;
        } else {
            field.classList.remove('error');
            if (field.type !== 'checkbox') field.classList.add('valid');
            field.setAttribute('aria-invalid', 'false');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    }

    function validateStep2() {
        var isValid = true;
        var firstInvalid = null;

        var fields = [
            { el: dom.fullName, validator: 'fullName' },
            { el: dom.phoneNumber, validator: 'phoneNumber' },
            { el: dom.emailAddress, validator: 'emailAddress' },
            { el: dom.transactionalConsent, validator: 'transactionalConsent' },
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

        if (firstInvalid) firstInvalid.focus();
        return isValid;
    }

    function initValidation() {
        var fieldMap = [
            { el: dom.propertyAddress, validator: 'propertyAddress', event: 'blur' },
            { el: dom.fullName, validator: 'fullName', event: 'blur' },
            { el: dom.phoneNumber, validator: 'phoneNumber', event: 'blur' },
            { el: dom.emailAddress, validator: 'emailAddress', event: 'blur' },
            { el: dom.transactionalConsent, validator: 'transactionalConsent', event: 'change' },
            { el: dom.privacyConsent, validator: 'privacyConsent', event: 'change' }
        ];

        fieldMap.forEach(function (field) {
            if (field.el) {
                field.el.addEventListener(field.event, function () {
                    validateField(field.el, field.validator);
                });

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
       TWO-STEP FORM
       Step 1: Address only
       Step 2: Contact details + consent
       ============================================ */
    function initTwoStepForm() {
        if (!dom.stepOneBtn || !dom.formStep1 || !dom.formStep2) return;

        dom.stepOneBtn.addEventListener('click', function () {
            // Validate address
            if (!validateField(dom.propertyAddress, 'propertyAddress')) {
                dom.propertyAddress.focus();
                return;
            }

            // Track step 1 completion
            trackEvent('form_step1_complete', {
                event_category: 'form',
                event_label: 'address_entered'
            });

            trackFbEvent('InitiateCheckout', {
                content_name: 'Lead Form Step 1'
            });

            // Show step 2
            dom.formStep1.style.display = 'none';
            dom.formStep2.style.display = 'block';
            dom.formStep2.setAttribute('aria-hidden', 'false');

            // Focus first field in step 2
            if (dom.fullName) {
                dom.fullName.focus();
            }
        });
    }


    /* ============================================
       FORM SUBMISSION
       ============================================ */
    function initFormSubmission() {
        if (!dom.leadForm) return;

        dom.leadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate step 2 fields
            if (!validateStep2()) {
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

            var formData = new FormData(dom.leadForm);

            trackEvent('form_submit_attempt', {
                event_category: 'form',
                event_label: 'lead_form'
            });

            // If endpoint is still placeholder, show success locally
            if (CONFIG.formEndpoint.indexOf('TBD') !== -1) {
                // Demo mode: show success
                showFormSuccess();
                return;
            }

            fetch(CONFIG.formEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function (response) {
                if (response.ok) return response.json();
                throw new Error('Form submission failed');
            })
            .then(function () {
                trackEvent('generate_lead', {
                    event_category: 'form',
                    event_label: 'lead_submitted',
                    value: 1
                });

                trackFbEvent('Lead', {
                    content_name: 'Cash Offer Request',
                    content_category: 'Lead Form'
                });

                // Google Ads conversion tracking placeholder
                if (typeof window.gtag === 'function') {
                    // Replace with actual Google Ads conversion ID
                    // window.gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXX' });
                }

                window.location.href = CONFIG.thankYouPage;
            })
            .catch(function (error) {
                trackEvent('form_submit_error', {
                    event_category: 'form',
                    event_label: error.message || 'unknown_error'
                });

                dom.leadForm.classList.remove('submitting');
                if (dom.submitBtn) {
                    dom.submitBtn.disabled = false;
                    dom.submitBtn.textContent = 'Get My Cash Offer Now';
                }

                alert('There was a problem submitting your information. Please try again or call us directly.');
            });
        });
    }

    function showFormSuccess() {
        trackEvent('generate_lead', {
            event_category: 'form',
            event_label: 'lead_submitted',
            value: 1
        });

        trackFbEvent('Lead', {
            content_name: 'Cash Offer Request',
            content_category: 'Lead Form'
        });

        // Hide step 2 and heading, show success
        if (dom.formStep2) dom.formStep2.style.display = 'none';
        var heading = document.querySelector('.lead-form__heading');
        if (heading) heading.style.display = 'none';

        if (dom.formSuccess) {
            dom.formSuccess.style.display = 'block';
            dom.formSuccess.setAttribute('aria-hidden', 'false');
        }
    }


    /* ============================================
       TESTIMONIAL "READ MORE" TOGGLE
       ============================================ */
    function initTestimonialReadMore() {
        var buttons = document.querySelectorAll('.testimonial__read-more');

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var textEl = this.previousElementSibling;
                if (!textEl) return;

                var isExpanded = this.getAttribute('aria-expanded') === 'true';
                var fullText = textEl.getAttribute('data-full-text');

                if (!fullText) return;

                if (isExpanded) {
                    // Collapse: truncate text
                    var truncated = fullText.substring(0, fullText.indexOf('.', 80) + 1) || fullText.substring(0, 120);
                    textEl.innerHTML = truncated + '&hellip;';
                    this.textContent = 'Read more';
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    // Expand: show full text
                    textEl.textContent = fullText;
                    this.textContent = 'Read less';
                    this.setAttribute('aria-expanded', 'true');
                }

                trackEvent('testimonial_read_more', {
                    event_category: 'engagement',
                    event_label: isExpanded ? 'collapse' : 'expand'
                });
            });
        });
    }


    /* ============================================
       STICKY HEADER
       ============================================ */
    function initStickyHeader() {
        if (!dom.stickyHeader) return;

        var heroHeight = document.querySelector('.hero')
            ? document.querySelector('.hero').offsetHeight
            : 400;

        window.addEventListener('scroll', debounce(function () {
            if (window.pageYOffset > heroHeight) {
                dom.stickyHeader.classList.add('visible');
            } else {
                dom.stickyHeader.classList.remove('visible');
            }
        }, 10), { passive: true });
    }


    /* ============================================
       MOBILE STICKY CTA
       ============================================ */
    function initMobileCta() {
        if (!dom.mobileCta) return;
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
       ============================================ */
    function initExitPopup() {
        if (!dom.exitPopup) return;

        var hasShown = false;
        var pageLoadTime = Date.now();

        // Check if already shown this session
        try {
            if (sessionStorage.getItem('atlas_exit_popup_shown') === 'true') {
                hasShown = true;
            }
        } catch (e) {
            // sessionStorage not available
        }

        document.addEventListener('mouseout', function (e) {
            if (hasShown) return;
            if (Date.now() - pageLoadTime < CONFIG.exitPopupDelay) return;
            if (e.clientY <= 0 && e.relatedTarget === null) {
                showExitPopup();
            }
        });

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
                        if (otherAnswer) otherAnswer.hidden = true;
                    }
                });

                // Toggle current
                this.setAttribute('aria-expanded', String(!expanded));
                if (answer) answer.hidden = expanded;

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
       SCROLL ANIMATIONS
       ============================================ */
    function initScrollAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.fade-in').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        if (!('IntersectionObserver' in window)) {
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

        if (dom.leadForm) {
            var formStarted = false;
            dom.leadForm.addEventListener('focusin', function () {
                if (!formStarted) {
                    formStarted = true;
                    trackEvent('form_start', {
                        event_category: 'form',
                        event_label: 'lead_form'
                    });
                }
            });
        }
    }


    /* ============================================
       INITIALIZATION
       ============================================ */
    function init() {
        captureUtmParams();
        initCityName();
        initPhoneFormatting();
        initValidation();
        initTwoStepForm();
        initFormSubmission();
        initTestimonialReadMore();
        initStickyHeader();
        initMobileCta();
        initExitPopup();
        initFaqAccordion();
        initSmoothScroll();
        initScrollAnimations();
        initScrollTracking();
        initFormTracking();

        trackEvent('landing_page_view', {
            event_category: 'pageview',
            event_label: window.location.pathname
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
