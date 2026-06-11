# Event Dates Calendar Ts

A Node.js + TypeScript application for generating and maintaining a personalized yearly calendar TXT file by aggregating events from multiple sources such as Israeli holidays, US holidays, personal events, birthdays, anniversaries, and recurring routine tasks.

Built in 2025–2026, it scrapes and normalizes calendar data, merges historical archives, validates formatting, and outputs a structured daily timeline with automation features like search, sync, stop-counter handling, and chronological ordering for easy year-long navigation.

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
- 📆 **Chronological date ordering**: Events are organized from January 1st to December 31st for easy navigation

### Core Capabilities

- **Multi-Source Event Aggregation**: Combines Israeli holidays, US holidays, personal events, birthdays, anniversaries, and routine tasks
- **Automated Calendar Generation**: Creates a complete yearly calendar with proper formatting
- **Intelligent Sync with Archives**: Merges existing data with archive files and continues counter sequences
- **Validation and Formatting**: Ensures consistent formatting and fixes issues automatically
- **Search Functionality**: Finds specific events across calendar files

### Technical Excellence

- **Type Safety**: Full TypeScript with strict type checking
- **Scalable Architecture**: Modular service-oriented design
- **Error Handling**: Unique error codes for easy troubleshooting
- **Code Quality**: ESLint and Prettier for consistent code style

### Developer Experience

- **Clear Project Structure**: Organized by functionality for easy navigation
- **Comprehensive Documentation**: Detailed README and instructions
- **Automated Scripts**: Convenient npm scripts for all operations
- **Type Definitions**: Complete TypeScript types for all modules

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

Example source files with dummy data are available in `examples/`:

- `event-dates-2025.txt` - Example main calendar file
- `event-dates-archive-2025.txt` - Example archive with completed tasks
- `event-dates-index.txt` - Example routine tasks definitions
- `README.md` - Detailed explanation of file formats and usage

These examples demonstrate the required format and structure for each script. See [examples/README.md](examples/README.md) for detailed documentation.

## Usage

### Interactive Menu (Recommended)

Start the interactive CLI menu to select and run scripts:

```bash
pnpm start
```

### Direct Script Execution

You can also run scripts directly:

```bash
pnpm script &lt;script-name&gt;
```

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

## Architecture Principles

This project follows clean architecture principles:

1. **Modular Design**: Each feature is organized into separate modules
2. **Single Responsibility**: Each service has a single, well-defined purpose
3. **Type Safety**: Full TypeScript with comprehensive type definitions
4. **Maintainability**: Clear separation of concerns between data, services, and scripts
5. **Testability**: Pure functions and modular services for easy testing

## Architecture

This project follows a clean, modular architecture with clear separation of concerns:

### Directory Structure

```
event-dates-calendar-ts/
├── src/
│   ├── data/              # Static data (holidays, keywords, etc.)
│   ├── scripts/           # Main script executables
│   ├── services/          # Business logic services
│   ├── settings/          # Configuration
│   ├── separators/        # Text separators and selectors
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── examples/              # Example calendar files
├── misc/                  # Miscellaneous files (error index, tasks, etc.)
├── package.json
└── README.md
```

### Design Patterns

- **Service Pattern**: Business logic encapsulated in service classes
- **Factory Pattern**: Script execution through runner factory
- **Repository Pattern**: Data access abstraction through services
- **Strategy Pattern**: Different processing strategies for various event types

## Best Practices

### Before Running Scripts

1. **Backup Files**: Always backup your source and archive files before running sync or validate
2. **Test First**: Run create script for a test year first to verify everything works
3. **Validate**: Always run validate after making manual edits

### File Management

1. **Keep Previous Year's File**: Always keep the previous year's calendar file for counter continuation
2. **Organize Archives**: Keep archive files organized by year
3. **Use Examples**: Refer to the example files in the `examples/` directory for correct formatting

### Code Quality

1. **Follow TypeScript**: Always use TypeScript for type safety
2. **Lint and Format**: Run `pnpm lint` and `pnpm format` before committing
3. **Document**: Add comments for complex logic

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

## Support

For questions, issues, or contributions:

- **GitHub Issues**: [https://github.com/orassayag/event-dates-calendar-ts/issues](https://github.com/orassayag/event-dates-calendar-ts/issues)
- **Email**: orassayag@gmail.com

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag

## License

This application has an MIT license - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for educational and research purposes
- Respects robots.txt and implements rate limiting
- Uses user-agent rotation to avoid detection
- Implements polite crawling practices
