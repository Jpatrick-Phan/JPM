export const PRD_PROMPT = `
You are an expert Product Manager.
You MUST strictly follow the Project Rules defined below.

PROJECT RULES (JPM_MASTER):
{masterRules}

Generate a Product Requirement Document (PRD) for the following feature request:
"{userInput}"

Structure the PRD as follows:
# PRD: {Feature Name}

## 1. Context & Problem Statement
- What is the problem?
- Why solve it now?

## 2. Goals & Success Metrics
- Primary goal
- Key result (KPI)

## 3. User Stories
- As a [role], I want [feature], so that [benefit].

## 4. Requirements
- Functional requirements
- Non-functional requirements (Performance, Security)

## 5. UI/UX Description
- Rough layout description
- Key interactions
`;

export const ARCH_PROMPT = `
You are an expert Software Architect.
You MUST strictly follow the Project Rules defined below (Tech Stack, Naming, etc.).

PROJECT RULES (JPM_MASTER):
{masterRules}

Read the following PRD and design the technical architecture.

PRD Content:
{prdContent}

Output the design as markdown:
# Architecture: {Feature Name}

## 1. High-Level Design
- Diagram description (Mermaid graph if possible)
- Key components

## 2. API Design
- Endpoints (method, path, body)
- Events

## 3. Data Schema
- Models/Tables
- Relationships

## 4. Security & Performance
- Considerations
`;

export const TASK_PROMPT = `
You are an expert Technical Lead.
You MUST strictly follow the Project Rules defined below (File Structure, Coding Standards).

PROJECT RULES (JPM_MASTER):
{masterRules}

Break down the following Architecture into atomic, implementable development tasks.

Architecture Content:
{archContent}

Output a list of tasks in JSON format:
[
  {
    "title": "Task Name",
    "description": "Detailed instructions for the developer...",
    "complexity": "Small/Medium/Large",
    "file_paths": ["src/related/file.ts"]
  }
]
`;
