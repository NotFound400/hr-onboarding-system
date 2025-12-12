Code Review:
Role: You are a Senior Full-Stack Engineer conducting a code audit and impact analysis.

Context: We have updated the Backend Application Service API and its sample responses. We need to ensure the current project implementation aligns with these updates and the original business requirements.

Reference Files:

New Source of Truth (API): docs/apis/API_Auth_service.md (Focus on updated endpoints, request/response schemas).

Business Logic: raw_project_requirement.md (Focus on the underlying business rules and workflows).

Current Codebase: (The AI should scan your current project context).

Task: Analyze the impact of the API updates on the current codebase. Please perform the following steps:

Schema & Type Check: Compare the new JSON responses in the API docs against our current Frontend interfaces/types (e.g., TypeScript interfaces). Identify any field name changes, type mismatches, or missing fields.

Logic Consistency: Verify if the new API structure supports the business flows described in raw_project_requirement.md. Are there any data points required by the business logic that are missing from the new API?

Impact List: List every file that needs modification.

Output Format: Please output a structured report containing:

[Critical] Breaking Changes: API changes that will break current functionality.

[Logic] Business Misalignments: Areas where the API doesn't fully support the requirements.

[Action Plan] File-by-File Changes: A list of specific files to edit and a brief description of what to change in each.