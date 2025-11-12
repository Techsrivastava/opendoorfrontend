# 🎯 SEO Implementation Guide - Open Door Expeditions

## ✅ Pages & Their SEO Meta Tags

---

## 1. **index.html** - Homepage

```html
<!-- Primary Meta Tags -->
<title>Open Door Expeditions | Best Himalayan Trekking & Adventure Tours in India</title>
<meta name="title" content="Open Door Expeditions | Best Himalayan Trekking & Adventure Tours in India">
<meta name="description" content="Experience the ultimate Himalayan adventure with Open Door Expeditions. Book Kedarnath, Do Dham, Char Dham, and Kashmir tours. Expert guides, safe travels, and unforgettable experiences.">
<meta name="keywords" content="Himalayan trekking, Kedarnath tour, Do Dham Yatra, Char Dham Yatra, Kashmir tours, adventure tours India, trekking packages, pilgrimage tours, Uttarakhand tours">
<meta name="author" content="Open Door Expeditions">
<meta name="robots" content="index, follow">
<meta name="language" content="English">
<meta name="revisit-after" content="7 days">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://opendoorexpeditions.com/">
<meta property="og:title" content="Open Door Expeditions | Best Himalayan Trekking & Adventure Tours">
<meta property="og:description" content="Experience the ultimate Himalayan adventure with Open Door Expeditions. Book Kedarnath, Do Dham, Char Dham, and Kashmir tours.">
<meta property="og:image" content="https://opendoorexpeditions.com/images/og-image.jpg">
<meta property="og:site_name" content="Open Door Expeditions">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://opendoorexpeditions.com/">
<meta property="twitter:title" content="Open Door Expeditions | Best Himalayan Trekking & Adventure Tours">
<meta property="twitter:description" content="Experience the ultimate Himalayan adventure with Open Door Expeditions.">
<meta property="twitter:image" content="https://opendoorexpeditions.com/images/twitter-image.jpg">

<!-- Canonical -->
<link rel="canonical" href="https://opendoorexpeditions.com/">

<!-- Schema.org for Google -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Open Door Expeditions",
  "description": "Premier Himalayan trekking and adventure tours company",
  "url": "https://opendoorexpeditions.com",
  "logo": "https://opendoorexpeditions.com/images/logo.png",
  "telephone": "+91-7455059476",
  "email": "info@opendoorexpeditions.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressRegion": "Uttarakhand"
  },
  "sameAs": [
    "https://www.facebook.com/opendoorexpeditions",
    "https://www.instagram.com/opendoorexpeditions"
  ],
  "priceRange": "₹₹"
}
</script>
```

---

## 2. **trips.html** - All Tours/Packages

```html
<title>All Tours & Packages | Himalayan Trekking Tours | Open Door Expeditions</title>
<meta name="description" content="Browse all our Himalayan adventure packages. Kedarnath, Do Dham, Char Dham Yatra, Kashmir, and custom trekking tours. Best prices, expert guides.">
<meta name="keywords" content="Himalayan tours, trekking packages, Kedarnath package, Do Dham package, Char Dham package, Kashmir tour, adventure packages India">
<link rel="canonical" href="https://opendoorexpeditions.com/trips">

<meta property="og:title" content="All Tours & Packages | Open Door Expeditions">
<meta property="og:description" content="Browse all our Himalayan adventure packages. Best prices, expert guides.">
<meta property="og:url" content="https://opendoorexpeditions.com/trips">
<meta property="og:image" content="https://opendoorexpeditions.com/images/trips-og.jpg">
```

---

## 3. **trip-single.html** - Individual Package

```html
<!-- Dynamic based on package -->
<title>[Package Name] Tour | Book Now | Open Door Expeditions</title>
<meta name="description" content="Book [Package Name] tour package. [Duration] days journey with expert guides. Inclusions: [list]. Starting from ₹[price].">
<meta name="keywords" content="[Package Name], [Package Name] tour, [Package Name] package, [destination] tour">
<link rel="canonical" href="https://opendoorexpeditions.com/trip/[slug]">

<!-- Schema for Tour Package -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "[Package Name]",
  "description": "[Description]",
  "provider": {
    "@type": "TravelAgency",
    "name": "Open Door Expeditions"
  },
  "offers": {
    "@type": "Offer",
    "price": "[price]",
    "priceCurrency": "INR"
  },
  "itinerary": {
    "@type": "ItemList",
    "itemListElement": []
  }
}
</script>
```

---

## 4. **about.html** - About Us

