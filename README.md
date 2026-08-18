# CTC AI Learning Lab

A separate starter project for Central Texas College built as a static site prototype.

## What is included

- A cinematic, continuously animated entrance leading into the guided learning journey
- A primary EX-MULTIS integration CTA
- Role-based pathways for faculty, staff, students, and builders
- A Start Here pathway and a Foundations page
- Two working labs:
  - AI Decision Lab
  - Prompt Gym
- A browser-local Learning Passport using localStorage
- Resource and Facilitator starter pages
- The official supplied CTC logo used consistently across the site

## Project goals for this version

1. Keep the CTC project completely separate from the MCC project.
2. Demonstrate the core site architecture visually and functionally.
3. Place EX-MULTIS in a clear action role, not as a buried link.
4. Establish a reusable design system and page structure that can grow.

## Folder structure

```text
ctc-ai-learning-lab/
├── index.html
├── start-here/
├── foundations/
├── labs/
│   ├── decision-lab/
│   └── prompt-gym/
├── pathways/
│   ├── faculty/
│   ├── staff/
│   ├── students/
│   └── builders/
├── resources/
├── facilitator/
├── passport/
└── assets/
    ├── css/
    ├── js/
    ├── data/
    └── img/
```

## How to run locally

Because this is a static site, you can:

- open `index.html` directly in a browser, or
- serve it locally with a simple web server.

Example using Python:

```bash
cd ctc-ai-learning-lab
python -m http.server 8000
```

Then visit:

`http://localhost:8000`

## Key implementation notes

- `assets/js/app.js` handles local progress tracking and common behaviors.
- `assets/js/intro.js` powers the animated entrance and its reduced-motion fallback.
- `assets/js/decision-lab.js` powers the AI Decision Lab.
- `assets/js/prompt-gym.js` powers the Prompt Gym.
- Progress is stored in `localStorage` only.
- The EX-MULTIS button is currently linked to `https://exmultis.com/`.

## Suggested next build phases

### Phase 2
- add a true searchable content index
- create a richer “How LLMs Work” module
- add more scenarios and labs
- build deeper faculty/staff/student modules
- add a printable learning record

### Phase 3
- facilitator session builder
- QR code session links
- analytics or LMS integration if desired
- institution-approved policy and privacy content
