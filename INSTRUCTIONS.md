# Instructions

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the project:
   ```bash
   pnpm build
   ```

## Configuration

1. Open `src/settings/settings.ts`
2. Configure the settings according to your needs:
   - `targetYear`: Year to create calendar for (default: 2026)
   - `sourcePath`: Path to source events file
   - `israelCalendarUrl`: Israeli calendar website URL
   - `unitedStateCalendarUrl`: US holidays website URL
   - `searchKey`: Default search term
   - `counterPatternText`: Pattern for counter events
   - `stopDate`: Date to stop counters (format: DD/MM/YYYY or 'all')

## Running Scripts

### Create New Calendar
Generates a new calendar file for the target year:
```bash
pnpm run create
```

**Prerequisites:**
- Previous year's source file must exist (e.g., `sources/event-dates-2025.txt` for creating 2026)
- Event index file must exist at configured path
- Internet connection required to fetch calendar data

### Validate Calendar
Validates and fixes formatting issues:
```bash
pnpm run validate
```

**What it does:**
- Detects counter patterns automatically
- Fixes missing dashes and asterisks
- Removes multiple consecutive blank lines
- Fixes multiple spaces
- Validates counter sequences

### Sync with Archive
Merges source calendar with archive data and continues counters from the previous year:
```bash
pnpm run sync
```

**Prerequisites:**
- Both source and archive files must exist for the same year in the `sources/` directory
  - Format: `event-dates-YYYY.txt` (e.g., `event-dates-2026.txt`)
  - Format: `event-dates-archive-YYYY.txt` (e.g., `event-dates-archive-2026.txt`)
- Previous year's source file must exist for counter continuation
  - Format: `event-dates-YYYY.txt` where YYYY is current year - 1
  - Example: When syncing 2026, requires `event-dates-2025.txt`
- Source file must contain dates for the target year
- Archive file must contain completed tasks with matching dates

**What it does:**
- Merges tasks from archive file into matching dates in the source file
- Marks synced tasks with asterisks (*)
- Detects recurring counters from the previous year's last 10 days (Dec 22-31)
- Automatically continues counter sequences for all synced days
- Removes placeholder counters (e.g., "יום ### למלחמת אוקראינה-רוסיה")
- Calculates correct counter values based on days elapsed since Dec 31 of previous year
- Preserves unsynced days without modification
- **Outputs dates in chronological order from January 1st to December 31st**

**Counter Detection Logic:**
The script automatically detects counters by:
1. Finding December 31st of the previous year
2. Scanning the last 10 days (Dec 22-31) for patterns with incrementing numbers
3. Validating that counters appear in ALL 10 consecutive days with increasing values
4. Extracting the baseline counter value from December 31st

**Counter Application:**
- Counters are ONLY applied to synced days (days that matched with archive)
- Counter values increment by 1 for each day after December 31st
- Example: If "יום 909 לעבודה בVim" on Dec 31, 2025, then Jan 1, 2026 will show "יום 910 לעבודה בVim"
- Placeholder counters (with ###) are automatically removed after real counters are applied
- Unsynced days keep their placeholder counters unchanged

**Output:**
- Creates merged file in `dist/event-dates-YYYY.txt`
- Displays statistics:
  - Number of synced days
  - Number of unsynced days
  - Number and list of detected counters applied
- Provides file size and event count statistics

### Search Calendar
Searches for text in calendar files:
```bash
pnpm run search
```

**Configuration:**
- Update `searchKey` in settings before running
- Searches all `.txt` files in the sources directory

### Stop Counter
Removes counter events from a specific date:
```bash
pnpm run stop-counter
```

**Configuration:**
- Update `counterPatternText` to match the event text
- Update `stopDate` to the date from which to remove counters

## File Structure

### Source Files (`sources/`)
- `event-dates-YYYY.txt` - Main calendar file for the year
- `event-dates-archive-YYYY.txt` - Archive with completed tasks
- `event-dates-index.txt` - Routine tasks definitions

**Important Notes:**
- For the sync script to work properly, you need the previous year's source file
- Example: To sync 2026 data, you must have `event-dates-2025.txt` in the sources folder
- The previous year file is used to detect and continue counter sequences

### Output Files (`dist/`)
Generated files are placed in the dist directory with automatic naming based on the operation.

**Date Order**: All generated calendar files organize dates chronologically from January 1st (at the top) to December 31st (at the bottom), making it easy to find any date by scrolling forward through the year.

## Counter Continuation Feature

The sync script includes automatic counter continuation that carries over incrementing counters from year to year.

### How Counters Work

**Counter Definition:**
A counter is any task that:
- Contains a number that increments daily
- Appears consistently in the last 10 days of the previous year (Dec 22-31)
- Has the same pattern across all 10 days with increasing values

**Example Counters:**
- `יום 909 לעבודה בVim` (Day 909 working at Vim)
- `יום 1410 למלחמת אוקראינה-רוסיה` (Day 1410 of Ukraine-Russia war)

### Counter Detection Process

1. **Locate Previous Year File:** Script finds `event-dates-{YEAR-1}.txt`
2. **Find December 31st:** Identifies the last day of the previous year
3. **Extract Last 10 Days:** Gets days from Dec 22 to Dec 31
4. **Validate Incrementing Pattern:** Ensures counter values increase by 1 each day
5. **Store Baseline Values:** Records the counter value from Dec 31

### Counter Application Rules

**Applied to:**
- ✅ Synced days (days that matched between source and archive)
- ✅ All dates from January 1st onwards in the new year

**NOT applied to:**
- ❌ Unsynced days (days without archive match)
- ❌ Days from the previous year

**Calculation:**
```
New Counter Value = Baseline Value (Dec 31) + Days Elapsed Since Dec 31
```

Example:
- Dec 31, 2025: `יום 909 לעבודה בVim`
- Jan 1, 2026: `יום 910 לעבודה בVim` (909 + 1)
- Jan 10, 2026: `יום 919 לעבודה בVim` (909 + 10)

### Placeholder Removal

The script automatically removes placeholder counters (with `###`) when real counters are applied:
- Before: `-יום ### למלחמת אוקראינה-רוסיה. *`
- After: `-יום 1411 למלחמת אוקראינה-רוסיה. *`

Placeholders remain unchanged in unsynced days.

## Error Codes

All errors include a unique code (1000001-1000023) for easy troubleshooting. See `misc/error_index.txt` for the complete reference.

## Development

### Building
```bash
pnpm build
```

### Linting
```bash
pnpm lint
```

### Formatting
```bash
pnpm format
```

## Notes

- The application requires an internet connection for the create script to fetch calendar data
- Ensure proper file permissions for reading source files and writing to dist directory
- All calendar files use UTF-8 encoding
- Hebrew text is supported and properly formatted

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag
