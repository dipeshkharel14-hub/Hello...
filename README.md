# NEXUS — Digital Intelligence Agency Website

A **production-grade, feature-rich** static website built with pure HTML, CSS, and JavaScript — no frameworks, no build tools, just clean and powerful vanilla code.

---

## 🚀 Live Features

### 🎨 Visual & Animations
- **Particle canvas** with mouse-repulsion physics on the hero section
- **Neural network canvas** animation in the portfolio section
- **Audio wave** canvas visualization
- **Smooth page loader** with animated counter and progress bar
- **Custom cursor** with magnetic follower and hover states
- **Scroll reveal animations** with Intersection Observer
- **Tilt/3D card** effect on hover (perspective transform)
- **Text scramble effect** on the hero badge
- **Reading progress bar** at the top of the page
- **Parallax scrolling** on the hero canvas
- **Animated skill bars** with live percentage counters

### 🧩 Interactive Components
- **Testimonial carousel** with auto-advance, keyboard nav, and dot indicators
- **Work portfolio filter** with category filtering and animated transitions
- **FAQ accordion** with smooth expand/collapse
- **Interactive contact form** with real-time validation, budget slider, and character counter
- **Service detail modals** on card click
- **Mobile hamburger menu** with animated open/close
- **Section progress indicator** (right-side dots)
- **Back to top** button

### 📊 Data & Charts
- **Animated growth chart** drawn on `<canvas>` with smooth line animation
- **Animated counter stats** with eased transitions
- **Skill bars** with animated width transitions

### 🛠 Technical
- **Dark/Light theme toggle** with `localStorage` persistence
- **CSS custom properties** (design tokens) for full theming
- **Toast notification system** with types (success / error / default)
- **Mock analytics tracker** with event logging
- **Keyboard accessibility** (Escape key, arrow navigation)
- **Throttled & debounced** event handlers for performance
- **Responsive** — mobile, tablet, desktop breakpoints
- **Custom scrollbar** styling
- **Section-aware navigation** highlighting

---

## 📁 File Structure

```
nexus-website/
├── index.html      # Full HTML structure (1 file, ~350 lines)
├── style.css       # Complete CSS with design tokens (~900 lines)
├── main.js         # All JavaScript (~650 lines, 30+ functions)
└── README.md       # This file
```

---

## 🧪 JavaScript Functions Reference

| Function | Description |
|---|---|
| `initLoader()` | Animated page loader with counter |
| `initHeroCanvas()` | Particle field with mouse repulsion |
| `initNeuralCanvas()` | Neural network node animation |
| `initAIWave()` | Audio wave canvas animation |
| `drawGrowthChart()` | Animated multi-line revenue chart |
| `initCursor()` | Custom cursor with smooth following |
| `initNav()` | Sticky nav, scroll detection, active links |
| `initTheme()` | Dark/light theme toggle with persistence |
| `initReveal()` | Scroll-triggered reveal animations |
| `animateCounters()` | Eased number counting animations |
| `initSkillBars()` | Animated skill progress bars |
| `initWorkFilter()` | Portfolio filter with animations |
| `initTestimonials()` | Carousel with auto-advance |
| `initFAQ()` | Accordion with smooth height animation |
| `initContactForm()` | Full form validation + budget slider |
| `showToast()` | Toast notification system |
| `initSmoothScroll()` | Smooth anchor scrolling |
| `initParallax()` | Scroll-based parallax effect |
| `initHeroSpotlight()` | Mouse-following spotlight on hero |
| `initTiltEffect()` | 3D perspective tilt on cards |
| `initKeyboardNav()` | Keyboard accessibility support |
| `initReadingProgress()` | Scroll progress bar |
| `initSectionProgress()` | Side-dot section indicator |
| `initTextScramble()` | Text scramble cycling animation |
| `initServiceModals()` | Service detail popup modals |
| `initClientLogos()` | Staggered logo reveal |
| `initAnalytics()` | Mock analytics event tracking |
| `typewriterEffect()` | Typewriter text animation |
| `TextScramble` (class) | Full scramble animation engine |

---

## 🎨 Design System

### Colors
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#080808` | `#f8f7f4` |
| `--accent` | `#ff4d00` | `#ff4d00` |
| `--accent-2` | `#00d4ff` | `#00d4ff` |
| `--accent-3` | `#a855f7` | `#a855f7` |

### Typography
- **Display**: Syne (700, 800)
- **Mono**: Space Mono
- **Body**: DM Sans

---

## 🚀 Getting Started

Simply open `index.html` in any modern browser. No build step required.

```bash
git clone https://github.com/yourusername/nexus-website.git
cd nexus-website
open index.html
```

Or serve with any static server:
```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📄 License

MIT — free to use and modify for any project.

---

*Built with ❤️ using only HTML, CSS & Vanilla JS*
