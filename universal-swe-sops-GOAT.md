Universal Software Development SOPs for Claude Code + Minimax M2

🐐 GOAT Mode: The Claude Code + Minimax M2 Partnership
What is GOAT Mode?

GOAT Mode is a development philosophy that leverages the unique strengths of two AI systems working in harmony:

Claude Code (The Architect) - Project management, planning, debugging, and orchestration
Minimax M2 (The Builder) - Code generation, implementation, and execution
The GOAT Mode Principles
1. Trust the Partnership
Claude Code excels at understanding requirements, planning architecture, and debugging
Minimax M2 excels at writing clean, efficient code based on clear specifications
Together, they form the Greatest Of All Time development team
2. Clear Handoffs

When Claude Code hands off to Minimax M2, provide:

Exact specifications - No ambiguity in requirements
File paths - Precise locations for all modifications
Code patterns - Examples from existing codebase
Success criteria - How to verify the implementation works
3. Iterative Refinement
Claude Code reviews Minimax M2's output
Identifies issues, edge cases, or improvements
Provides specific feedback for next iteration
Repeats until commercial-grade quality achieved
4. Know When to Pivot

GOAT Mode means recognizing when to:

Ship working software instead of chasing perfect solutions
Simplify requirements when complexity blocks progress
Defer features that aren't critical path
Accept pragmatic solutions over theoretical ideals
GOAT Mode Workflow
┌─────────────────────────────────────────────────────────────┐
│ 1. UNDERSTAND (Claude Code)                                 │
│    - Analyze user requirements                              │
│    - Review existing codebase                               │
│    - Identify all affected components                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PLAN (Claude Code)                                       │
│    - Map data flow and architecture                         │
│    - Identify edge cases and constraints                    │
│    - Create detailed implementation spec                    │
│    - Define success criteria                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BUILD (Minimax M2)                                       │
│    - Implement based on Claude's specifications             │
│    - Follow existing code patterns                          │
│    - Write clean, maintainable code                         │
│    - Include inline documentation                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REVIEW (Claude Code)                                     │
│    - Test implementation thoroughly                         │
│    - Debug any issues                                       │
│    - Verify edge cases handled                              │
│    - Ensure quality standards met                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. REFINE or SHIP (Both)                                    │
│    - If issues found: Return to step 3 with feedback        │
│    - If quality met: Ship it                                │
│    - Document decisions and learnings                       │
└─────────────────────────────────────────────────────────────┘

GOAT Mode Communication Protocol
For Claude Code → Minimax M2 Handoffs:
## Implementation Request for Minimax M2

**Objective:** [One sentence description]

**Files to Modify:**
1. `path/to/file1.js` - [What changes]
2. `path/to/file2.html` - [What changes]

**Detailed Specifications:**
[Exact requirements, data structures, function signatures]

**Existing Patterns to Follow:**
[Code examples from current codebase]

**Edge Cases to Handle:**
- [Case 1]
- [Case 2]

**Success Criteria:**
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]

For Minimax M2 → Claude Code Returns:
## Implementation Complete

**Files Modified:**
- `path/to/file1.js` - [Summary of changes]
- `path/to/file2.html` - [Summary of changes]

**Key Implementation Details:**
[Explain approach, algorithms, or patterns used]

**Testing Performed:**
- [Test 1 result]
- [Test 2 result]

**Known Limitations:**
[Any constraints or assumptions]

**Ready for Review**

📋 Universal Development SOP
Measure Twice, Cut Once

The Golden Rule of Software Development

1. PLAN - Before Writing Any Code
 Understand the requirement completely
 Map out the data flow and architecture
 Identify all files to modify
 Consider edge cases and error states
 Check for backward compatibility
 Review security implications
 Assess performance impact
2. MEASURE - Verify the Plan
 Review existing code patterns
 Check similar implementations in codebase
 Validate data model changes
 Ensure UI/UX consistency
 Confirm API contracts
 Verify dependencies and versions
3. CUT - Implement Once
 Write clean, consistent code
 Follow existing patterns and conventions
 Add inline documentation for complex logic
 Test thoroughly (happy path + edge cases)
 Document changes in commit messages
🎯 Quality Standards
Commercial-Grade Quality Checklist

Every feature must meet these standards:

Functionality
 Works correctly in all expected scenarios
 Handles edge cases gracefully
 Fails safely with clear error messages
 Performs efficiently (no unnecessary operations)
