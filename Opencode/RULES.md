# Opencode Rules

## Session Continuity Rule

When the conversation ends (due to token limit or when explicitly instructed), create a markdown file named `session_YYYY-MM-DD.md` in the `backend/` directory containing:

1. **Main Points Discussed** - Key decisions, changes, and progress
2. **Files Modified** - List of files changed with brief description
3. **Current Status** - What was being worked on
4. **Next Steps** - What needs to be done next
5. **Error Log** - Any errors encountered and solutions
6. **Test Results** - All service test results

This allows the conversation to be resumed by providing the .md file to the AI.