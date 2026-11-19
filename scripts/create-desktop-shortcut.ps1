$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Auto Channel Studio.lnk"

$TargetBat = Join-Path -Path (Get-Location) -ChildPath "start-app.bat"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = (Get-Location).Path
$Shortcut.Description = "Auto Channel Studio - Hệ thống tự động tạo video MXH với link cố định"
$Shortcut.Save()

Write-Host "[OK] Đã tạo Shortcut trên Desktop: $ShortcutPath"
