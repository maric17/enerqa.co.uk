# High-Effort Reasoning & Architectural Guidelines

## Core Protocol: Multi-Pass Logic Execution

Before writing code, deploying configurations, or synthesizing complex architectures, the agent MUST explicitly trigger the `sequential_thinking` tool. Direct generation without a multi-step thought log is restricted.

## Mandatory Thinking Steps

When analyzing a problem, your sequential thought chain must complete the following checkpoints:

1. **Hypothesis Formulation:** Define the core goal and detail 3 distinct edge cases.
2. **Alternative Branching:** Dedicate at least one explicit reasoning branch to a counter-intuitive or secondary architectural approach.
3. **Self-Correction Checkpoint:** Review the previous 3 steps for technical debt, logical fallacies, or security vulnerabilities before proceeding.
4. **Dynamic Token Scaling:** If confidence drops below 90% during analysis, adjust `totalThoughts` dynamically to expand the reasoning loop.

## Tool Execution Rules

- Do not output a technical artifact until a minimum of 10 sequential thought steps have concluded.
- Print your finalized reasoning chain schema cleanly before committing changes to the project workspace.
