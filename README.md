# Event Dates Calendar - TypeScript

A Node.js application to create and manage a personalized calendar TXT file by combining events from multiple sources including Israeli holidays, US holidays, birthdays, anniversaries, and routine tasks.

Built in 2025-2026. This TypeScript application scrapes calendar data from online sources, processes events, and generates a comprehensive daily calendar with automated task management.

## Features

- 🗓️ Fetches Israeli calendar events from online sources
- 🇺🇸 Imports US holidays and maps them to Hebrew translations
- 📅 Manages birthdays, death anniversaries, and marriage anniversaries
- ✅ Generates daily, weekly, monthly, and yearly routine tasks
- 🔄 Syncs calendar data with archive files
- 🔍 Search functionality across calendar entries
- ✏️ Validates and fixes formatting issues automatically
- 🛑 Stop counter functionality for ongoing events
- 📊 Comprehensive statistics and reporting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/orassayag/event-dates-calendar-ts.git
cd event-dates-calendar-ts
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

### Configuration

Edit the settings in `src/settings/settings.ts`:
- `targetYear`: The year to create the calendar for (default: 2026)
- `sourcePath`: Path to the source events file
- `distPath`: Output directory for generated files
- `searchKey`: Default search term
- `counterPatternText`: Text pattern for stop-counter feature
- `stopDate`: Date to stop counters

### Example Files

Example source files with dummy data are available in `sources/examples/`:
- `event-dates-2025.txt` - Example main calendar file
- `event-dates-archive-2025.txt` - Example archive with completed tasks
- `event-dates-index.txt` - Example routine tasks definitions
- `README.md` - Detailed explanation of file formats and usage

These examples demonstrate the required format and structure for each script. See [sources/examples/README.md](sources/examples/README.md) for detailed documentation.

## Available Scripts

### Create
Creates a new calendar file for the target year by combining events from all sources:
```bash
pnpm run create
```

### Validate
Validates and fixes formatting issues in the calendar file:
```bash
pnpm run validate
```

### Sync
Synchronizes source calendar with archive data:
```bash
pnpm run sync
```

### Search
Searches for a specific term in calendar files:
```bash
pnpm run search
```

### Stop Counter
Removes or stops counter events from a specific date:
```bash
pnpm run stop-counter
```

### Build
Compiles TypeScript to JavaScript:
```bash
pnpm build
```

### Lint
Checks code for linting errors:
```bash
pnpm lint
```

### Format
Formats code using Prettier:
```bash
pnpm format
```

## Project Structure

```
event-dates-calendar-ts/
├── src/
│   ├── data/           # Static data (holidays, keywords, etc.)
│   ├── scripts/        # Main script executables
│   ├── services/       # Business logic services
│   ├── settings/       # Configuration
│   ├── separators/     # Text separators and selectors
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── sources/            # Source calendar files
├── dist/               # Compiled output
├── misc/               # Miscellaneous files (error index, tasks, etc.)
└── package.json
```

## Error Codes

All errors include a unique serial number (1000001-1000023) for easy identification. See `misc/error_index.txt` for the complete error code reference.

## Development

The project uses:
- **TypeScript** for type safety
- **pnpm** for package management
- **ESLint** for code linting
- **Prettier** for code formatting
- **tsx** for running TypeScript directly

## Contributing

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE).

Everyone is welcome to contribute. Contributing doesn't just mean submitting pull requests—there are many different ways to get involved, including answering questions and reporting issues.

Please feel free to contact me with any question, comment, pull-request, issue, or any other thing you have in mind.

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag

## License

This application has an MIT license - see the [LICENSE](LICENSE) file for details.
