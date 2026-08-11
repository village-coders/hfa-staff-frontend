$base = "https://staff-portal-backend-mrxv.onrender.com/api/v1"
$headers = @{"Content-Type"="application/json"}

$methods = @("GET", "POST")
foreach ($m in $methods) {
    Write-Host "Probing $m /auth..."
    try {
        $res = Invoke-WebRequest -Uri "$base/auth" -Method $m -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "SUCCESS! Status: $($res.StatusCode) | Body: $($res.Content)"
    } catch {
        Write-Host "FAILED. Status: $($_.Exception.Response.StatusCode.value__)"
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Error: $($reader.ReadToEnd())"
        }
    }
    Write-Host ""
}
