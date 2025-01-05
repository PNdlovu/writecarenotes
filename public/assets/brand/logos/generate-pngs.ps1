# Install and import the required module if not already installed
# Install-Module -Name Microsoft.PowerShell.Graphics -Scope CurrentUser

# Create PNG directories
$sizes = @(64, 128, 256, 512)
$variants = @("horizontal", "vertical", "icon")
$themes = @("light", "dark")

foreach ($size in $sizes) {
    New-Item -ItemType Directory -Force -Path "png/${size}px"
}

foreach ($variant in $variants) {
    foreach ($theme in $themes) {
        $svgPath = "${variant}/${theme}.svg"
        foreach ($size in $sizes) {
            $outputPath = "png/${size}px/${variant}-${theme}.png"
            # Note: This is a placeholder for the actual conversion
            # In a real implementation, you would use a tool like Inkscape or ImageMagick
            Write-Host "Would convert $svgPath to $outputPath at ${size}x${size}px"
        }
    }
}
