# PowerShell script to update import paths
$files = Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx
foreach ($file in $files) {
    (Get-Content $file.FullName) | 
    ForEach-Object {
        $_ -replace 'care/oncall/', 'care/smart-care-alert/' `
           -replace 'OnCall([A-Z][a-z]+)', 'SmartCareAlert$1' `
           -replace 'OnCall([^a-zA-Z]|$)', 'SmartCareAlert$1'
    } | Set-Content $file.FullName
} 