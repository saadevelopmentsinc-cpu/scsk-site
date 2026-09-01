[CmdletBinding()]
param(
  [switch]$ConfirmProduction,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'

$repositoryName = 'saadevelopmentsinc-cpu/scsk-site'
$projectName = 'scsk-current-site'
$productionBranch = 'main'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  $result = & git -C $repoRoot @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Arguments -join ' ') failed."
  }
  return ($result | Out-String).Trim()
}

$actualRoot = Invoke-Git rev-parse --show-toplevel
if ([IO.Path]::GetFullPath($actualRoot) -ne [IO.Path]::GetFullPath($repoRoot)) {
  throw "Deploy must run from the scsk-site repository. Found: $actualRoot"
}

$origin = Invoke-Git remote get-url origin
if ($origin -notmatch 'github\.com[:/]saadevelopmentsinc-cpu/scsk-site(?:\.git)?$') {
  throw "Refusing deployment from unexpected origin: $origin"
}

$branch = Invoke-Git branch --show-current
if ($branch -ne $productionBranch) {
  throw "Production deploys must run from '$productionBranch', not '$branch'."
}

Invoke-Git fetch origin $productionBranch | Out-Null
$commit = Invoke-Git rev-parse HEAD
$remoteCommit = Invoke-Git rev-parse "origin/$productionBranch"
if ($commit -ne $remoteCommit) {
  throw "HEAD ($commit) does not match origin/$productionBranch ($remoteCommit)."
}

$dirty = Invoke-Git status --porcelain --untracked-files=no
if ($dirty) {
  throw 'Tracked files are modified. Commit and push them before deploying.'
}

$indexPath = Join-Path $repoRoot 'index.html'
$index = Get-Content -LiteralPath $indexPath -Raw
if (-not $index.Contains('assets/screenshots/dashboard-desktop.webp')) {
  throw 'The redesigned dashboard screenshot reference is missing from index.html.'
}
if ($index -match 'Screenshot[1-7]\.png') {
  throw 'Legacy Screenshot1.png-Screenshot7.png references remain in index.html.'
}

$requiredAssets = @(
  'assets/screenshots/dashboard-desktop.webp',
  'assets/screenshots/dashboard-mobile.webp',
  'assets/screenshots/projects-desktop.webp',
  'assets/screenshots/projects-mobile.webp',
  'assets/screenshots/work-desktop.webp',
  'assets/screenshots/work-mobile.webp',
  'assets/screenshots/calendar-landscape.webp',
  'assets/screenshots/project-details-mobile.webp',
  'assets/screenshots/project-photos-mobile.webp',
  'assets/screenshots/jobs-mobile.webp',
  'assets/screenshots/reports-mobile.webp',
  'assets/screenshots/materials-mobile.webp'
)

foreach ($asset in $requiredAssets) {
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $asset))) {
    throw "Required redesigned screenshot is missing: $asset"
  }
}

Write-Host "Validated $repositoryName@$commit for Cloudflare Pages project $projectName."
if ($ValidateOnly) {
  return
}
if (-not $ConfirmProduction) {
  throw 'Production deployment requires -ConfirmProduction.'
}

$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$tempRoot = Join-Path $tempBase ("scsk-site-production-" + [Guid]::NewGuid().ToString('N'))
$archivePath = Join-Path $tempRoot 'site.tar'
$stagingPath = Join-Path $tempRoot 'site'

New-Item -ItemType Directory -Path $stagingPath -Force | Out-Null

try {
  & git -C $repoRoot archive --format=tar --output=$archivePath $commit
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to create a clean deployment archive.'
  }

  & tar -xf $archivePath -C $stagingPath
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to extract the clean deployment archive.'
  }

  $manifest = [ordered]@{
    repository = $repositoryName
    branch = $productionBranch
    commit = $commit
    deployedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
  } | ConvertTo-Json
  Set-Content -LiteralPath (Join-Path $stagingPath 'deployment-manifest.json') -Value $manifest -Encoding utf8

  & npx wrangler pages deploy $stagingPath `
    --project-name $projectName `
    --branch $productionBranch `
    --commit-hash $commit `
    --commit-message "Deploy $repositoryName@$commit"
  if ($LASTEXITCODE -ne 0) {
    throw 'Cloudflare Pages deployment failed.'
  }

  $manifestUrl = "https://sc-sk.com/deployment-manifest.json?commit=$commit"
  $verified = $false
  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      $live = Invoke-RestMethod -Uri $manifestUrl -Headers @{ 'Cache-Control' = 'no-cache' }
      if ($live.repository -eq $repositoryName -and $live.commit -eq $commit) {
        $verified = $true
        break
      }
    } catch {
      if ($attempt -eq 6) { throw }
    }
    Start-Sleep -Seconds 5
  }

  if (-not $verified) {
    throw "Cloudflare deployed, but $manifestUrl did not report commit $commit."
  }

  Write-Host "Production verified at https://sc-sk.com/ with commit $commit."
} finally {
  $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
  $isSafeTemp = $resolvedTemp.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -and
    ([IO.Path]::GetFileName($resolvedTemp) -like 'scsk-site-production-*')
  if ($isSafeTemp -and (Test-Path -LiteralPath $resolvedTemp)) {
    Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
  }
}
