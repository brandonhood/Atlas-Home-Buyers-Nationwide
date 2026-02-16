# Atlas Home Buyers — PPC Landing Page

High-converting PPC landing page for a nationwide cash home buying business. Designed for Google Ads and Meta (Facebook/Instagram) paid traffic with a target of 25%+ form conversion rate.

## Project Overview

- **Business**: Cash home buying / real estate wholesaling
- **Target Audience**: Homeowners (45-75) facing foreclosure, probate, divorce, relocation, or homes needing repairs
- **Value Proposition**: Cash offers within 24 hours, close in 7 days, buy houses as-is
- **Markets**: Atlanta, Charlotte, Jacksonville, Memphis, Indianapolis, Columbus, San Antonio, Phoenix, Las Vegas, Tampa

## File Structure

```
/
├── README.md              # This file
├── .gitignore             # Git ignore rules
├── index.html             # Main landing page
├── thank-you.html         # Post-submission thank you page
├── styles.css             # All styling (mobile-first)
├── script.js              # Form handling, validation, analytics
├── /assets
│   ├── /images            # Image assets (placeholders noted)
│   └── favicon.ico        # Site favicon
├── netlify.toml           # Netlify deployment config
└── vercel.json            # Vercel deployment config
```

## Local Development

### Prerequisites

- Any modern web browser
- A local web server (options below)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/brandonhood/Atlas-Home-Buyers-Nationwide.git
   cd Atlas-Home-Buyers-Nationwide
   ```

2. Start a local server using one of these methods:

   **Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Node.js (npx):**
   ```bash
   npx serve .
   ```

   **VS Code:**
   Install the "Live Server" extension and click "Go Live"

3. Open `http://localhost:8000` in your browser.

### Google Places Autocomplete

The address autocomplete requires a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Places API** and **Maps JavaScript API**
3. Create an API key and restrict it to your domain
4. Replace `YOUR_API_KEY` in the `<script>` tag at the bottom of `index.html`

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Netlify will auto-detect the static site (no build command needed)
3. Configuration is in `netlify.toml`
4. Set environment variables in Netlify dashboard if needed

**Manual deploy:**
```bash
npx netlify-cli deploy --prod --dir=.
```

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the static site
3. Configuration is in `vercel.json`

**Manual deploy:**
```bash
npx vercel --prod
```

### Custom Domain

After deploying, configure your custom domain in your hosting provider's dashboard and update:
- `og:url` meta tag in `index.html`
- Schema.org `url` in the JSON-LD script
- Google Ads final URL
- Facebook Pixel domain verification

## Environment Variables / Configuration

All configuration is done via inline values in the code. Search for `TODO` comments to find all items needing customization:

| Item | File | What to Replace |
|------|------|-----------------|
| Google Tag Manager ID | `index.html` | `GTM-XXXXXXX` |
| GA4 Measurement ID | `index.html` | `G-XXXXXXXXXX` |
| Facebook Pixel ID | `index.html` | `XXXXXXXXXXXXXXXX` |
| Google Maps API Key | `index.html` | `YOUR_API_KEY` |
| Form Endpoint | `script.js` | `CONFIG.formEndpoint` |
| Phone Number | `script.js` + `index.html` | `(800) 555-0199` |
| Google Ads Conversion ID | `script.js` | `AW-XXXXXXXXXX/XXXX...` |
| Company Logo | `index.html` | Logo text placeholder |
| Hero Image | `styles.css` | `.hero` background |
| Testimonial Photos | `index.html` | Avatar placeholders |
| Favicon | `assets/` | `favicon.ico` |

## Analytics Setup

### Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Replace the placeholder in `index.html`
4. Events tracked automatically:
   - `landing_page_view` — Page load
   - `form_start` — First form interaction
   - `form_field_focus` — Individual field interactions
   - `form_submit_attempt` — Form submit click
   - `generate_lead` — Successful submission
   - `form_validation_error` — Validation failures
   - `scroll_depth` — 25%, 50%, 75%, 100%
   - `time_on_page` — 30s, 60s, 120s, 300s
   - `faq_toggle` — FAQ interactions
   - `cta_click` — CTA button clicks
   - `exit_popup_shown` / `exit_popup_closed`
   - `address_autocomplete_selected`

### Google Tag Manager

