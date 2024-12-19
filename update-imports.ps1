# Get all TypeScript and TypeScript React files
Get-ChildItem -Path "c:/Users/phila/gpt-pilot/workspace/wsapp/src" -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
    try {
        $content = Get-Content -LiteralPath $_.FullName -Raw
        
        # Update imports from @/types/staff to @/features/staff/types
        $content = $content -replace "from '@/types/staff'", "from '@/features/staff/types'"
        $content = $content -replace "from '@/types/staff.types'", "from '@/features/staff/types'"
        
        # Update imports from @/components/staff to @/features/staff/components
        $content = $content -replace "from '@/components/staff/", "from '@/features/staff/components/"
        
        # Write the updated content back to the file
        Set-Content -LiteralPath $_.FullName -Value $content -Force
        Write-Host "Updated file: $($_.FullName)"
    }
    catch {
        Write-Host "Error processing file $($_.FullName): $_"
    }
}
