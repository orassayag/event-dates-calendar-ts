# Example Source Files

This directory contains example source files with dummy data to demonstrate the format and structure required for each script in the Event Dates Calendar application.

## Files Overview

### 1. event-dates-2025.txt
**Purpose**: Main calendar file containing all events, tasks, and important information for a specific year.

**Used by scripts**:
- `create` - Reads the previous year's file as a template
- `validate` - Validates and fixes formatting issues
- `sync` - Merges with archive data
- `search` - Searches for specific terms
- `stop-counter` - Removes counter events from specific dates

**Structure**:
- **Header sections** (with hashtag markers):
  - `#EXPIRATION#` - Service expirations, license renewals, warranties
  - `#BIRTH-DAYS#` - Birthdays with dates
  - `#DEATH-DAYS#` - Death anniversaries
  - `#MARRIAGE-DAYS#` - Wedding anniversaries
  - `#GIFTS#` - Gift cards and vouchers with balances
  - Bank and financial information

- **Daily entries** (after headers):
  ```
  ================
  ===DD/MM/YYYY===
  ================
  Day of week (Hebrew)
  -Event 1
  -Event 2
  -Israeli Holiday: Name
  -US Holiday: Name
  -Daily task 1
  -Daily task 2
  ```

### 2. event-dates-archive-2025.txt
**Purpose**: Archive file containing completed tasks marked with asterisks (*).

**Used by scripts**:
- `sync` - Merges completed tasks with the main calendar file

**Structure**:
```
DD/MM/YYYY
-Task that was completed. *
-Another completed task. *
-Meeting notes. *

DD/MM/YYYY
-More completed items. *
```

**Note**: Each completed task ends with ` *` (space + asterisk)

### 3. event-dates-index.txt
**Purpose**: Defines routine tasks that are automatically generated based on frequency.

**Used by scripts**:
- `create` - Generates recurring tasks for the new calendar year

**Structure**:
- `#DAY#` - Tasks added to every single day
- `#WEEKEND#` - Tasks added to Saturdays only
- `#WEEKEND-ALT#` - Tasks added to Sundays only
- `#END-MONTH#` - Tasks added to the last day of each month
- `#QUARTER#` - Tasks added every 3 months (quarterly)
- `#HALF-YEAR#` - Tasks added every 6 months
- `#START-YEAR#` - Tasks added on January 1st
- `#END-YEAR#` - Tasks added on December 31st

## How to Use These Examples

### For Testing
Copy these files to the `sources/` directory with appropriate year names to test the scripts:

```bash
# Copy examples to sources directory for testing
cp sources/examples/event-dates-2025.txt sources/event-dates-2025.txt
cp sources/examples/event-dates-archive-2025.txt sources/event-dates-archive-2025.txt
cp sources/examples/event-dates-index.txt sources/event-dates-index.txt
```

### For Creating Your Own Calendar

1. **Start with event-dates-index.txt**:
   - Define your daily, weekly, monthly, and yearly routine tasks
   - These will be automatically added to each appropriate date

2. **Create your first year file** (e.g., event-dates-2025.txt):
   - Add header sections with your personal information
   - Add birthdays, anniversaries, and important dates
   - The `create` script will merge this with holidays and routine tasks

3. **Use archive file for completed tasks**:
   - As you complete tasks, move them to the archive file with an asterisk
   - Use the `sync` script to merge completed tasks back into the main file

## Script Usage Examples

### Create a new year's calendar
```bash
pnpm run create
```
Requires: Previous year's file (e.g., `event-dates-2025.txt` to create 2026)

### Validate and fix formatting
```bash
pnpm run validate
```
Fixes spacing, dashes, and counter formatting issues

### Sync with archive
```bash
pnpm run sync
```
Merges completed tasks from archive back into main file

### Search for text
```bash
pnpm run search
```
Configure `searchKey` in settings.ts first

### Remove counters
```bash
pnpm run stop-counter
```
Configure `counterPatternText` and `stopDate` in settings.ts first

## Data Format Notes

### Hebrew Support
Files support Hebrew text (right-to-left) for:
- Day names (יום ראשון, יום שני, etc.)
- Event descriptions
- Holiday names

### Date Format
Always use: `DD/MM/YYYY` (e.g., 25/12/2025)

### Separators
- `================` - Used to separate sections and dates
- `-` - Prefix for individual events/tasks
- `*` - Suffix for completed tasks (space before asterisk)
- `#MARKER#` - Section markers for different data types

### Counter Pattern
Counter events follow the pattern: `יום ### ל[description]`
Example: `יום 1000 למלחמת אוקראינה-רוסיה`

## Important Notes

- All files must be UTF-8 encoded
- Hebrew text is fully supported
- Blank lines between sections are optional but improve readability
- The `create` script fetches Israeli and US holidays from online sources
- Personal information sections are preserved when creating new years

---

**For more information**, see the main [README.md](../../README.md) and [INSTRUCTIONS.md](../../INSTRUCTIONS.md) files.