```html
<title>About Us | Expert Himalayan Tour Operators | Open Door Expeditions</title>
<meta name="description" content="Learn about Open Door Expeditions - Your trusted partner for Himalayan adventures. Experienced guides, safety-first approach, 1000+ happy travelers.">
<meta name="keywords" content="about Open Door Expeditions, Himalayan tour operator, adventure tour company India, trekking company">
<link rel="canonical" href="https://opendoorexpeditions.com/about">
```

---

## 5. **contact.html** - Contact Us

```html
<title>Contact Us | Get in Touch | Open Door Expeditions</title>
<meta name="description" content="Contact Open Door Expeditions for bookings and inquiries. Call +91-7455059476 or email info@opendoorexpeditions.com. Plan your Himalayan adventure today!">
<meta name="keywords" content="contact Open Door Expeditions, book Himalayan tour, trekking booking, tour inquiry">
<link rel="canonical" href="https://opendoorexpeditions.com/contact">

<!-- Local Business Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Open Door Expeditions",
  "url": "https://opendoorexpeditions.com/contact",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-7455059476",
    "contactType": "Customer Service",
    "email": "info@opendoorexpeditions.com",
    "availableLanguage": ["en", "hi"]
  }
}
</script>
```

---

## 6. **blog.html** - Blog Listing

```html
<title>Travel Blog | Himalayan Trekking Tips & Guides | Open Door Expeditions</title>
<meta name="description" content="Read our travel blog for Himalayan trekking tips, destination guides, travel stories, and adventure insights. Expert advice for your next journey.">
<meta name="keywords" content="Himalayan travel blog, trekking tips, adventure blog, travel guides India, Kedarnath guide">
<link rel="canonical" href="https://opendoorexpeditions.com/blog">
```

---

## 7. **my-bookings.html** - Customer Dashboard

```html
<title>My Bookings | Open Door Expeditions</title>
<meta name="description" content="View and manage your tour bookings with Open Door Expeditions. Track your upcoming adventures.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://opendoorexpeditions.com/my-bookings">
```

---

## 8. **404.html** - Error Page

```html
<title>Page Not Found | Open Door Expeditions</title>
<meta name="description" content="The page you're looking for doesn't exist. Return to homepage to explore our Himalayan adventure packages.">
<meta name="robots" content="noindex, nofollow">
```

---

## ✅ Common Elements for All Pages

### **Preload Critical Resources**

```html
<!-- Preload critical fonts -->
<link rel="preload" href="fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preload critical CSS -->
<link rel="preload" href="css/bootstrap.min.css" as="style">
<link rel="preload" href="css/custom.css" as="style">

<!-- DNS Prefetch for external resources -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//fonts.gstatic.com">
```

### **Favicon Complete Set**

```html
<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#F5AD4C">
```

---

## 🚀 Performance Optimization

### **Lazy Loading Images**

```html
<img src="placeholder.jpg" 
     data-src="actual-image.jpg" 
     class="lazy" 
     alt="Description" 
     loading="lazy">
```

### **Async/Defer Scripts**

```html
<!-- Non-critical JavaScript -->
<script src="js/script.js" defer></script>

<!-- Third-party analytics -->
<script src="analytics.js" async></script>
```

### **Minify Resources**

- Minify all CSS files
- Minify all JavaScript files
- Compress images (WebP format)
- Use CDN for libraries

---

## 📊 Structured Data Priority

1. **Homepage**: Organization/TravelAgency schema
2. **Trips**: ItemList schema
3. **Trip Single**: TouristTrip/Offer schema
4. **Blog**: Article schema
5. **Contact**: ContactPage schema

---

## 🎯 SEO Checklist

- [x] Meta titles (50-60 characters)
- [x] Meta descriptions (150-160 characters)
- [x] Keywords (5-10 relevant keywords)
- [x] Open Graph tags (Facebook)
- [x] Twitter Cards
- [x] Canonical URLs
- [x] Structured Data (Schema.org)
- [x] Robots meta
- [x] XML Sitemap
- [x] Robots.txt
- [x] Alt tags on images
- [x] Internal linking
- [x] Mobile responsive
- [x] HTTPS (when SSL ready)
- [x] Page speed optimization

---

## 🔗 Additional Files Needed

1. **sitemap.xml** - For search engines
2. **robots.txt** - Crawler instructions
3. **site.webmanifest** - PWA support
4. **og-image.jpg** - Open Graph image (1200x630px)
5. **twitter-image.jpg** - Twitter card image (1200x600px)

---

## 📈 Priority Implementation Order

1. **Homepage** (index.html) - Highest priority
2. **Trips** (trips.html) - High priority
3. **Trip Single** (trip-single.html) - High priority
4. **About** (about.html) - Medium priority
5. **Contact** (contact.html) - Medium priority
6. **Blog** (blog.html) - Medium priority
7. **Other pages** - Low priority

---

**Next Steps:** Implement these meta tags in actual HTML files!
