# Account Deletion Strategies - Industry Analysis

## How Big Companies Handle Account Deletion

### **Soft Delete vs Hard Delete**

#### **Soft Delete (Recommended for Coachiles)**

**Used by:** Facebook, LinkedIn, Airbnb, Uber, Twitter

- Mark account as `deleted` but keep data
- User can reactivate within grace period
- Preserve referential integrity
- Maintain business analytics

#### **Hard Delete (GDPR Compliance)**

**Used by:** Apple, Signal (partial)

- Permanently remove personal data
- Required for GDPR "Right to be forgotten"
- Keep anonymized analytics only
- Cannot be undone

### **Industry Best Practices**

#### **1. Google's Approach**

- **2-month grace period** for reactivation
- Data marked as deleted but preserved
- After grace period → hard delete of personal data
- Keep anonymized usage statistics

#### **2. Facebook/Meta's Strategy**

- **30-day deactivation period**
- Account appears deleted to others
- User can log back in to reactivate
- After 30 days → permanent deletion process

#### **3. LinkedIn's Method**

- **Immediate soft delete** from public view
- **20-day grace period** for reactivation
- Gradual data removal process
- Professional connections preserved anonymously

#### **4. Airbnb's Approach**

- **Account deactivation** (soft delete)
- **Booking history preserved** for legal/tax reasons
- **Personal data anonymized** after 7 years
- **Reviews remain** but anonymized

### **Legal Requirements**

#### **GDPR (EU) Requirements**

- Right to erasure ("right to be forgotten")
- Must delete within 30 days of request
- Some exceptions for legitimate interests
- Data processing records must be maintained

#### **CCPA (California) Requirements**

- Right to delete personal information
- Business must comply within 45 days
- Some exceptions for transactions/security

### **Recommended Strategy for Coachiles**

#### **Phase 1: Soft Delete with Grace Period**

```sql
-- Add deletion fields to coaches table
ALTER TABLE coaches ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coaches ADD COLUMN deletion_reason TEXT;
ALTER TABLE coaches ADD COLUMN can_reactivate BOOLEAN DEFAULT true;
```

#### **Phase 2: Data Handling**

1. **Immediate Actions:**

   - Hide from public listings
   - Disable login
   - Cancel active bookings
   - Notify affected clients

2. **Grace Period (30 days):**

   - Account marked as deleted
   - Data preserved for reactivation
   - Automated emails offering reactivation

3. **After Grace Period:**
   - Anonymize personal data
   - Keep anonymized analytics
   - Preserve booking history (anonymized)
   - Remove profile photos

#### **Phase 3: What to Keep vs Delete**

**Keep (Anonymized):**

- Service ratings/reviews (without names)
- Booking statistics (for platform analytics)
- Payment records (legal requirement)
- Dispute/complaint records

**Delete Immediately:**

- Profile photos
- Personal contact information
- Bio and personal descriptions
- Social media links

**Delete After Grace Period:**

- Name and personal identifiers
- Email (replace with anonymized ID)
- Phone numbers
- Detailed availability data

### **Implementation Priorities**

1. **High Priority:** Soft delete with grace period
2. **Medium Priority:** Data anonymization pipeline
3. **Low Priority:** Hard delete automation (GDPR compliance)

### **User Experience Considerations**

1. **Clear Communication:**

   - Explain what happens to data
   - Offer data export before deletion
   - Provide reactivation instructions

2. **Confirmation Process:**

   - Multi-step confirmation
   - Email verification
   - Optional feedback collection

3. **Gradual Removal:**
   - Immediate: Hide from searches
   - 24 hours: Cancel future bookings
   - 7 days: Notify reactivation option
   - 30 days: Begin anonymization
