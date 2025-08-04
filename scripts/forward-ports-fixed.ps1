# PowerShell script to forward ports from WSL2 to Windows
# Run this in Windows PowerShell as Administrator

# Get WSL2 IP address
$wsl2ip = (wsl hostname -I).trim().split()[0]
Write-Host "WSL2 IP: $wsl2ip"

# Get Windows IP address - improved detection
$windowsip = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {
        $_.InterfaceAlias -notmatch "WSL" -and 
        $_.InterfaceAlias -notmatch "vEthernet" -and
        $_.IPAddress -ne "127.0.0.1" -and
        $_.IPAddress -notmatch "^169\.254\." -and  # Exclude link-local
        $_.IPAddress -notmatch "^172\.(1[6-9]|2[0-9]|3[0-1])\." # Exclude Docker
    } | 
    Select-Object -ExpandProperty IPAddress -First 1

# If no IP found, try another method
if (-not $windowsip) {
    $windowsip = (Get-NetIPConfiguration | 
        Where-Object {
            $_.InterfaceAlias -match "Wi-Fi|Ethernet" -and 
            $_.IPv4DefaultGateway
        }).IPv4Address.IPAddress | Select-Object -First 1
}

Write-Host "Windows IP: $windowsip"

# Remove existing port forwarding rules
netsh interface portproxy delete v4tov4 listenport=5000 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0 2>$null

# Add port forwarding rules
netsh interface portproxy add v4tov4 listenport=5000 listenaddress=0.0.0.0 connectport=5000 connectaddress=$wsl2ip
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=$wsl2ip

# Show current port forwarding rules
Write-Host "`nCurrent port forwarding rules:"
netsh interface portproxy show all

Write-Host "`nPort forwarding set up successfully!"
Write-Host "You can now access your dev environment from your phone using:"
Write-Host "  Flask: http://${windowsip}:5000"
Write-Host "  Vite: http://${windowsip}:5173"

# Also show all available IPs for debugging
Write-Host "`nAll available network interfaces:"
Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {$_.IPAddress -ne "127.0.0.1"} | 
    Format-Table InterfaceAlias, IPAddress -AutoSize