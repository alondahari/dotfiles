---
name: pr-creator
description: Create a pull request on GitHub
---

Create a markdown file in the current folder with a PR description based on the following guidelines:
- Examine the changes on the current branch vs the base branch (usually main or master).
- Check if the repo has a PR template to follow, if so use it. Don't drop any comments from the template.
- Be concise, don't repeat yourself.
- If the prompts in the template ask for a simple yes/no, don't elaborate unless necessary.
- If you're unsure about any part of the PR or how to fill out the template, leave that section untouched for human review.
- Focus on the big picture of the changes, avoid getting bogged down in minor implementation details.
- Always describe the changes from the main branch, not from the previous commit.
