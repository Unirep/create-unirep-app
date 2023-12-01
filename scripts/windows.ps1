$command = @"
echo "example"
Start-Sleep -Seconds 1
echo ""
Start-Sleep -Seconds 1
echo ""
"@

Invoke-Expression -Command $command | npx create-unirep-app
