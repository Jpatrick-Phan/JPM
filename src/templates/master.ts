export const MASTER_TEMPLATE = `# JPM Master Configuration & Rules

> This file dictates the technical and design standards for this project.
> All AI-generated Artifacts (PRDs, Epics, Tasks) MUST strictly adhere to these rules.

## 1. Technology Stack
- **Frontend**: [e.g. Next.js 14, TypeScript, TailwindCSS]
- **Backend**: [e.g. Node.js, NestJS, PostgreSQL]
- **State Management**: [e.g. Zustand, React Query]
- **Testing**: [e.g. Jest, Cypress]

## 2. Design System & UI/UX
- **Design Philosophy**: [e.g. Glassmorphism, Minimalist]
- **Primary Color**: [e.g. #7C3AED (Violet)]
- **Secondary Color**: [e.g. #EC4899 (Pink)]
- **Font**: [e.g. Inter, Roboto]
- **Components**: [e.g. Shadcn/UI, Material UI]

## 3. Coding Standards (Strict)
- **Naming Conventions**:
    - Variables/Functions: camelCase
    - Files: kebab-case
    - Components: PascalCase
    - Interfaces: IPrepend (e.g. IUser)
- **Structure**:
    - \`src/components/\`: Reusable UI
    - \`src/features/\`: Feature-based modules
- **Error Handling**: Use custom AppError class. Do not throw raw errors.

## 4. API Specification
- **Format**: RESTful JSON
- **Response Shape**: \`{ status: "success", data: T }\`
- **Auth**: Bearer JWT in Authorization header

## 5. Workflow Constraints
- **Parallelism**: Tasks should be atomic and independent where possible.
- **Testing**: Every task must include a test file creation step.
- **Documentation**: All public functions must have JSDoc.
`;
