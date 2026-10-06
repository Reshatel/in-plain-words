# In Plain Words — law office landing

A one-page website for a fictional law office whose whole idea is “legal help without legalese”. Built as a test assignment.

**Live:** https://&lt;your-github-username&gt;.github.io/&lt;repo-name&gt;/

```bash
npm install
npm run dev
npm run build
npm run preview
```

Requires Node 20.19+ or 22.12+.

## Deploy

The repo ships with `.github/workflows/deploy.yml`: every push to `main` builds the site and publishes `dist` to GitHub Pages. Asset and page links are relative (`base: './'`), so the site works from any sub-path.

1. Create an empty repository on GitHub.
2. Push this project to its `main` branch.
3. In the repository: Settings → Pages → Source: **GitHub Actions**.

## Site plan

**Goal.** Turn visitors into consultation requests. Every block either removes a fear (jargon, unknown price, “will I be understood”) or leads to the request form.

**Audience.**
- Private clients 25–55: buying or selling a flat, divorce, inheritance, consumer disputes.
- Small business owners and sole traders: contracts, unpaid invoices, company setup.
- IT founders: trademarks, licences, contractor IP.

**Pages.**
| Page | Purpose |
| --- | --- |
| `index.html` | Landing with all blocks below |
| `thanks.html` | Confirmation with a stamped summary of the request and the attached estimate |
| `privacy.html` | Privacy policy: a short “In plain words” summary on top, full text below |
| `404.html` | “This page isn’t in the file” with a DENIED stamp |

**Landing structure.**
0. Preloader — “Case No. 1. Yours.” is typed, stamped and flown away on every load.
1. Header — stamp logo, anchors, phone, “Ask a question”, hides on scroll down.
2. Hero — legalese gets struck through, the human headline appears, CTAs “See the price” and “Book a consultation”.
3. Legalese translator — six flip cards: term → one plain sentence + real-life example.
4. Numbers — four sticky notes with counters and handwritten remarks.
5. Services — a folder with six tabs; the official name is crossed out and replaced with a human one, “from $” price, “Estimate” opens the calculator preselected.
6. How it works — four steps connected by a hand-drawn path that draws on scroll.
7. Cases — six folders with result stamps, practice filter, case file opens in a modal.
8. Lawyer’s file — dossier with typed-in fields, signature and associates.
9. Pricing calculator — four steps, live receipt, “Send estimate” tears the receipt off and attaches it to the form.
10. Reviews — notes on a desk you can drag (swipe a stack on mobile).
11. FAQ — six answers, key phrase highlighted with a marker.
12. Consultation request — validated form, stamped “RECEIVED”, then `thanks.html`.
13. Footer — huge brand name that scrubs in, contacts, back to top.

**Stack.** Vite (multi-page build), vanilla JS modules, GSAP 3 (ScrollTrigger, SplitText, DrawSVG, Flip, TextPlugin, Draggable, Inertia), Lenis smooth scroll, Fontsource fonts (Plus Jakarta Sans, JetBrains Mono, Caveat). Photos from Unsplash, everything else is CSS and inline SVG.

## Code map

```
src/
  config.js        motion, office contacts, storage keys, pricing rules, photo URLs
  main.js          plugin registration and boot of every block
  scroll.js        Lenis + anchor scrolling helpers
  storage.js       safe localStorage / sessionStorage
  fx/              reusable “paper physics”: paperIn, stampDown, strikeThrough, markerSweep, drawScribble, revealWords
  data/            all copy: terms, practices, cases, reviews, FAQ, calculator catalog
  calculator/      pricing.js (pure functions), receipt.js, calculator.js (UI)
  sections/        one module per block
  pages/           thanks, privacy and 404 behaviour
  styles/          tokens, base, components, one file per section
```

**Motion language.** Sheets fly in from below with a tilt that settles to ±1° (`back.out(1.4)`, 0.9s, stagger 0.08). Strike-throughs are red SVG lines drawn with DrawSVG; markers grow their background; stamps slam from 2.4× and shake the sheet. Everything reveals once at `top 80%`. With `prefers-reduced-motion` the site only fades and Lenis is off.

**Pricing formula.** `price = base × complexity × speed × (1.2 if English support) + hearings × $75 + extras`, shown as a range `0.9–1.15 ×` rounded to $10. Term = `base days × speed term factor × complexity`.

## AI workflow log

1. Brief → skeleton: Vite demo removed, design tokens, fonts, GSAP + Lenis wiring, multi-page config.
2. Copy and structure agreed in the brief; site switched to English, brand “In Plain Words”.
3. Reusable motion primitives written first (`src/fx`), then sections built in four groups, each checked in a browser and committed: hero group → translator/numbers/services/process → cases/dossier/calculator → reviews/FAQ/form/footer → subpages.
4. Browser checks at 1280px and 375px caught a header crash on subpages, horizontal overflow from card fan-in and clipped descenders in masked text; all fixed.
5. Rules kept throughout: no comments in code, domain names, constants in `config.js`, early returns.
