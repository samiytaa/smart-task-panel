# 检查部署状态脚本

$env:http_proxy="http://127.0.0.1:5388"
$env:https_proxy="http://127.0.0.1:5388"

# 从环境变量读取 GitHub Token
$githubToken = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($githubToken)) {
    Write-Host "错误: 未设置 GITHUB_TOKEN 环境变量" -ForegroundColor Red
    Write-Host "请运行: `$env:GITHUB_TOKEN='your_token'" -ForegroundColor Yellow
    exit 1
}

$headers = @{ 
    Authorization = "token $githubToken"
    Accept = "application/vnd.github.v3+json" 
}

Write-Host "获取最新的 GitHub Actions 运行状态..." -ForegroundColor Green

$runs = Invoke-RestMethod -Uri "https://api.github.com/repos/samiytaa/smart-task-panel/actions/runs?per_page=5" -Method Get -Headers $headers

Write-Host "`n最近的部署:" -ForegroundColor Yellow
$runs.workflow_runs | Select-Object -First 5 | ForEach-Object {
    $statusColor = switch ($_.status) {
        "completed" { 
            if ($_.conclusion -eq "success") { "Green" } 
            else { "Red" }
        }
        "in_progress" { "Yellow" }
        default { "Gray" }
    }
    
    Write-Host "-----------------------------------" -ForegroundColor DarkGray
    Write-Host "工作流: $($_.name)" -ForegroundColor Cyan
    Write-Host "状态: $($_.status)" -ForegroundColor $statusColor
    Write-Host "结果: $($_.conclusion)" -ForegroundColor $statusColor
    Write-Host "时间: $($_.created_at)" -ForegroundColor Gray
    Write-Host "查看: $($_.html_url)" -ForegroundColor Gray
}

Write-Host "`n" -ForegroundColor Green
Write-Host "网站地址: https://samiytaa.github.io/smart-task-panel/" -ForegroundColor Cyan
Write-Host "GitHub 仓库: https://github.com/samiytaa/smart-task-panel" -ForegroundColor Cyan