1. Create a GTM container at [tagmanager.google.com](https://tagmanager.google.com)
2. Replace `GTM-XXXXXXX` in `index.html`
3. GTM can manage all your tags (GA4, FB Pixel, Google Ads) from one place

### Facebook Pixel

1. Create a Pixel in [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Replace `XXXXXXXXXXXXXXXX` in `index.html`
3. Events tracked:
   - `PageView` — Automatic on load
   - `InitiateCheckout` — Form interaction starts
   - `Lead` — Successful form submission

### Google Ads Conversion Tracking

1. In Google Ads, go to Tools > Conversions
2. Create a new conversion action for "Lead"
3. Get the Conversion ID and Label
4. Replace `AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXX` in `script.js`

## Form Submission Setup

### Option 1: FormSpree (Recommended for Quick Start)

1. Create an account at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form endpoint URL
4. Replace `CONFIG.formEndpoint` in `script.js`

### Option 2: Custom Webhook

Replace `CONFIG.formEndpoint` with your own API endpoint. The form sends these fields:
- `property_address`
- `full_name`
- `phone`
- `email`
- `sms_opt_in` (yes/no)
- `privacy_consent` (on)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `landing_page`
- `gclid`, `fbclid`

### Option 3: Netlify Forms

Add `netlify` attribute to the form tag and Netlify handles submissions automatically.

## A/B Testing Guidelines

The codebase includes commented-out variations for testing. Look for `A/B TEST` comments in `index.html`.

### Testable Elements

1. **Headlines** (3 variations in code):
   - A: "Get A Fair Cash Offer For Your [CITY] House In 24 Hours"
   - B: "Need To Sell Your House Fast? Get Cash In 7 Days"
   - C: "We Buy Houses In Any Condition — Cash Offer Today"

2. **CTA Button Copy** (3 variations):
   - A: "Get My Cash Offer Now"
   - B: "Get My Free Offer →"
   - C: "Yes, I Want A Cash Offer!"

3. **Form Position**:
   - Above the fold (default)
   - Mid-page placement

4. **Hero Background**:
   - Gradient (default)
   - Static image
   - Video background

### Running A/B Tests

**Google Optimize (or similar):**
1. Set up experiments targeting the landing page URL
2. Use element visibility or redirect tests
3. Track the `generate_lead` event as the conversion goal

**Manual A/B Testing:**
1. Create duplicate pages with different variations
2. Split traffic via Google Ads ad variations
3. Compare conversion rates after statistical significance (min. 100 conversions per variant)

## Conversion Tracking Checklist

- [ ] Google Analytics 4 tracking verified
- [ ] Facebook Pixel firing correctly (use FB Pixel Helper extension)
- [ ] Google Ads conversion tag firing on form submit
- [ ] UTM parameters passing through to form submissions
- [ ] Google Click ID (gclid) captured
- [ ] Facebook Click ID (fbclid) captured
- [ ] Form submissions arriving at endpoint
- [ ] Thank-you page loads after submission
- [ ] Exit-intent popup triggers correctly
- [ ] Phone click tracking working on mobile
- [ ] Scroll depth events firing
- [ ] All CTA buttons tracking clicks

## Performance Optimization

The page is built for speed. Current optimizations:

- **No external CSS frameworks** — Custom CSS only
- **No JavaScript libraries** — Vanilla JS
- **System font stack** — No web font downloads
- **SVG icons inline** — No icon library requests
- **Minimal DOM** — Single-page, semantic HTML
- **Lazy loading** ready for images
- **Preconnect hints** for third-party origins
- **CSS animations** use `transform` and `opacity` (GPU-accelerated)
- **IntersectionObserver** for scroll animations (no scroll event handler for animations)
- **Debounced scroll handlers** for sticky header/CTA

### Further Optimization

- Run images through [TinyPNG](https://tinypng.com/) before adding
- Use WebP format with JPEG fallback
- Enable Brotli compression on your hosting provider
- Set up a CDN (Cloudflare, etc.)
- Consider critical CSS inlining for above-the-fold content
- Use `loading="lazy"` on all below-fold images

### Target Metrics

- PageSpeed Insights: 90+ (mobile and desktop)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total page weight: < 100KB (before images)

## Assets Needed

Replace placeholder content with actual assets:

- [ ] Company logo (SVG preferred, fallback PNG)
- [ ] Hero background image (1920x1080, compressed)
- [ ] 3 testimonial photos (150x150, circular crop)
- [ ] Favicon (32x32 .ico + 180x180 apple-touch-icon)
- [ ] Open Graph image (1200x630)

## Legal Pages Needed

Create these pages (linked from the landing page footer):

- [ ] `/privacy-policy` — Privacy policy (GDPR/CCPA compliant)
- [ ] `/terms` — Terms of service

## License

Proprietary. All rights reserved.
