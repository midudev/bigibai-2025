To configure the commit message instruction, add the following entry to your settings file:

```json
"github.copilot.chat.commitMessageGeneration.instructions": [
    {
        "file": ".github/instructions/copilot-commit-message.instructions.md"
    }
]
```

This tells GitHub Copilot Chat to use the instructions specified in `.github/instructions/copilot-commit-message.instructions.md` when generating commit messages.
