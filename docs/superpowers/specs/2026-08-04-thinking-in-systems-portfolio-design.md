# Thinking in Systems — Portfolio Design

## Purpose

Redesign Ashley Sum's static, single-page portfolio as a memorable but immediately understandable developer portfolio. The page targets internship recruiters and engineering teams evaluating Ashley for Summer 2027 opportunities.

The design expresses how Ashley thinks: breaking complex systems into understandable steps. A flowchart is the visual and narrative device, but the website retains familiar vertical scrolling and conventional navigation.

## Content Scope

The prototype uses only facts and material already present in the current portfolio:

- Ashley Sum, Computer Science student at San Francisco State University
- Malaysian background and national-level swimming experience
- SplitWise Swim
- NBA Player Guessing Game
- Current education, experience, skills, contact links, and CV
- Summer 2027 internship availability

The Ospit internship, WCE highway work, CAD-to-map repository, and any unsupported project outcomes are excluded until Ashley supplies and approves their final wording.

## Core Principle

Use the flowchart as a storytelling system, not as the navigation system.

Visitors use a conventional sticky navigation bar and scroll through a single linear page. They never need to pan, zoom, drag, choose a branch, or learn diagram controls. Connectors, nodes, and branches explain relationships between existing content without replacing headings, links, screenshots, or readable prose.

## Information Architecture

The page follows one clear route:

1. Ashley — concise identity, focus, availability, CV, GitHub, and contact actions
2. What drives me — background, swimming, practical software, sports and data interests
3. Selected work — SplitWise Swim and NBA Player Guessing Game
4. Experience and education — current chronological facts
5. Skills — grouped by where they appear in Ashley's work
6. Where I am heading — Summer 2027 intent
7. Contact — email, LinkedIn, GitHub, and CV

The sticky navigation exposes Work, Experience, About, and Contact. All anchor links retain predictable browser behavior.

## Project Story Structure

Each project uses a compact five-step process:

1. Problem — the user need or challenge
2. Input — the information or interaction entering the system
3. Logic — the important processing or decision mechanism
4. Interface — how the user sees and controls the result
5. Result — the real capability delivered

Only claims supported by the current portfolio or public project repository are included. No fabricated user counts, performance improvements, business outcomes, or technical decisions are introduced.

Project screenshots remain visually dominant. The flow steps clarify the work; they do not turn projects into small diagram cards.

## Visual System

The visual reference is Archify's Signal Flow preset. The portfolio borrows its clear primary path, compact semantic nodes, dark/light contrast, and finite trace motion. It does not reproduce Archify's viewer shell, diagram controls, component taxonomy, or exact styling.

### Character

Precise, energetic, and analytical without resembling a generic dashboard, Mermaid diagram, productivity whiteboard, or embedded Archify artifact.

### Palette

- Deep Graphite — `#0B0F14`: primary canvas
- Raised Graphite — `#141B23`: nodes and supporting surfaces
- Signal Cyan — `#38BDF8`: primary authored path and focus
- Process Blue — `#2563EB`: actions and secondary route segments
- Warm Signal — `#F59E5B`: rare emphasis for a decision or key project moment
- Cool Line — `#34404D`: inactive connectors and boundaries
- Soft White — `#EDF4F7`: primary text
- Muted Steel — `#94A3AD`: supporting text

Cyan carries the main system path. Blue supports actions and secondary relationships. Warm Signal is reserved for one or two high-value moments and never used as a general decorative accent. The design avoids the common near-black-and-acid-green AI aesthetic.

### Typography

- Display: Space Grotesk, used for the hero and major section titles
- Body: Source Sans 3, used for prose and controls
- Utility: IBM Plex Mono, used for node labels, process metadata, dates, and technical annotations

Fallbacks are declared so the prototype remains readable if remote fonts fail.

### Layout

Desktop uses a centered reading column with selected full-width project moments. A single luminous connector can move laterally to relate content, but text always follows an obvious top-to-bottom order. Nodes use compact headers, quiet borders, and restrained glow rather than glass cards.

Mobile collapses every relationship into a vertical sequence. Connectors never cross, content never depends on hover, and touch targets are at least 44 pixels.

## Signature Element

One continuous Signal Flow line begins beside Ashley's name and progresses through the page. It changes state as the visitor scrolls and connects only information with a real relationship.

The line is the sole expressive motion system. It traces each section once as the visitor reaches it, then becomes static. Other animation remains restrained: short node reveals, subtle project-image transitions, and clear hover or focus feedback. There is no looping ambient motion. Reduced-motion preferences disable drawing and reveal animation while retaining the full content structure.

### Deliberate Departures from Archify

- No canvas panning, zooming, semantic search, route probing, presentation controls, legends, or export interface
- No requirement to interpret component colors before understanding the content
- No dense network topology or crossing connectors
- No diagram chrome around the page
- Project evidence and conventional headings remain more prominent than nodes
- Mobile uses a single vertical rail instead of a scaled diagram

## Section Designs

### Hero

The hero states Ashley's identity and value directly. A compact starting node introduces the system line. Primary actions are View work and Download CV; GitHub and LinkedIn remain visible secondary actions. Summer 2027 availability is presented as factual status text, not a fake live-system indicator.

### About

The about section uses three connected ideas—competitive swimming, practical software, and data-informed performance—to summarize the current biography. The copy remains concise and does not force every personal interest into a node.

### Projects

Each project receives a large screenshot, a plain-language description, its five-step process, verified technology labels, and obvious Demo and Source links. SplitWise appears first because it best supports the performance-and-systems narrative.

### Experience and Education

Experience and education use a simple chronological flow. Roles are not presented as oversized cards. Dates, organizations, titles, and concise evidence stay scannable.

### Skills

Skills are grouped by demonstrated use—Build, Data, Interface, and Workflow—instead of a wall of logos. Each skill group connects back to the project or role that demonstrates it when the current material supports that relationship.

### Contact

The system line terminates in a strong, uncluttered contact section. Email is the primary action. LinkedIn, GitHub, and CV remain immediately available.

## Interaction and Accessibility

- Semantic headings and landmarks preserve screen-reader navigation.
- A visible skip link bypasses the sticky header.
- Keyboard focus is visible on every interactive element.
- Color is never the only indicator of state or relationship.
- Text and controls meet WCAG AA contrast targets.
- The page works without JavaScript; JavaScript adds only progressive connector and reveal behavior.
- `prefers-reduced-motion` removes nonessential animation.
- No critical information appears only on hover.

## Prototype Deliverable

Build one self-contained responsive HTML prototype for the approved Thinking in Systems direction. It may use inline CSS and JavaScript and existing local assets, but it must not modify the production `index.html`.

The prototype must demonstrate the complete page on desktop and mobile, including every existing content section, functional anchor navigation, project links, CV/contact actions, responsive connectors, keyboard states, and reduced-motion behavior.

After implementation, capture desktop and mobile screenshots and assess the direction for memorability, recruiter scanning, mobile clarity, accessibility, and risk of appearing AI-generated.

## Success Criteria

- A recruiter can identify Ashley, her current status, and her strongest project within 30 seconds.
- The page reads correctly from top to bottom without interpreting the flowchart.
- The connector system reinforces real relationships and never blocks navigation.
- Project evidence is more prominent than decoration.
- Desktop and mobile layouts feel intentionally designed rather than one being a compressed version of the other.
- The design is recognizably tied to Ashley's way of thinking and current work, not to a copied consumer-product brand.
