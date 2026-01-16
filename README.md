# Obsidian AI Assistant

A generic AI assistant plugin for Obsidian that works with any CLI-based LLM tool.

## Features

- **Inline Questions**: Ask questions anywhere with `ai what should I do??`
- **Hotkey Workflows**: Trigger AI analysis with custom prompts via hotkey
- **Context-Aware**: Provides vault structure and file context to AI
- **LLM-Agnostic**: Works with any CLI tool (Claude CLI, OpenAI CLI, Kiro CLI, etc.)
- **Safe**: Prevents destructive actions without confirmation

## Installation

### Manual Installation
1. Download the latest release
2. Extract to `.obsidian/plugins/obsidian-ai-assistant/`
3. Enable in Obsidian Settings → Community plugins
4. Configure CLI tool path in plugin settings

## Configuration

1. Go to **Settings → Obsidian AI Assistant**
2. Set **AI CLI path** to your CLI tool (find it with `which <cli-name>`)
3. Optionally customize:
   - **Trigger keyword** (default: `ai`)
   - **Question suffix** (default: `??`)

## Usage

### Inline Questions
Type `ai what should I do??` anywhere in your notes. The AI will answer inline between horizontal rules.

### Hotkey Workflow
1. Create `prompt.md` in your folder with instructions (e.g., "Summarize this daily note")
2. Set a hotkey in Settings → Hotkeys → "Trigger AI Assistant"
3. Press the hotkey to process your note with the prompt

## Example Prompts

**Daily Journal** (`01-Journal/Daily/prompt.md`):
```markdown
Analyze this daily journal entry and provide:
1. Day Summary (2-3 sentences)
2. Action Items (bullet list)
3. Standup Summary (what I did, what's next, blockers)
```

**Investigation** (`04-Investigations/prompt.md`):
```markdown
Review this investigation for:
- Timestamp mismatches
- Logical contradictions
- Missing steps
```

## CLI Tool Requirements

Your CLI tool must:
- Accept input via stdin
- Output to stdout
- Support `--non-interactive` flag
- Support `--trust-all-tools` flag (optional, for tool usage)

Example command format:
```bash
echo "prompt" | your-cli chat --non-interactive --trust-all-tools
```

## Documentation

See [llm.txt](llm.txt) for complete technical documentation and architecture details.

## License

MIT

## Author

Saurav Panthee (saurav.panthee@gmail.com)
