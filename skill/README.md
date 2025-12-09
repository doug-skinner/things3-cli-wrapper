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

This section will be expanded in Requirement 17 with:
- Complete developer testing workflow
- Skill design principles explanation
- Architecture documentation
- Contribution guidelines
- Links to Anthropic skill guidelines

### Quick Developer Testing

1. Make changes to skill files in this directory
2. Run: `thangs install-skill --force`
3. Test with Claude Code by asking task management questions
4. Observe Claude's responses and command choices
5. Iterate on skill content based on behavior

## Skill Design Principles

- **Progressive Disclosure**: SKILL.md stays under 500 lines, references detailed docs
- **Decision Trees**: Help Claude choose the right command for user intent
- **Workflow-Oriented**: Teach patterns and workflows, not just command syntax
- **Real Examples**: Use actual CLI patterns and realistic scenarios

## License

MIT License - See LICENSE.txt for details
