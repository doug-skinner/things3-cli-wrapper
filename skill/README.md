# Things3 CLI Wrapper - Claude Skill

A comprehensive Claude Skill that teaches Claude Code how to effectively use the `thangs` CLI tool for managing Things 3 tasks, projects, and areas.

## Overview

This skill enables Claude to help users manage their Things 3 tasks through natural language by using the `thangs` command-line interface. Claude can list tasks, create new items, update existing ones, and organize work into projects and areas.

## Skill Structure

This skill follows Anthropic's comprehensive skill pattern:

- **SKILL.md** - Main skill file with progressive disclosure (400-500 lines)
  - Overview and core concepts
  - Decision trees for command selection
  - Common workflows (basic → intermediate → advanced)
  - Progressive disclosure pattern: references detailed documentation

- **reference.md** - Complete CLI command reference
  - Detailed documentation for all 7 commands
  - Every flag, option, and validation rule
  - Output formats and error cases
  - AppleScript behavior notes

- **examples.md** - Real-world usage examples
  - 24 practical workflow examples
  - Daily task management to advanced scripting
  - Copy-pasteable commands with expected outputs
  - Error handling scenarios

- **LICENSE.txt** - MIT License

- **README.md** - This file (skill developer documentation)

## For End Users

### Installation

After installing the `thangs` CLI tool globally:

```bash
npm install -g @dougskinner/thangs
```

Install this skill using the built-in install command:

```bash
thangs install-skill
```

This copies the skill files to `~/.claude/skills/things3-cli-wrapper/` where Claude Code can load them.

### Updating the Skill

To update the skill after CLI updates:

```bash
thangs install-skill --force
```

### Verification

After installation, verify the skill files are present:

```bash
ls ~/.claude/skills/things3-cli-wrapper/
```

You should see:
```
SKILL.md
reference.md
examples.md
LICENSE.txt
README.md
```

## For Developers

### Developer Testing Workflow

When modifying or improving the skill, follow this iterative testing workflow:

1. **Make Changes**: Edit skill files in the `skill/` directory
   - Modify `SKILL.md` for core concepts, decision trees, or workflows
   - Update `reference.md` when CLI commands or flags change
   - Add examples to `examples.md` for new usage patterns

2. **Install to Claude**: Run the install command with force flag

   ```bash
   thangs install-skill --force
   ```

   This overwrites `~/.claude/skills/things3-cli-wrapper/` with your local changes.

3. **Test with Claude Code**: Open Claude Code and ask task management questions
   - Try natural language requests: "Show my tasks for today"
   - Test edge cases: "Add a task with multiple tags"
   - Verify error handling: "Complete a task that doesn't exist"

4. **Observe Behavior**: Watch how Claude interprets your requests
   - Does Claude choose the correct command?
   - Are the flags and options used correctly?
   - Does Claude handle ambiguous requests appropriately?

5. **Iterate**: Based on Claude's behavior, refine the skill content
   - Add decision tree guidance if Claude chooses wrong commands
   - Clarify examples if Claude misunderstands options
   - Add workflow patterns if Claude struggles with multi-step tasks

### Skill Design Principles

This skill follows key design principles for effective Claude Code skills:

#### Progressive Disclosure

- **SKILL.md stays under 500 lines**: Core concepts and quick reference only
- **References detailed docs**: Links to `reference.md` and `examples.md` for details
- **Layered information**: Overview → decision trees → workflows → examples
- **Why**: Keeps token usage low while maintaining comprehensive coverage

#### Decision Trees

- **Command selection guidance**: Help Claude map user intent to correct commands
- **Filter selection logic**: When to use --list vs --project vs --area
- **Error handling paths**: What to do when tasks are ambiguous or missing
- **Why**: Reduces Claude's decision overhead and improves accuracy

#### Workflow-Oriented

- **Teach patterns, not just syntax**: Show how commands combine for common tasks
- **Real-world scenarios**: Daily reviews, project planning, task organization
- **Progressive complexity**: Basic → intermediate → advanced workflows
- **Why**: Claude learns problem-solving approaches, not just command execution

#### CLI Integration

- **Actual command syntax**: Use exact flag names from Commander.js definitions
- **Real error messages**: Document actual error text from the CLI
- **JSON output format**: Show real JSON structures from `--json` flag
- **Why**: Ensures skill matches actual CLI behavior exactly

### Architecture: How Claude Uses the Skill

When you ask Claude Code a task management question:

1. **Skill Loading**: Claude loads SKILL.md when initialized with the skill
2. **Intent Recognition**: Claude analyzes your natural language request
3. **Decision Tree Navigation**: Claude follows decision trees to select commands
4. **Command Construction**: Claude builds the appropriate `thangs` command
5. **Execution**: Claude runs the command using the Bash tool
6. **Response Formatting**: Claude interprets output and responds in natural language

**Example Flow:**
```
User: "Show me tasks due today in my Work project"
  ↓
Claude reads SKILL.md → recognizes list command pattern
  ↓
Decision tree: user wants filtering → use --list and --project
  ↓
Constructs: thangs list --list "Today" --project "Work"
  ↓
Executes via Bash tool
  ↓
Formats output for user: "Here are your Work tasks due today..."
```

### Updating Skill Content

When you add new CLI commands or modify existing ones:

1. **Update reference.md first**
   - Document the new command completely
   - Include all flags, options, and validation rules
   - Add error cases and output formats
   - Show JSON output structure

2. **Add examples to examples.md**
   - Create 2-3 realistic usage scenarios
   - Show expected output
   - Include edge cases and error handling

3. **Update SKILL.md decision trees**
   - Add the new command to relevant decision trees
   - Update workflow sections if the command enables new patterns
   - Keep SKILL.md under 500 lines (move details to reference.md)

4. **Test the complete flow**
   - Install skill with `--force`
   - Ask Claude to use the new command naturally
   - Verify Claude understands when to use it
   - Check that Claude constructs correct command syntax

### Contributing to the Skill

Contributions that improve Claude's understanding are welcome:

#### Good Contributions

- **Additional workflow examples**: Real-world task management patterns
- **Improved decision trees**: Better command selection logic
- **Error handling guidance**: Help Claude handle edge cases
- **Clearer examples**: More intuitive usage scenarios
- **Bug fixes**: Corrections to incorrect command syntax or behavior

#### Before Contributing

- Test your changes with Claude Code following the testing workflow above
- Ensure SKILL.md stays under 500 lines
- Keep progressive disclosure pattern (overview in SKILL.md, details in reference.md)
- Use exact CLI syntax from the actual implementation
- Include realistic examples with expected output

#### Pull Request Guidelines

1. Describe what problem your change solves
2. Show before/after examples of Claude's behavior
3. Verify all skill files are updated consistently
4. Test with multiple natural language phrasings
5. Document any new patterns or workflows

### Additional Resources

- **Anthropic Skill Guidelines**: <https://docs.anthropic.com/claude/docs/skills> (when available)
- **Things 3 AppleScript Dictionary**: <https://culturedcode.com/things/support/articles/4562654>
- **Commander.js Documentation**: <https://github.com/tj/commander.js>
- **Main Repository**: <https://github.com/dougskinner/things3-cli-wrapper>

## License

MIT License - See LICENSE.txt for details