Code Quality
 Follows project conventions and patterns
 DRY (Don't Repeat Yourself) - no unnecessary duplication
 Clear variable and function names
 Commented where logic is non-obvious
 No console.log() or debug code left behind
User Experience
 Intuitive and easy to understand
 Responsive and fast
 Accessible (keyboard navigation, screen readers)
 Consistent with existing UI patterns
 Provides feedback for user actions
Robustness
 Backward compatible with existing data
 Handles missing or malformed data
 Graceful degradation when features unavailable
 No breaking changes without migration path
📝 Feature Development Template
For Every New Feature:
Phase 1: Requirements Analysis
 What problem does this solve?
 Who is the user and what's their goal?
 Where will it appear in the UI?
 What data is needed?
 What are the edge cases?
 What are the dependencies?
Phase 2: Architecture Planning
 Data model changes needed?
 API or backend changes needed?
 UI components to create or modify?
 State management approach?
 Performance considerations?
 Security considerations?
Phase 3: Implementation Specification
**Files to Modify:**
1. `path/to/file` - [Specific changes]

**Data Structures:**
[Define new or modified data structures]

**Functions/Methods:**
[List new functions with signatures]

**UI Changes:**
[Describe UI modifications]

**Testing Plan:**
[How to verify it works]

Phase 4: Implementation
 Implement backend/data layer first
 Then implement UI layer
 Test each layer independently
 Test integration
Phase 5: Quality Assurance
 Test with real data
 Test edge cases
 Test error conditions
 Verify backward compatibility
 Check performance
 Review code quality
Phase 6: Documentation
 Update user-facing documentation
 Update developer documentation
 Document any new patterns or conventions
 Update changelog
🚨 Problem-Solving Protocol
When You Hit a Blocker:
Step 1: Define the Problem
What exactly is failing?
What error messages appear?
What was expected vs. what happened?
Can you reproduce it consistently?
Step 2: Gather Information
Review relevant code
Check documentation
Search for similar issues
Test in isolation
Step 3: Generate Solutions
Brainstorm 3+ possible approaches
Evaluate pros/cons of each
Consider short-term vs. long-term implications
Identify the pragmatic solution
Step 4: Decide
If solution is clear: Implement it
If multiple good options: Pick the simplest
If no good solution exists: Pivot or defer
Step 5: Document
Record the problem
Document the solution chosen
Explain why (for future reference)
Note any trade-offs made
GOAT Mode Decision Framework:
Is this blocking critical functionality?
├─ YES → Find pragmatic solution NOW
│         (Perfect is the enemy of shipped)
└─ NO → Can we defer this?
          ├─ YES → Add to backlog, ship without it
          └─ NO → Allocate time to solve properly

🔧 Project-Specific Customization
How to Use This SOP:
Copy this entire document to your project repository
Add a "Project Context" section at the top with:
Project name and mission
Tech stack and dependencies
Key architectural decisions
Current status and known limitations
Customize the Quality Standards section with:
Project-specific conventions
Required testing procedures
Deployment checklist
Add a "Common Patterns" section with:
Code examples from your project
Naming conventions
File structure guidelines
Example Project Context Section:
## 📦 Project Context: [Your Project Name]

### Mission
[What problem does this project solve? Who is it for?]

### Tech Stack
- **Frontend:** [e.g., React, Vue, vanilla JS]
- **Backend:** [e.g., Node.js, Python, serverless]
- **Database:** [e.g., PostgreSQL, MongoDB, localStorage]
- **Deployment:** [e.g., Vercel, AWS, Chrome Web Store]

### Key Architectural Decisions
1. [Decision 1 and rationale]
2. [Decision 2 and rationale]

### Current Status
- **Version:** [e.g., v1.2.0]
- **Stage:** [e.g., Beta, Production]
- **Known Limitations:** [List any current constraints]

### File Structure


/project-root /src /components /utils /tests /docs

🎓 Lessons Learned Template
Document Your Journey:

After completing major features or solving difficult problems, add entries here:

### [Date] - [Feature/Problem Name]

**Challenge:**
[What was difficult?]

**Approaches Tried:**
1. [Approach 1] - [Why it didn't work]
2. [Approach 2] - [Why it didn't work]
3. [Approach 3] - [Why it worked]

**Final Solution:**
[What you implemented]

**Key Learnings:**
- [Learning 1]
- [Learning 2]

**Would Do Differently:**
[Hindsight insights]

✅ Pre-Commit Checklist

Before committing any code:

 Code runs without errors
 All tests pass (if applicable)
 No debug code left behind (console.log, etc.)
 Code follows project conventions
 Comments added for complex logic
 Backward compatibility verified
 Edge cases tested
 Commit message is clear and descriptive
🚀 Deployment Checklist

Before deploying to production:

 All features tested in development
 Edge cases and error states verified
 Performance tested with realistic data
 Security review completed
 Documentation updated
 Changelog updated
 Rollback plan prepared
 Monitoring/logging in place
💡 GOAT Mode Mantras

Remember these principles:

"Ship working software" - Done is better than perfect
"Measure twice, cut once" - Planning prevents rework
"Trust the partnership" - Claude + Minimax = GOAT
"Pragmatic over perfect" - Solve real problems, not theoretical ones
"Quality is non-negotiable" - But scope is flexible
"Document decisions" - Future you will thank present you
"Test with real data" - Edge cases hide in production
"Fail fast, learn faster" - Blockers are learning opportunities

This SOP is a living document. Update it as you learn and grow.
