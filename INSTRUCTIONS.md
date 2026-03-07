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
Merges source calendar with archive data:
```bash
pnpm run sync
```

**Prerequisites:**
- Both source and archive files must exist for the same year
- Format: `event-dates-YYYY.txt` and `event-dates-archive-YYYY.txt`

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

### Output Files (`dist/`)
Generated files are placed in the dist directory with automatic naming based on the operation.

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
