#!/bin/bash

# Account Deletion Migration Runner
# This script helps apply the account deletion migration to your Supabase database

echo "🗄️  Account Deletion Migration Runner"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "migrations/05_add_account_deletion.sql" ]; then
    echo "❌ Migration file not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found migration file: migrations/05_add_account_deletion.sql"
echo ""

# Option 1: Using Supabase CLI (recommended)
echo "🔧 Option 1: Apply via Supabase CLI (Recommended)"
echo "----------------------------------------------"
echo "1. Make sure you're logged in: supabase login"
echo "2. Link your project: supabase link --project-ref YOUR_PROJECT_REF"
echo "3. Apply migration: supabase db push"
echo ""

# Option 2: Manual SQL execution
echo "🔧 Option 2: Manual SQL Execution"
echo "--------------------------------"
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of migrations/05_add_account_deletion.sql"
echo "4. Run the migration"
echo ""

# Option 3: Direct CLI execution
echo "🔧 Option 3: Direct CLI Execution"
echo "--------------------------------"
echo "Run this command:"
echo "supabase db reset --db-url 'your-database-url'"
echo ""

echo "📋 Migration Summary:"
echo "- Adds soft deletion columns to coaches table"
echo "- Creates coach_deletion_log audit table"
echo "- Implements soft_delete_coach_account function"
echo "- Implements reactivate_coach_account function"
echo "- Updates RLS policies"
echo ""

echo "⚠️  Important Notes:"
echo "- This migration is safe and doesn't delete existing data"
echo "- All changes use IF NOT EXISTS to prevent conflicts"
echo "- The functions use SECURITY DEFINER for proper permissions"
echo ""

echo "🧪 After applying the migration, test with:"
echo "- Try the account deletion flow in /coach/account"
echo "- Check the demo page at /demo/account-deletion"
echo ""

read -p "Would you like to see the migration file content? (y/n): " show_content
if [[ $show_content =~ ^[Yy]$ ]]; then
    echo ""
    echo "📄 Migration File Content:"
    echo "=========================="
    cat migrations/05_add_account_deletion.sql
fi

echo ""
echo "✨ Ready to apply the migration! Choose your preferred method above."
