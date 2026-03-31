# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-08

### Breaking Changes

#### Date Order Reversed - Chronological Ordering
**IMPORTANT**: The date ordering in all output files has been changed from descending to ascending (chronological) order.

**Previous Behavior (v1.x):**
- Files showed dates from December 31st → January 1st (newest to oldest)
- December 31st appeared at the bottom
- January 1st appeared near the top (after header sections)

**New Behavior (v2.0+):**
- Files now show dates from January 1st → December 31st (oldest to newest)
- January 1st appears at the top (after header sections)
- December 31st appears at the bottom

**Why This Change?**
Chronological ordering (earliest to latest) is more intuitive for:
- Navigating through the year sequentially
- Finding dates by scrolling forward
- Understanding the progression of time naturally
- Aligning with standard calendar formats

### Modified Scripts

#### 1. Create Script
- **Changed**: Removed reverse operation on event array
- **Result**: Generates files in chronological order (Jan 1 → Dec 31)

#### 2. Sync Script  
- **Changed**: Removed logic that restored original reverse order after processing
- **Result**: Output maintains chronological order after merging source and archive
- **Counter Logic**: Still correctly increments counters from previous year

#### 3. Validate Script
- **Changed**: Updated counter validation to increment instead of decrement
- **Result**: Validates counters correctly in ascending date order
- **Counter Tracking**: Changed from `previousValue - 1` to `previousValue + 1`

#### 4. Search Script
- **No Changes**: Continues to work correctly with new order

#### 5. Stop Counter Script
- **No Changes**: Continues to work correctly with new order

### Migration Guide

#### For Existing Users

If you have existing files in the old format (Dec 31 → Jan 1):

1. **No immediate action required** - Old files will continue to work
2. **When you run create/sync**: New output files will be in the new format
3. **Archive files**: Keep in chronological order (earliest → latest) for sync to work correctly

#### Example File Updates

All example files in `examples/` directory have been updated to reflect the new chronological ordering:
- `event-dates-2025.txt` - Now shows Jan 1 at top, Dec 31 at bottom
- `event-dates-archive-2025.txt` - Already in correct chronological order
- `event-dates-index.txt` - No changes (not date-dependent)

### Documentation Updates

#### Files Updated:
- `README.md` - Added note about chronological ordering feature
- `INSTRUCTIONS.md` - Updated sync script documentation with date order clarification
- `examples/README.md` - Added dedicated section explaining date order
- All code comments updated to reflect new ordering

### Technical Details

#### Counter Logic
- Counters now increment as dates progress from January to December
- Counter detection still analyzes last 10 days of previous year (Dec 22-31)
- Counter application correctly calculates days elapsed since Dec 31 of previous year
- Example: If Dec 31, 2025 shows "יום 909", then Jan 1, 2026 shows "יום 910"

#### File Structure
```
Header sections...

#EVENTS#:
================

01/01/YYYY יום day-name.     ← January 1st at top
-events...

02/01/YYYY יום day-name.
-events...

...

30/12/YYYY יום day-name.
-events...

31/12/YYYY יום day-name.     ← December 31st at bottom
-events...

================
```

### Compatibility

- **Forward Compatible**: New format files work with v2.0+
- **Backward Incompatible**: Old v1.x tools expect reverse order
- **Recommendation**: Update all tools to v2.0+ for best experience

### Testing

All scripts have been tested and verified:
- ✅ Create script generates files in ascending order
- ✅ Sync script maintains ascending order with correct counter increments
- ✅ Validate script validates counters in ascending order
- ✅ Search script finds results correctly
- ✅ Stop-counter script removes events correctly

---

## [1.0.0] - 2025-2026

### Initial Release
- Calendar creation from Israeli and US holiday sources
- Event synchronization with archive files
- Validation and formatting tools
- Search functionality
- Counter management
- Date ordering: Descending (Dec 31 → Jan 1)
