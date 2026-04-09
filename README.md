# ASHLEYTZELE - Personal Portfolio

A modern, responsive portfolio website showcasing projects, skills, and experience with a beautiful Material Design-inspired interface. Built as a single-page application with smooth scrolling navigation.

## 📁 Project Structure

```
ASHLEYTZELE Personal Website/
├── index.html                      # 📍 Main portfolio (single-page app)
├── assets/
│   ├── images/                     # Hero, about, and project images
│   ├── logos/                      # Logo and social media icons
│   └── documents/                  # CV and other files
├── server.py                      # Python local server (recommended)
├── package.json                   # Node.js dependencies (optional)
└── README.md                      # This file
```

**Note:** All content is now integrated into `index.html` as a unified single-page application. The individual section folders are archived for reference only.

## 🚀 Quick Start

### Option 1: Using Python (Recommended - No Installation Required)

Since you're on macOS, Python is pre-installed. Simply run:

```bash
cd /Users/Dell/Desktop/Github/ASHLEYTZELE\ Personal\ Website
python3 server.py
```

This will:
- Start a local server at `http://localhost:8080`
- Automatically open your browser
## 🚀 Quick Start

### Option 1: Using Python (Recommended - No Installation Required)

Since you're on macOS, Python is pre-installed. Simply run:

```bash
cd /Users/Dell/Desktop/Github/ASHLEYTZELE\ Personal\ Website
python3 server.py
```

This will:
- Start a local server at `http://localhost:8080`
- Automatically open your browser
- Load the complete portfolio with all sections

### Option 2: Using Node.js (If you have npm installed)

First, install dependencies:
```bash
cd /Users/Dell/Desktop/Github/ASHLEYTZELE\ Personal\ Website
npm install
```

Then start the server:
```bash
npm start           # Opens browser automatically
```

### Option 3: Direct Browser Access

You can also open the file directly:
1. Open Finder and navigate to the folder
2. Double-click `index.html` to open it in your default browser

However, using a local server is recommended for best results.

## 📄 Navigation

The portfolio is now a **single-page application** with smooth scrolling navigation:

### Sections (via anchor links):
- **#home** - Hero section with introduction and CV download
- **#projects** - Featured projects showcase
- **#experience** - Experience and education timeline
- **#skills** - Programming languages, frameworks, and tools
- **#contact** - Contact form and direct email

### Navigation Options:
- **Desktop**: Fixed header with main navigation menu
- **Mobile**: Fixed bottom navigation footer (appears below the content)

All navigation uses anchor links for instant page jumps with smooth scrolling.

## 🎨 Features

✨ **Single-Page Application** - No page reloads, smooth navigation  
🔗 **Anchor Link Navigation** - Jump to any section instantly  
📱 **Fully Responsive** - Works perfectly on all screen sizes  
🌓 **Light/Dark Mode** - Automatic theme switching support  
⚡ **Tailwind CSS** - Modern, utility-first styling  
🎯 **Material Design** - Clean, professional aesthetic  
🏃 **Smooth Scrolling** - Beautiful transitions between sections  

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (with forms, container queries plugins)
- **Material Symbols** - Google's icon library for consistent iconography
- **Inter Font** - Professional typography from Google Fonts
- **JavaScript** - Minimal dependencies, vanilla JS

## � Key Sections

### Hero Section
- Large introductory heading with subtext
- Call-to-action buttons: "Download CV" and "Get In Touch"
- LinkedIn and GitHub icon links
- Hero image on desktop

### About Section
- Brief professional bio
- About image showcase
- Link to skills section

### Projects Section
- Featured project cards with hover effects
- Project descriptions, tech stacks, and links
- Responsive grid layout

### Skills Section
- Programming language proficiency bars
- Frameworks & technology categories (Frontend, Backend, Cloud/DevOps)
- Tools & software overview with icons
- Core philosophy statement

### Experience & Education Section
- Educational background (timeline format)
- Professional experience with detailed descriptions
- Timeline visual design with hover effects
- Key achievements listed with checkmarks

### Contact Section
- Email contact form with animated labels
- Direct contact information
- Email link with fast response guarantee

## 🔧 Customization

### Edit Content
Simply open `index.html` and modify the text in the relevant sections. All sections have clear HTML comments marking their boundaries.

### Update Images
Place new images in `assets/images/` and update the `src` attributes in `index.html`:
```html
<img src="assets/images/your-image.jpg" alt="Description">
```

### Change Colors
Edit the Tailwind color configuration in the `<script id="tailwind-config">` section at the top of `index.html`.

### Modify CV Link
Update the CV file in `assets/documents/` and ensure the download link points to it:
```html
<a href="assets/documents/YOUR_CV.pdf" download>Download CV</a>
```

## ✅ Features Checklist

- [x] Single-page application with smooth navigation
- [x] Mobile-responsive design
- [x] Anchor link navigation (#home, #projects, etc.)
- [x] Fixed header with branding
- [x] Mobile footer navigation
- [x] Dark/light mode support
- [x] Professional Material Design aesthetic
- [x] CV download functionality
- [x] Social media links
- [x] Contact form
- [x] Project showcase
- [x] Skills with proficiency bars
- [x] Experience timeline

## 🐛 Troubleshooting

**Port 8080 already in use?**
```bash
# Edit server.py and change PORT = 8080 to another number
python3 server.py
```

**Images not loading?**
Check that the relative path is correct. For example:
- From `index.html`: `assets/images/hero-image.jpg`
- From a subfolder: `../assets/images/hero-image.jpg`

**Navigation links not working?**
All navigation should use anchor links like `#projects`, `#skills`, etc. Make sure the corresponding section has the correct `id` attribute.

**Mobile footer overlapping content?**
The footer is `fixed` and positioned at the bottom. Ensure the main content has `pb-40` (padding-bottom) class applied to the `<main>` element.

---

Made with ❤️ for ASHLEYTZELE Personal Website
# ashleytzele-Personal-Website
