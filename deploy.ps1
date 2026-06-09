# 部署脚本 - Smart Task Panel
# 此脚本会清理 dist，重新构建，并推送到 GitHub

Write-Host "开始部署流程..." -ForegroundColor Green

# 设置代理
$env:http_proxy="http://127.0.0.1:5388"
$env:https_proxy="http://127.0.0.1:5388"

# 清理 dist 目录
Write-Host "清理 dist 目录..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}

# 构建项目
Write-Host "构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

# Git 操作
Write-Host "准备提交更改..." -ForegroundColor Yellow
git add .

$commitMessage = Read-Host "请输入提交信息 (留空使用默认信息)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git commit -m $commitMessage

# 推送到 GitHub
Write-Host "推送到 GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "部署成功！GitHub Actions 将自动构建和部署网站。" -ForegroundColor Green
    Write-Host "网站地址: https://samiytaa.github.io/smart-task-panel/" -ForegroundColor Cyan
    Write-Host "GitHub 仓库: https://github.com/samiytaa/smart-task-panel" -ForegroundColor Cyan
} else {
    Write-Host "推送失败！" -ForegroundColor Red
    exit 1
}
