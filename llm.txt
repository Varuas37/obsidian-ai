# Obsidian AI Assistant Plugin

## Overview
A generic AI assistant plugin for Obsidian that integrates with any CLI-based LLM tool. Users can ask questions inline and trigger AI workflows via hotkeys. The plugin is designed to be LLM-agnostic and works with any command-line AI tool.

## Core Functionality

### 1. Inline Question Answering
- **Trigger**: Type `{keyword} {question}{suffix}` (default: `ai what should I do??`)
- **Behavior**: 
  - Detects questions in markdown files
  - Shows "Thinking..." placeholder
  - Calls configured CLI tool with context
  - Replaces with AI response in collapsible callout format
  - Removes trigger suffix to prevent re-triggering

### 2. Hotkey Workflow
- **Trigger**: User-configured hotkey (Command Palette: "Trigger AI Assistant")
- **Behavior**:
  - Looks for `prompt.md` in current folder
  - If not found, shows helpful message
  - If found, processes file with prompt + full context
  - Shows "Started workflow..." status
  - Replaces with AI response in callout format

### 3. Context Awareness
The plugin provides rich context to the AI:
- Vault name and path
- Current folder and file path
- File size
- Main folder structure (up to 50 folders)
- Full current file content
- Safety rules (prevents destructive actions without confirmation)

## File Structure

```
obsidian-ai-assistant/
├── main.js              # Compiled plugin code (THIS IS WHAT RUNS)
├── main.ts              # TypeScript source (for reference/rebuilding)
├── manifest.json        # Plugin metadata
├── data.json            # User settings storage
├── package.json         # Node dependencies
├── tsconfig.json        # TypeScript config
├── esbuild.config.mjs   # Build configuration
└── llm.txt              # This file
```

## Key Components

### Settings (DEFAULT_SETTINGS)
```javascript
{
  reviewDirectory: "99-System/Archive/ai-reviews",  // Unused, legacy
  watchedFolders: [...],                            // Unused, legacy
  kiroCliPath: "ai-cli",                            // Path to CLI tool
  enableNotifications: true,                        // Show completion notices
  triggerKeyword: "ai",                             // Question trigger word
  questionSuffix: "??"                              // Question trigger suffix
}
```

### Main Plugin Class (KiroReviewPlugin)
- `processing`: Set to track files being processed (prevents double-processing)
- `onload()`: Registers command and file modification listener
- `checkForTrigger()`: Detects question patterns in modified files
- `triggerAssistant()`: Handles hotkey workflow
- `answerQuestion()`: Processes inline questions
- `performReview()`: Executes AI workflow with prompt
- `getPrompt()`: Loads prompt.md from current folder

### Event Flow

**Question Flow:**
1. User types `ai what should I do??`
2. File modification triggers `checkForTrigger()`
3. Regex detects question pattern
4. Removes `??` suffix immediately (prevents re-trigger)
5. Adds "Thinking..." placeholder
6. Calls CLI: `echo "{prompt}" | {cli-path} chat --non-interactive --trust-all-tools`
7. Cleans ANSI codes and formatting from output
8. Replaces "Thinking..." with callout-formatted response

**Hotkey Flow:**
1. User presses hotkey
2. Checks for `prompt.md` in current folder
3. If missing, shows help message
4. If found, adds "Started workflow..." status
5. Builds full prompt with context + user prompt + file content
6. Calls CLI tool
7. Removes status message
8. Adds callout-formatted response

## CLI Integration

### Command Format
```bash
echo "{prompt}" | {cli-path} chat --non-interactive --trust-all-tools
```

### Flags
- `--non-interactive`: Prevents interactive prompts
- `--trust-all-tools`: Auto-approves tool usage

### Output Cleaning
The plugin strips:
- ANSI escape codes: `\x1b\[[0-9;]*m`
- Streaming markers: `\d+m> ?m`
- Color codes: `\[38;5;\d+m`, `\[0m`
- Leading blockquotes: `^>\s*`

## Response Formatting

### Callout Format
```markdown
> [!ai]+ AI Assistant
> Response line 1
> Response line 2
```

Benefits:
- Collapsible by default (expanded with `+`)
- Renders markdown properly
- Visually distinct
- Native Obsidian styling

## Making Changes

### To Change CLI Tool
1. Update `kiroCliPath` setting in plugin settings
2. Ensure tool accepts stdin and outputs to stdout
3. Ensure tool supports `--non-interactive` and `--trust-all-tools` flags (or modify command in code)

### To Modify Prompts
Edit the prompt construction in:
- `answerQuestion()` for inline questions
- `performReview()` for hotkey workflow

### To Change Trigger Pattern
1. Modify `triggerKeyword` and `questionSuffix` settings
2. Regex pattern: `${keyword} (.+?)${suffix}`

### To Add Features
- Keep it generic and LLM-agnostic
- Don't hardcode specific AI tool names
- Maintain the context structure
- Preserve safety rules in prompts

## Important Considerations

### Preventing Double-Processing
- Use `processing` Set to track active operations
- Remove trigger suffix immediately after detection
- Check for existing responses before re-processing

### Context Size
- Limit folder list to 50 to avoid token bloat
- Don't include all files, just folder structure
- Full file content is included (user's responsibility to manage size)

### Safety
- Always include safety rules in prompts
- Warn about destructive actions
- Use `--trust-all-tools` carefully (user must trust their CLI tool)

### Performance
- File modifications trigger checks (can be frequent)
- Use `processing` Set to prevent concurrent operations
- Log execution time for debugging

## Debugging

### Console Logs
- "Obsidian AI Assistant loaded"
- "File modified: {path}"
- "Question found: {question}"
- "=== AI Assistant Workflow Started ==="
- "Executing CLI, input length: X"
- "CLI completed in Xs, output length: Y"
- "=== AI Assistant Workflow Completed ==="

### Common Issues
1. **"Already in progress"**: Previous operation didn't complete, check console for errors
2. **No response**: Check CLI tool path in settings, verify tool is installed
3. **Malformed output**: Check output cleaning regex, may need adjustment for different tools
4. **Re-triggering**: Ensure suffix is removed, check regex pattern

## Legacy/Unused Code
- `reviewDirectory`: Originally for separate review files, now unused
- `watchedFolders`: Originally for auto-review, now unused
- Can be removed in future cleanup

## Future Enhancements
- Custom callout types per folder
- Streaming responses (requires different approach)
- Multiple CLI tool profiles
- Response templates
- Conversation history
- Rate limiting/throttling

## Philosophy
This plugin is intentionally generic and LLM-agnostic. It's a bridge between Obsidian and any CLI-based AI tool. Keep it simple, keep it flexible, keep it tool-agnostic.
