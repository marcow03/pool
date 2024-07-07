$scriptName = "poolctl"
$baseUrl = "<pool-url>"
$installPath = "$env:ProgramFiles\$scriptName"

# Function to list files
function Get-PoolFiles {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Pattern
    )

    $output = if ($Pattern) {
        Invoke-RestMethod -Uri "$baseUrl/ls/$Pattern"
    } else {
        Invoke-RestMethod -Uri "$baseUrl/ls"
    }

    $output | ForEach-Object {
        [PSCustomObject]@{
            Name = $_.name
            Size = "$($_.size_bytes)B"
            ModificationTime = $_.modification_time
        }
    } | Format-Table -AutoSize
}

# Function to get file contents (raw)
function Get-PoolFileContent {
    param(
        [Parameter(Mandatory=$true, HelpMessage={"Usage: $scriptName get <filename>"})]
        [string]$Filename
    )

    Invoke-RestMethod -Uri "$baseUrl/cat/$Filename"
}

# Function to push a file
function Push-PoolFile {
    param(
        [Parameter(Mandatory=$true, HelpMessage={"Usage: $scriptName push <path to file>"})]
        [string]$FilePath
    )

    Invoke-RestMethod -Uri "$baseUrl/push" -Method Post -Form @{files = Get-Item -Path $FilePath}
}

# Function to pull a file or files
function Get-PoolFile {
    param(
        [Parameter(Mandatory=$true, HelpMessage={"Usage: $scriptName pull <filename or pattern>"})]
        [string]$Pattern
    )

    Invoke-RestMethod -Uri "$baseUrl/pull/$Pattern" -OutFile $Pattern
}

# Function to remove a file or files
function Remove-PoolFile {
    param(
        [Parameter(Mandatory=$true, HelpMessage={"Usage: $scriptName remove <filename or pattern>"})]
        [string]$Pattern
    )

    Invoke-RestMethod -Uri "$baseUrl/rm/$Pattern" -Method Delete
}

# Function to install the script
function Install-PoolScript {
    Copy-Item $MyInvocation.MyCommand.Path $installPath
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$installPath", "Machine")
    Write-Host "Script installed to $installPath"
    Write-Host "The installation path has been added to the system PATH. You may need to restart your PowerShell session for the changes to take effect."
}

# Function to show usage
function Show-PoolUsage {
    Write-Host "Usage: $scriptName <command> [options]`n"
    Write-Host "Commands:"
    Write-Host "  ls|list <filename|pattern>   List file(s)"
    Write-Host "  get <filename>               Get file contents (raw)"
    Write-Host "  push <path-to-file>          Push file"
    Write-Host "  pull <filename|pattern>      Pull file(s)"
    Write-Host "  rm|remove <filename|pattern> Remove file(s)"
    Write-Host "  install                      Install this script`n"
}

# Main command handling
switch ($args[0]) {
    { $_ -in "ls", "list" } { Get-PoolFiles -Pattern $args[1] }
    { $_ -in "cat", "get" } { Get-PoolFileContent -Filename $args[1] }
    "push" { Push-PoolFile -FilePath $args[1] }
    "pull" { Get-PoolFile -Pattern $args[1] }
    { $_ -in "rm", "remove" } { Remove-PoolFile -Pattern $args[1] }
    "install" { Install-PoolScript }
    default { Show-PoolUsage }
}