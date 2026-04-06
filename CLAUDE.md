# Dynamic Form Builder - Project Standards

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form, Zod
- **Backend**: Java 17+, Spring Boot 3, Spring Data JPA, Maven, H2 (dev) / PostgreSQL (prod)
- **API**: RESTful at `http://localhost:8080/api/v1/`
- **Frontend Dev Server**: `http://localhost:3000`

## Project Structure
```
frontend/          # Next.js app
backend/           # Spring Boot app
docs/
  architecture/    # System design, API contracts, data models, task breakdowns
  market-research/ # Competitive analysis, user stories
  qa/              # Test reports
  security/        # Security audit reports
```

## UI Quality Standards
All frontend work must deliver **polished, production-quality UI** — not just "functional scaffolding."

- Use shadcn/ui components exclusively for standard UI elements
- Follow the typography hierarchy and spacing system defined in the frontend agent config
- Every page must handle: loading (Skeleton), empty (icon + message + CTA), error (message + retry), and populated states
- Always verify UI visually with `npm run dev` before considering work complete
- Reference shadcn/ui examples at https://ui.shadcn.com for component patterns
- Use lucide-react for all icons

## API Contract
The source of truth for frontend-backend integration is `docs/architecture/api-contracts.md`. Both teams must follow this exactly.

## Development Workflow
1. **Design first** — Use `design-page` or `design-style-guide` skills before implementing complex UI
2. **Implement** — Follow architecture docs and API contracts
3. **Verify** — Run `npm run build` (frontend) or `mvn test` (backend) before delivering
4. **Test** — QA tester verifies, security auditor checks vulnerabilities

## Code Quality
- Frontend: TypeScript strict mode, no `any` types, all components must have `'use client'` if they use hooks/event handlers
- Backend: Bean Validation on all DTOs, proper error handling via @ControllerAdvice, unit tests for service layer
- Both: Follow the API contracts exactly, handle edge cases, no hardcoded values
