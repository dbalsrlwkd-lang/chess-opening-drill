# 고친 내용을 빌드·검사하고 GitHub에 올려 사이트에 반영합니다.
# 사용: powershell -ExecutionPolicy Bypass -File tools/publish.ps1 "무엇을 고쳤는지 한 줄"
# 올리기 전에 deploy/sw.js 의 CACHE 버전 숫자를 하나 올려 두세요(폰이 새 버전을 받게 하는 신호).
param([string]$Message = "업데이트")
$ErrorActionPreference = 'Stop'
$env:Path += ";C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;C:\Program Files\nodejs"
Set-Location (Split-Path $PSScriptRoot -Parent)
node build.js
$last = node tools/validate.js opening-drill.html | Select-Object -Last 1
if ($last -notmatch 'problems: 0$') { throw "수순 검사 실패: $last" }
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { git commit -q -m $Message }
git push -q origin main
git subtree push --prefix deploy origin gh-pages
Write-Output "올렸어요. 1~2분 뒤 https://dbalsrlwkd-lang.github.io/chess-opening-drill/ 에 반영돼요."
