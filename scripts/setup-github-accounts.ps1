# One-time setup for two GitHub accounts on the same machine.
# Company: rajeshuptulasoft | Personal: RajeshAPIMAN2000

Write-Host "`n=== GitHub multi-account setup ===" -ForegroundColor Cyan

# Store credentials separately per repo URL (not one account for all of GitHub)
git config --global credential.useHttpPath true
git config --global credential.https://github.com.useHttpPath true
Write-Host "[OK] Per-repo GitHub credentials enabled" -ForegroundColor Green

$sshDir = Join-Path $env:USERPROFILE ".ssh"
if (-not (Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }

$companyKey = Join-Path $sshDir "id_ed25519_company"
$personalKey = Join-Path $sshDir "id_ed25519_personal"

if (-not (Test-Path $companyKey)) {
  Write-Host "`nCreating SSH key for company account (rajeshuptulasoft)..." -ForegroundColor Yellow
  ssh-keygen -t ed25519 -C "rajeshuptulasoft@github" -f $companyKey -N '""'
  Write-Host "Add this key at https://github.com/settings/keys (signed in as rajeshuptulasoft):" -ForegroundColor Yellow
  Get-Content "$companyKey.pub"
}

if (-not (Test-Path $personalKey)) {
  Write-Host "`nCreating SSH key for personal account (RajeshAPIMAN2000)..." -ForegroundColor Yellow
  ssh-keygen -t ed25519 -C "RajeshAPIMAN2000@github" -f $personalKey -N '""'
  Write-Host "Add this key at https://github.com/settings/keys (signed in as RajeshAPIMAN2000):" -ForegroundColor Yellow
  Get-Content "$personalKey.pub"
}

Write-Host "`n=== Sign in both accounts (HTTPS / Git Credential Manager) ===" -ForegroundColor Cyan
Write-Host "Run these two commands and complete browser login for EACH account:`n"
Write-Host "  git credential-manager github login --username rajeshuptulasoft --browser"
Write-Host "  git credential-manager github login --username RajeshAPIMAN2000 --browser"

Write-Host "`n=== When adding a remote, pick the right account ===" -ForegroundColor Cyan
Write-Host @"

HTTPS (recommended with Git Credential Manager):
  Company:  git remote add origin https://rajeshuptulasoft@github.com/ORG/REPO.git
  Personal: git remote add origin https://RajeshAPIMAN2000@github.com/OWNER/REPO.git

SSH (after adding keys to GitHub):
  Company:  git remote add origin git@github-company:ORG/REPO.git
  Personal: git remote add origin git@github-personal:RajeshAPIMAN2000/REPO.git

"@

Write-Host "This project (money_trend) is configured for personal: RajeshAPIMAN2000" -ForegroundColor Green
