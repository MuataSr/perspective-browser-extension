# 🐐 GOAT Mode: Universal Software Development SOPs

This document outlines the GOAT (Greatest Of All Time) development philosophy, which will be used for this project. It emphasizes a structured, quality-first approach to software engineering.

## 📦 Project Context: Perspective

### Mission
To build a browser extension named "Perspective" that acts as a critical thinking coach. It helps users engage more deeply with online content by automatically providing counterarguments, detecting logical fallacies, and assessing source credibility in a helpful, coach-like manner.

### Tech Stack
- **Frontend:** HTML, CSS, JavaScript (initially, may add a framework later)
- **Platform:** Chrome Extension (Manifest V3)
- **Backend:** AI processing will be handled via model calls.
- **Database:** `localStorage` or `chrome.storage` for user settings.
- **Deployment:** Chrome Web Store

### Key Architectural Decisions
1. **Background Analysis:** The extension will proactively analyze articles in the background to ensure performance. The UI will only be triggered on user demand.
2. **On-Demand UI:** Results are displayed in a pop-up, not a persistent sidebar, to minimize intrusion.
3. **Component-Based (Conceptually):** We will structure the code logically into components (e.g., UI, analysis, API handling) even without a formal framework at the start.

### Current Status
- **Version:** v0.1.0 (Pre-Alpha)
- **Stage:** Scaffolding and initial development.
- **Known Limitations:** None yet.

---

## 🐐 GOAT Mode Principles

1.  **Measure Twice, Cut Once:** Plan thoroughly before writing any code. Understand requirements, map architecture, identify edge cases, and review existing patterns.
2.  **Clear Specifications:** All implementation tasks must be based on clear, unambiguous specifications.
3.  **Iterative Refinement:** Review all output, identify issues, and provide specific feedback for the next iteration until commercial-grade quality is achieved.
4.  **Pragmatic over Perfect:** Ship working software, simplify requirements when blocked, and defer non-critical features.
5.  **Quality is Non-Negotiable:** All work must meet the high standards for functionality, code quality, UX, and robustness outlined below.

## ⚙️ GOAT Mode Workflow

1.  **UNDERSTAND:** Analyze user requirements and the existing codebase.
2.  **PLAN:** Create a detailed implementation plan and define success criteria.
3.  **BUILD:** Implement based on the plan, following all conventions.
4.  **REVIEW:** Test the implementation, debug issues, and verify quality.
5.  **REFINE or SHIP:** If issues are found, return to BUILD with feedback. If quality is met, ship it.

## 🎯 Quality Standards

### Commercial-Grade Quality Checklist
- **Functionality:** Works correctly, handles edge cases, fails safely.
- **Code Quality:** Follows conventions, is DRY, has clear names, is commented where necessary, has no debug code.
- **User Experience:** Intuitive, responsive, accessible, consistent.
- **Robustness:** Handles malformed data, is backward compatible.

## 🚨 Problem-Solving Protocol

1.  **Define the Problem:** What is failing? What is expected vs. actual?
2.  **Gather Information:** Review code, check docs, test in isolation.
3.  **Generate Solutions:** Brainstorm 3+ options and evaluate pros/cons.
4.  **Decide & Implement:** Pick the simplest, most pragmatic solution.
5.  **Document:** Record the problem, solution, and rationale.
