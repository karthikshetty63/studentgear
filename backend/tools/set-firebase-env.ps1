<#
PowerShell helper to set FIREBASE_SERVICE_ACCOUNT_JSON from a service account JSON file.

Usage (current session only):
    .\set-firebase-env.ps1 -Path C:\keys\studentgear-sa.json

Usage (persist for new sessions):
    .\set-firebase-env.ps1 -Path C:\keys\studentgear-sa.json -Persist

Parameters:
-Path    : Path to the service account JSON file
-Persist : If provided, uses `setx` to persist the base64 value for new sessions
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Path,

    [switch]$Persist
)

if (-not (Test-Path $Path)) {
    Write-Error "File not found: $Path"
    exit 2
}

try {
    $json = Get-Content -Raw -Path $Path -ErrorAction Stop
} catch {
    Write-Error "Failed to read file: $_"
    exit 3
}

try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $b64 = [Convert]::ToBase64String($bytes)
} catch {
    Write-Error "Failed to encode JSON to base64: $_"
    exit 4
}

# Set for current session
$env:FIREBASE_SERVICE_ACCOUNT_JSON = $b64
Write-Host "FIREBASE_SERVICE_ACCOUNT_JSON set for current session (base64)."

if ($Persist) {
    try {
        # setx requires the value as a single argument; very long values may be truncated by setx.
        # We still offer it for convenience, but for very large keys consider using a secrets manager.
        setx FIREBASE_SERVICE_ACCOUNT_JSON $b64 | Out-Null
        Write-Host "FIREBASE_SERVICE_ACCOUNT_JSON persisted for the current user (will apply to new terminals)."
    } catch {
        Write-Warning "Failed to persist env var with setx: $_"
    }
}

Write-Host "Done. Restart any running terminals to pick up persisted value if you used -Persist."