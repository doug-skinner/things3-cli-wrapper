# Things3 CLI - Usage Examples

This document provides real-world usage examples and workflows for the `thangs` CLI tool. All examples are copy-pasteable and include expected outputs.

## Table of Contents

- [Daily Task Management](#daily-task-management)
- [Project Planning Workflows](#project-planning-workflows)
- [Area-Based Organization](#area-based-organization)
- [Advanced Filtering and Search](#advanced-filtering-and-search)
- [Task Lifecycle Management](#task-lifecycle-management)
- [Scripting with JSON Output](#scripting-with-json-output)
- [Error Handling Scenarios](#error-handling-scenarios)
- [Team Collaboration Workflows](#team-collaboration-workflows)

---

## Daily Task Management

### Example 1: Morning Task Review

**Scenario:** Start your day by reviewing what's on your plate.

```bash
# See all tasks due today
thangs list --list Today
```

**Expected output:**
```
┌────────────────────────────┬─────────────────┬────────┬─────────┬────────────┐
│ Task                       │ Project         │ Area   │ Tags    │ Due Date   │
├────────────────────────────┼─────────────────┼────────┼─────────┼────────────┤
│ Morning standup            │ Sprint Planning │ Work   │ routine │ 2025-12-09 │
│ Review pull requests       │ Development     │ Work   │ code    │ 2025-12-09 │
│ Schedule dentist           │ -               │ Health │ phone   │ 2025-12-09 │
└────────────────────────────┴─────────────────┴────────┴─────────┴────────────┘
```

```bash
# Complete your first task
thangs complete "Morning standup"
```

**Expected output:**
```
Task completed: Morning standup
```

### Example 2: Quick Task Capture During the Day

**Scenario:** Capture tasks as they come up without breaking focus.

```bash
# Quick capture to Inbox
thangs add "Email John about contract"

# Capture with context
thangs add "Call dentist to reschedule" --tags phone,personal

# Capture with due date
thangs add "Submit expense report" --due 2025-12-15 --tags urgent
```

**Expected output:**
```
Task created: Email John about contract
Task created: Call dentist to reschedule
Task created: Submit expense report
```

### Example 3: End-of-Day Review

**Scenario:** Review what you accomplished and plan for tomorrow.

```bash
# Check what's still open for today
thangs list --list Today

# Move unfinished tasks to tomorrow
thangs edit "Review pull requests" --due 2025-12-10

# Add tomorrow's priority task
thangs add "Prepare presentation for client" --due 2025-12-10 --tags high-priority

# Check tomorrow's slate
thangs list --list Upcoming
```

---

## Project Planning Workflows

### Example 4: Starting a New Project

**Scenario:** Kick off a website redesign project.

```bash
# Create project within Work area
thangs add-project "Website Redesign" \
  --area Work \
  --deadline 2025-03-31 \
  --notes "Mobile-first redesign of company website"
```

**Expected output:**
```
Project created: Website Redesign
```

```bash
# Add initial planning tasks
thangs add "Research competitor websites" \
  --project "Website Redesign" \
  --tags research

thangs add "Create wireframes" \
  --project "Website Redesign" \
  --due 2025-12-20

thangs add "Design mockups" \
  --project "Website Redesign" \
  --due 2025-01-10 \
  --tags design

thangs add "Review designs with stakeholders" \
  --project "Website Redesign" \
  --due 2025-01-15
```

```bash
# View all project tasks
thangs list --project "Website Redesign"
```

**Expected output:**
```
┌──────────────────────────────────┬──────────────────┬──────┬──────────┬────────────┐
│ Task                             │ Project          │ Area │ Tags     │ Due Date   │
├──────────────────────────────────┼──────────────────┼──────┼──────────┼────────────┤
│ Research competitor websites     │ Website Redesign │ Work │ research │ -          │
│ Create wireframes                │ Website Redesign │ Work │ -        │ 2025-12-20 │
│ Design mockups                   │ Website Redesign │ Work │ design   │ 2025-01-10 │
│ Review designs with stakeholders │ Website Redesign │ Work │ -        │ 2025-01-15 │
└──────────────────────────────────┴──────────────────┴──────┴──────────┴────────────┘
```

### Example 5: Managing Project Milestones

**Scenario:** Track progress through a project with phases.

```bash
# Add phase 1 tasks
thangs add "Phase 1: Research & Planning" \
  --project "Website Redesign" \
  --tags milestone

thangs add "Gather requirements from stakeholders" \
  --project "Website Redesign" \
  --notes "Schedule meetings with Marketing and Sales"

thangs add "Analyze current site analytics" \
  --project "Website Redesign"

# Complete phase 1 tasks
thangs complete "Gather requirements from stakeholders"
thangs complete "Analyze current site analytics"
thangs complete "Phase 1: Research & Planning"

# Add phase 2 tasks
thangs add "Phase 2: Design" \
  --project "Website Redesign" \
  --tags milestone

thangs add "Create design system" \
  --project "Website Redesign" \
  --due 2025-01-05
```

### Example 6: Moving Tasks Between Projects

**Scenario:** Reorganize tasks as project scope evolves.

```bash
# Task was in wrong project
thangs edit "Update footer links" --project "Website Redesign"

# Task needs to move to new project
thangs edit "Implement payment gateway" --project "E-commerce Integration"

# Check the task moved successfully
thangs list --project "E-commerce Integration"
```

---

## Area-Based Organization

### Example 7: Setting Up Life Areas

**Scenario:** Organize your life into major domains.

```bash
# Create main life areas
thangs add-area "Work"
thangs add-area "Personal"
thangs add-area "Health"
thangs add-area "Learning"
thangs add-area "Finance"
```

**Expected output:**
```
Area created: Work
Area created: Personal
Area created: Health
Area created: Learning
Area created: Finance
```

```bash
# Add tasks directly to areas (for non-project work)
thangs add "Schedule annual physical" --area Health
thangs add "Learn TypeScript generics" --area Learning
thangs add "Pay credit card bill" --area Finance --due 2025-12-15
thangs add "Call mom" --area Personal --tags family
```

### Example 8: Work/Life Balance Review

**Scenario:** Check how tasks are distributed across life areas.

```bash
# Review work tasks
thangs list --area Work

# Review personal tasks
thangs list --area Personal

# Review health tasks
thangs list --area Health

# Or get JSON for analysis
thangs list --area Work --json > work_tasks.json
thangs list --area Personal --json > personal_tasks.json
```

---

## Advanced Filtering and Search

### Example 9: Finding Urgent Tasks Across All Projects

**Scenario:** You have 30 minutes and want to knock out urgent items.

```bash
# Find all urgent tasks
thangs list --tag urgent
```

**Expected output:**
```
┌─────────────────────────────┬────────────────┬──────────┬────────────────┬────────────┐
│ Task                        │ Project        │ Area     │ Tags           │ Due Date   │
├─────────────────────────────┼────────────────┼──────────┼────────────────┼────────────┤
│ Submit expense report       │ -              │ Finance  │ urgent         │ 2025-12-15 │
│ Review contracts            │ Legal Review   │ Work     │ urgent,legal   │ 2025-12-12 │
│ Fix production bug          │ Development    │ Work     │ urgent,bug     │ 2025-12-09 │
└─────────────────────────────┴────────────────┴──────────┴────────────────┴────────────┘
```

```bash
# Find quick wins (tasks tagged as quick)
thangs list --tag quick-win

# Find tasks waiting on others
thangs list --tag waiting
```

### Example 10: Multi-Filter Task Search

**Scenario:** Find specific subset of tasks with multiple criteria.

```bash
# Today's work tasks
thangs list --list Today --area Work

# Upcoming personal tasks
thangs list --list Upcoming --area Personal

# All tasks in Marketing project with urgent tag
thangs list --project Marketing --json | jq '.[] | select(.tags | contains(["urgent"]))'
```

---

## Task Lifecycle Management

### Example 11: Task Progression from Creation to Completion

**Scenario:** Follow a task through its complete lifecycle.

```bash
# 1. Create initial task
thangs add "Write Q4 report"
```

**Output:** `Task created: Write Q4 report`

```bash
# 2. Add more details as you plan
thangs edit "Write Q4 report" \
  --notes "Include revenue, expenses, and forecast" \
  --project "Quarter-End Reporting" \
  --tags reporting,high-priority
```

**Output:** `Updated task: Write Q4 report`

```bash
# 3. Set due date when timeline becomes clear
thangs edit "Write Q4 report" --due 2025-12-20
```

**Output:** `Updated task: Write Q4 report - Changed due date to 2025-12-20`

```bash
# 4. Need to reschedule?
thangs edit "Write Q4 report" --due 2025-12-22
```

**Output:** `Updated task: Write Q4 report - Changed due date to 2025-12-22`

```bash
# 5. Complete the task
thangs complete "Write Q4 report"
```

**Output:** `Task completed: Write Q4 report`

### Example 12: Handling Task Cancellations

**Scenario:** Project scope changed, need to cancel some tasks.

```bash
# Project direction changed, cancel obsolete tasks
thangs cancel "Research competitor A"
thangs cancel "Interview users about feature X"

# Verify cancellations
thangs list --project "Cancelled Project"
```

**Expected output:**
```
No tasks found.
```

---

## Scripting with JSON Output

### Example 13: Automated Morning Report

**Scenario:** Generate a report of today's tasks and email it to yourself.

```bash
#!/bin/bash
# morning_report.sh

# Get today's tasks as JSON
TODAY_TASKS=$(thangs list --list Today --json)

# Count tasks
TASK_COUNT=$(echo "$TODAY_TASKS" | jq '. | length')

echo "Good morning! You have $TASK_COUNT tasks today:"
echo ""

# Format tasks for email
echo "$TODAY_TASKS" | jq -r '.[] | "- \(.name) (\(.project // "Inbox"))"'

# Could pipe this to mail or notification system
```

**Expected output:**
```
Good morning! You have 3 tasks today:

- Morning standup (Sprint Planning)
- Review pull requests (Development)
- Schedule dentist (Inbox)
```

### Example 14: Finding Overdue Tasks with jq

**Scenario:** Get a list of all overdue tasks.

```bash
# Get current date
TODAY=$(date +%Y-%m-%d)

# Find overdue tasks
thangs list --json | jq --arg today "$TODAY" \
  '.[] | select(.dueDate != null and .dueDate < $today) |
  {name: .name, dueDate: .dueDate, project: .project}'
```

**Expected output:**
```json
{
  "name": "Submit monthly report",
  "dueDate": "2025-12-05",
  "project": "Reporting"
}
{
  "name": "Review contracts",
  "dueDate": "2025-12-07",
  "project": "Legal"
}
```

### Example 15: Bulk Task Creation from File

**Scenario:** Create multiple tasks from a structured file.

```bash
# tasks.json
[
  {
    "name": "Research topic A",
    "project": "Research Project",
    "tags": "research,high-priority"
  },
  {
    "name": "Interview participant 1",
    "project": "Research Project",
    "due": "2025-12-15",
    "tags": "interview"
  },
  {
    "name": "Analyze results",
    "project": "Research Project",
    "due": "2025-12-20"
  }
]
```

```bash
#!/bin/bash
# bulk_create.sh

# Read tasks from JSON file and create each one
cat tasks.json | jq -c '.[]' | while read task; do
  name=$(echo "$task" | jq -r '.name')
  project=$(echo "$task" | jq -r '.project // empty')
  due=$(echo "$task" | jq -r '.due // empty')
  tags=$(echo "$task" | jq -r '.tags // empty')

  cmd="thangs add \"$name\""
  [ -n "$project" ] && cmd="$cmd --project \"$project\""
  [ -n "$due" ] && cmd="$cmd --due \"$due\""
  [ -n "$tags" ] && cmd="$cmd --tags \"$tags\""

  eval $cmd
done
```

---

## Error Handling Scenarios

### Example 16: Handling Duplicate Task Names

**Scenario:** You try to complete a task but multiple exist with same name.

```bash
# Attempt to complete task
thangs complete "Meeting"
```

**Expected error:**
```
Multiple tasks found with name "Meeting":
- "Meeting" (Project: Q1 Planning, Due: 2025-12-10)
- "Meeting" (Project: Weekly Sync, Due: 2025-12-11)

Please provide a unique task name or rename one of these tasks first.
```

**Solution:**
```bash
# Make names unique
thangs edit "Meeting" --name "Q1 Planning Meeting"  # First one found

# Now you can complete it
thangs complete "Q1 Planning Meeting"

# Rename the other one too
thangs list --project "Weekly Sync"
thangs edit "Meeting" --name "Weekly Sync Meeting"
```

### Example 17: Handling Missing Projects or Areas

**Scenario:** Try to assign task to non-existent project.

```bash
# Try to add task to non-existent project
thangs add "New task" --project "Nonexistent Project"
```

**Expected error:**
```
Project 'Nonexistent Project' not found
```

**Solution:**
```bash
# Create the project first
thangs add-project "Nonexistent Project" --area Work

# Now add the task
thangs add "New task" --project "Nonexistent Project"
```

**Output:**
```
Project created: Nonexistent Project
Task created: New task
```

### Example 18: Handling Invalid Date Formats

**Scenario:** Common date format mistakes.

```bash
# Wrong format: MM/DD/YYYY
thangs add "Task" --due 12/31/2025
```

**Expected error:**
```
Invalid date format. Use YYYY-MM-DD
```

```bash
# Wrong format: Month name
thangs add "Task" --due "December 31, 2025"
```

**Expected error:**
```
Invalid date format. Use YYYY-MM-DD
```

**Solution:**
```bash
# Correct format
thangs add "Task" --due 2025-12-31
```

**Output:**
```
Task created: Task
```

---

## Team Collaboration Workflows

### Example 19: Daily Standup Preparation

**Scenario:** Prepare for daily standup by reviewing your completed and in-progress work.

```bash
# What did I complete yesterday?
# (Assuming you completed tasks on 2025-12-08)
thangs list --json | jq '.[] | select(.modificationDate == "2025-12-08")' > yesterday.json

# What am I working on today?
thangs list --list Today --project "Sprint 42"

# What are my blockers? (tasks tagged as blocked)
thangs list --tag blocked --area Work
```

### Example 20: Sprint Planning

**Scenario:** Plan a 2-week sprint with your team.

```bash
# Create sprint project
thangs add-project "Sprint 42" \
  --area Work \
  --deadline 2025-12-22 \
  --notes "Focus: Authentication feature and bug fixes"

# Add user stories from backlog
thangs add "Implement OAuth login" \
  --project "Sprint 42" \
  --tags authentication,story \
  --notes "Support Google and GitHub providers"

thangs add "Add password reset flow" \
  --project "Sprint 42" \
  --tags authentication,story

thangs add "Fix session timeout bug" \
  --project "Sprint 42" \
  --tags bug,high-priority

# Break down stories into tasks
thangs add "Research OAuth libraries" \
  --project "Sprint 42" \
  --tags authentication,research

thangs add "Implement Google OAuth" \
  --project "Sprint 42" \
  --tags authentication \
  --due 2025-12-15

thangs add "Implement GitHub OAuth" \
  --project "Sprint 42" \
  --tags authentication \
  --due 2025-12-18

# View sprint backlog
thangs list --project "Sprint 42"
```

### Example 21: Delegating and Tracking External Dependencies

**Scenario:** Some tasks are waiting on others.

```bash
# Add task that's blocked on external input
thangs add "Finalize design" \
  --project "Website Redesign" \
  --tags waiting,design \
  --notes "Waiting on client feedback"

# Add task for following up
thangs add "Follow up on design feedback" \
  --project "Website Redesign" \
  --due 2025-12-12 \
  --tags follow-up

# Check all tasks waiting on external input
thangs list --tag waiting
```

---

## Advanced Workflow Examples

### Example 22: Weekly Review Process

**Scenario:** Review all areas of your life every week.

```bash
#!/bin/bash
# weekly_review.sh

echo "=== WEEKLY REVIEW ==="
echo ""

# Review each area
for area in "Work" "Personal" "Health" "Learning" "Finance"; do
  echo "Area: $area"
  thangs list --area "$area" --json | jq '. | length' | xargs echo "  Open tasks:"
  echo ""
done

# Check for overdue tasks
echo "Overdue tasks:"
TODAY=$(date +%Y-%m-%d)
thangs list --json | jq --arg today "$TODAY" \
  '[.[] | select(.dueDate != null and .dueDate < $today)] | length' | xargs echo "  Count:"
```

### Example 23: GTD-Style Next Actions

**Scenario:** Implement Getting Things Done methodology.

```bash
# Capture phase - collect everything
thangs add "Email John"
thangs add "Buy groceries"
thangs add "Research project management tools"

# Clarify phase - add context
thangs edit "Email John" --tags @computer,quick-win
thangs edit "Buy groceries" --tags @errands,personal
thangs edit "Research project management tools" --tags @computer,research

# Organize phase - assign to projects/areas
thangs edit "Research project management tools" --project "Process Improvement"

# Get next actions by context
thangs list --tag @computer    # Things to do at computer
thangs list --tag @errands     # Things to do while out
thangs list --tag quick-win    # Quick tasks (2 min rule)
```

### Example 24: Project Retrospective Data Collection

**Scenario:** Gather data for project retrospective.

```bash
#!/bin/bash
# project_retrospective.sh

PROJECT="Website Redesign"

echo "=== Project Retrospective: $PROJECT ==="
echo ""

# Get all tasks (completed and open)
ALL_TASKS=$(thangs list --project "$PROJECT" --json)

# Count total tasks
TOTAL=$(echo "$ALL_TASKS" | jq '. | length')
echo "Total tasks: $TOTAL"

# Count by tag
echo ""
echo "Tasks by tag:"
echo "$ALL_TASKS" | jq -r '.[].tags[]' | sort | uniq -c

# Find longest running tasks (assuming completion tracking)
echo ""
echo "High-priority items:"
echo "$ALL_TASKS" | jq -r '.[] | select(.tags | contains(["high-priority"])) | .name'
```

---

## Tips for Effective Usage

### Quick Wins

Use tags to identify quick tasks you can knock out in 5-10 minutes:
```bash
thangs add "Reply to email" --tags quick-win
thangs add "Update Jira ticket" --tags quick-win

# When you have spare time
thangs list --tag quick-win
```

### Waiting Lists

Track tasks that are blocked on external dependencies:
```bash
thangs add "Proceed with design" --tags waiting --notes "Waiting on client approval"
thangs list --tag waiting  # Review regularly
```

### Context-Based Organization

Use tags for contexts (@computer, @phone, @office, @home):
```bash
thangs add "Call insurance" --tags @phone
thangs add "Review code" --tags @computer
thangs list --tag @phone  # Filter by current context
```

### Energy-Level Tags

Tag tasks by energy required:
```bash
thangs add "Strategic planning" --tags high-energy,deep-work
thangs add "File expenses" --tags low-energy,admin
thangs list --tag low-energy  # For when you're tired
```
