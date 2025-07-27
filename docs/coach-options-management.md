# Coach Options Management

This system provides a centralized and maintainable way to manage coach profile options (certifications, specialties, languages, etc.) without touching component code.

## Files Structure

- `src/constants/coachOptions.ts` - Main configuration file with all options
- `src/constants/coachOptionsManager.ts` - Management utilities and analysis tools
- `scripts/manage-coach-options.js` - CLI tool for quick operations

## How to Update Options

### Adding New Certifications

1. **Edit the configuration file**: `src/constants/coachOptions.ts`
2. **Find the appropriate category** or create a new one
3. **Add the certification** to the certifications array

```typescript
{
  category: "Fitness & Musculation",
  certifications: [
    "BPJEPS",
    "Your New Certification Here" // Add here
  ]
}
```

### Adding New Specialties

1. **Edit the configuration file**: `src/constants/coachOptions.ts`
2. **Find the appropriate category** or create a new one
3. **Add the specialty** to the specialties array

```typescript
{
  category: "Fitness & Musculation",
  specialties: [
    "Remise en forme générale",
    "Your New Specialty Here" // Add here
  ]
}
```

### Adding New Languages

Simply add to the `LANGUAGE_OPTIONS` array in `src/constants/coachOptions.ts`:

```typescript
export const LANGUAGE_OPTIONS: string[] = [
  'Français',
  'Your New Language', // Add here
]
```

### Creating New Certification Categories

Add a new object to the `CERTIFICATION_OPTIONS` array:

```typescript
{
  category: "Your New Category",
  certifications: [
    "Certification 1",
    "Certification 2"
  ]
}
```

### Creating New Specialty Categories

Add a new object to the `SPECIALTY_OPTIONS` array:

```typescript
{
  category: "Your New Category",
  specialties: [
    "Specialty 1",
    "Specialty 2"
  ]
}
```

## CLI Management Tool

Use the CLI tool to analyze and manage options:

```bash
# Show statistics about current options
npm run coach-options stats

# Find duplicate certifications
npm run coach-options audit

# Search for specific certifications
npm run coach-options search "yoga"

# Get suggestions for new certifications
npm run coach-options suggestions

# Export current configuration (for backup)
npm run coach-options export

# Validate configuration
npm run coach-options validate
```

## Benefits of This Approach

✅ **Centralized**: All options in one place  
✅ **Maintainable**: Easy to add/remove without touching components  
✅ **Organized**: Certifications and specialties grouped by category  
✅ **Searchable**: Find certifications and specialties easily  
✅ **Validated**: Built-in validation and analysis  
✅ **Future-proof**: Easy to extend for admin interfaces

## Best Practices

1. **Keep categories logical** - Group related certifications together
2. **Use clear names** - Make certification names descriptive
3. **Validate regularly** - Run `npm run coach-options audit` to find issues
4. **Backup before major changes** - Use `npm run coach-options export`
5. **Test after changes** - Ensure the coach profile still works correctly

## Future Enhancements

This system is designed to support future features like:

- Admin interface for managing options
- Dynamic loading from database
- User-contributed certifications
- Automatic suggestions based on usage
- Import/export functionality
- Version tracking of changes

## Example Usage in Components

The coach profile component now automatically uses these centralized options:

```vue
<!-- Specialties dropdown -->
<select v-model="newSpecialty">
  <optgroup 
    v-for="group in SPECIALTY_OPTIONS" 
    :label="group.category"
  >
    <option v-for="specialty in group.specialties" :value="specialty">
      {{ specialty }}
    </option>
  </optgroup>
</select>

<!-- Certifications dropdown -->
<select v-model="newCertification">
  <optgroup 
    v-for="group in CERTIFICATION_OPTIONS" 
    :label="group.category"
  >
    <option v-for="cert in group.certifications" :value="cert">
      {{ cert }}
    </option>
  </optgroup>
</select>

<!-- Languages dropdown -->
<select v-model="newLanguage">
  <option v-for="lang in LANGUAGE_OPTIONS" :value="lang">
    {{ lang }}
  </option>
</select>
```
