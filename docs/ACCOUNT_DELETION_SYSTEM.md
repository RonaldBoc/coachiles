# Account Deletion System

A comprehensive account deletion system following industry best practices, with soft delete, reactivation capabilities, and GDPR compliance.

## 🚀 Quick Start

### 1. Apply Database Migration

```bash
# Option A: Run the helper script
./scripts/apply-account-deletion-migration.sh

# Option B: Manual application via Supabase dashboard
# Copy contents of migrations/05_add_account_deletion.sql to SQL Editor
```

### 2. Test the System

Visit these pages to test the functionality:

- **Account Settings**: `/coach/account` - Delete account button
- **Demo Page**: `/demo/account-deletion` - System overview
- **Reactivation**: `/account/reactivate?token=demo-token` - Recovery flow

## 🏗️ System Architecture

### Database Schema

```sql
-- New columns added to coaches table
ALTER TABLE coaches ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coaches ADD COLUMN deletion_reason TEXT;
ALTER TABLE coaches ADD COLUMN can_reactivate BOOLEAN DEFAULT true;
ALTER TABLE coaches ADD COLUMN deletion_type TEXT;

-- New audit table
CREATE TABLE coach_deletion_log (
    id UUID PRIMARY KEY,
    coach_id UUID REFERENCES coaches(id),
    deletion_type TEXT,
    deletion_reason TEXT,
    deletion_requested_at TIMESTAMP WITH TIME ZONE,
    reactivation_deadline TIMESTAMP WITH TIME ZONE,
    reactivation_token UUID,
    reactivated_at TIMESTAMP WITH TIME ZONE,
    -- ... more audit fields
);
```

### API Functions

#### `soft_delete_coach_account(p_user_id, p_reason, p_deletion_type)`

- Soft deletes a coach account
- Creates audit log entry
- Returns reactivation token
- Sets 30-day grace period

#### `reactivate_coach_account(p_reactivation_token)`

- Restores deleted account using secure token
- Updates audit log
- Validates expiration date

## 🎯 Features

### ✅ Multi-Step Deletion Process

1. **Warning & Information** - Clear explanation of consequences
2. **Reason Collection** - Feedback for product improvement
3. **Data Export** - GDPR-compliant data download (JSON format)
4. **Final Confirmation** - Last chance to cancel

### ✅ Soft Delete with Grace Period

- 30-day reactivation window (configurable)
- Account hidden from public but data preserved
- Automatic cleanup scheduling after grace period

### ✅ Secure Reactivation System

- UUID-based tokens for account recovery
- Token expiration validation
- Email-based reactivation links

### ✅ GDPR Compliance

- Complete data export before deletion
- Audit trail for all deletion activities
- Right to be forgotten implementation
- Data anonymization after grace period

### ✅ Industry-Standard UX

- Progressive disclosure of information
- Clear consequences explanation
- Multiple confirmation steps
- Professional error handling

## 🔧 Technical Implementation

### Frontend Components

```typescript
// Account deletion modal with 4-step process
<AccountDeletionModal
  :showModal="showDeletionModal"
  @close="closeDeletionModal"
  @deleted="handleAccountDeleted"
/>

// Reactivation page for deleted accounts
<AccountReactivation />
```

### API Service

```typescript
// Export user data (GDPR compliance)
const data = await AccountDeletionApi.exportUserData()
AccountDeletionApi.downloadUserData(data)

// Initiate account deletion
const result = await AccountDeletionApi.deleteAccount({
  reason: 'User no longer needs service',
  type: 'user_requested',
})

// Reactivate account using token
const result = await AccountDeletionApi.reactivateAccount(token)
```

## 🔒 Security & Compliance

### Authentication & Authorization

- RLS policies ensure users can only delete own accounts
- SECURITY DEFINER functions for controlled database access
- Token-based reactivation prevents unauthorized access

### Data Protection

- Soft delete preserves referential integrity
- Audit logging for compliance requirements
- Staged data cleanup (profile → files → anonymization)

### Privacy Controls

- Complete data export before deletion
- User-initiated deletion only (no forced removal)
- Clear communication about data retention

## 🏭 Industry Comparison

| Feature      | Coachiles | Facebook   | Google      | LinkedIn  |
| ------------ | --------- | ---------- | ----------- | --------- |
| Grace Period | 30 days   | 30 days    | 2-3 weeks   | 20 days   |
| Data Export  | ✅ JSON   | ✅ Archive | ✅ Takeout  | ✅ Export |
| Reactivation | ✅ UI     | ✅ Login   | ⚠️ Variable | ❌ Manual |
| Audit Trail  | ✅ Full   | ✅ Limited | ✅ Basic    | ✅ Basic  |

## 🧪 Testing

### Manual Testing

1. Navigate to `/coach/account`
2. Click "Supprimer le compte"
3. Complete the 4-step deletion process
4. Try reactivating with the provided token

### Automated Testing

```bash
# Run component tests
npm test -- AccountDeletionModal

# Run API tests
npm test -- accountDeletionApi
```

## 📝 Configuration

### Environment Variables

```bash
# Standard Supabase configuration required
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Configuration

- PostgreSQL with Row Level Security enabled
- UUID extension for secure token generation
- Timezone handling for accurate grace periods

## 🐛 Troubleshooting

### Common Issues

**404 Error on Deletion**

- Ensure migration has been applied to database
- Check function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'soft_delete_coach_account'`

**Reactivation Token Invalid**

- Verify token format (UUID)
- Check expiration date in `coach_deletion_log`
- Ensure RLS policies allow reading deletion log

**Permission Denied**

- Verify user is authenticated
- Check RLS policies on coaches table
- Ensure functions have proper SECURITY DEFINER

### Debug Commands

```sql
-- Check if functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%coach_account%';

-- Check deletion log entries
SELECT * FROM coach_deletion_log
ORDER BY created_at DESC LIMIT 5;

-- Test function directly
SELECT soft_delete_coach_account(
  'user-uuid-here'::uuid,
  'Testing deletion',
  'user_requested'
);
```

## 🔄 Future Enhancements

### Planned Features

- [ ] Automated email notifications for reactivation
- [ ] Admin dashboard for deletion management
- [ ] Bulk data cleanup automation
- [ ] Enhanced anonymization strategies
- [ ] Multi-language support for deletion flow

### Metrics & Analytics

- [ ] Deletion reason analytics
- [ ] Reactivation rate tracking
- [ ] User flow optimization
- [ ] A/B testing for retention strategies

## 📚 References

- [GDPR Compliance Guide](https://gdpr.eu/right-to-be-forgotten/)
- [Industry Deletion Practices](https://www.facebook.com/help/224562897555674)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Soft Delete Patterns](https://en.wikipedia.org/wiki/Soft_delete)

---

_This system implements deletion patterns used by major platforms like Facebook, Google, and LinkedIn while maintaining full GDPR compliance and providing excellent user experience._
