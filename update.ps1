# 快速更新脚本 - 用于日常开发更新

param(
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

# 设置代理
$env:http_proxy="http://127.0.0.1:5388"
$env:https_proxy="http://127.0.0.1:5388"

Write-Host "提交并推送更改..." -ForegroundColor Green

git add .
git commit -m $Message
git push origin main

Write-Host "完成！GitHub Actions 将自动部署更新。" -ForegroundColor Green
Write-Host "查看部署状态: https://github.com/samiytaa/smart-task-panel/actions" -ForegroundColor Cyan
