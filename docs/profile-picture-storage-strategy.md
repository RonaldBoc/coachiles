# Profile Picture Storage Strategy

## Current Implementation ✅

- Supabase Storage bucket: `coach-avatars`
- File path: `avatars/{coachId}.{extension}`
- Database field: `avatar_url TEXT`
- Upload API: `supabaseCoachApi.uploadAvatar()`

## Recommended Enhancements

### 1. Storage Structure

```
coach-avatars/
├── original/
│   ├── {coachId}.{ext}           # Original high-res images
├── thumbnails/
│   ├── {coachId}_150x150.webp    # Profile thumbnails
│   ├── {coachId}_300x300.webp    # Card view
├── optimized/
│   ├── {coachId}_600x600.webp    # Profile page
```

### 2. Multiple Formats & Sizes

- **Original**: Keep user uploads (backup/editing)
- **Thumbnails**: 150x150px for cards, lists
- **Profile**: 300x300px for profile headers
- **High-res**: 600x600px for detailed views

### 3. Image Processing Pipeline

1. Upload original → Supabase Storage
2. Generate optimized versions (WebP, JPEG)
3. Create multiple sizes automatically
4. Update database with all URLs

### 4. Database Schema Enhancement

```sql
-- Current
avatar_url TEXT

-- Enhanced
avatar_urls JSONB DEFAULT '{
  "original": null,
  "thumbnail": null,
  "profile": null,
  "high_res": null
}'::jsonb
```

### 5. Security & Performance

- ✅ RLS policies on storage bucket
- ✅ File type validation
- ✅ Size limits (max 5MB)
- ✅ CDN delivery via Supabase
- ✅ Lazy loading with blur placeholders

## Alternative Approaches

### Option A: Current + Improvements (Recommended)

- Keep Supabase Storage
- Add image processing
- Multiple sizes/formats
- Enhanced metadata

### Option B: External CDN (Cloudinary)

- Advanced image processing
- Automatic optimization
- AI-powered cropping
- Higher cost

### Option C: Self-hosted + CDN

- Full control
- Custom processing
- More complexity
- Infrastructure management

## Implementation Priority

1. **Phase 1**: Enhance current upload with validation
2. **Phase 2**: Add image processing (resize/optimize)
3. **Phase 3**: Multiple format support
4. **Phase 4**: Advanced features (AI cropping, filters)
