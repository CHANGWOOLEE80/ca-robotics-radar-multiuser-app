# GitHub Copilot Repository Instructions

## Project Context

This repository is for the CA Robotics Radar Multiuser App.

The application is a prototype platform for identifying, organizing, comparing, and tracking robotics and automation technologies that can improve productivity in EPC construction projects.

The target users are:
- Advanced Construction Technology Group
- Construction execution team
- Quality audit team
- Field construction team
- Automation and robotics initiative members
- Management reviewers

## Business Purpose

The purpose of this project is to support practical AI Agent-based work improvement.

The application should help users:
- Collect robotics and automation technology ideas
- Compare technology candidates
- Organize vendor and technology information
- Review productivity improvement opportunities
- Track action items and follow-up status
- Support management-level review
- Identify work processes that can be converted into AI Agents or simple digital tools

## Development Principles

When generating or modifying code, follow these principles:

- Keep the application simple and practical.
- Prioritize business usability over technical complexity.
- Use clear names that non-developers can understand.
- Separate business logic from UI rendering where possible.
- Avoid unnecessary dependencies.
- Do not include confidential company data.
- Use sample data only during the prototype stage.
- Write maintainable and readable code.
- Add comments for important business logic.
- Preserve existing working functions unless a change is explicitly required.

## Security Rules

Never add or expose the following information:

- Actual project cost data
- Vendor confidential quotations
- Client information
- Contract information
- Internal approval documents
- Personal information
- Company-restricted technical documents
- Internal server credentials
- API keys
- Passwords
- Access tokens

If sample data is needed, use fictional or publicly shareable data only.

## Application Direction

The application should support the following functions or future extensions:

- Robotics and automation technology radar
- Vendor technology database
- Productivity improvement idea management
- Field applicability screening
- ROI and payback comparison
- Deployment risk review
- Technology readiness evaluation
- Action item tracking
- Comment and review workflow
- Management dashboard
- CSV or Excel export
- AI Agent candidate management

## UI and UX Principles

The user interface should be understandable for EPC business users.

Use:
- Clear page titles
- Simple navigation
- Dashboard-style summaries
- Tables for comparison
- Status indicators
- Management-friendly terminology

Avoid:
- Developer jargon
- Overly complex screens
- Hidden calculation assumptions
- Unclear labels
- Excessive visual effects that reduce readability

## Documentation Rules

When adding new functions, update documentation when needed.

Documentation should explain:
- What the function does
- Why it is needed
- How to use it
- What assumptions are applied
- What data should not be entered

## Testing and Validation

Before completing a change, check the following:

- The application starts without error.
- Existing functions still work.
- Sample data loads correctly.
- Multi-user or data persistence behavior is not broken.
- No confidential information is added.
- README remains consistent with the current project direction.

## Preferred Work Style

For each improvement, prefer this workflow:

1. Understand the business need.
2. Identify the smallest useful change.
3. Implement the change.
4. Test the main user flow.
5. Update documentation if required.
6. Summarize what changed and what should be checked next.
