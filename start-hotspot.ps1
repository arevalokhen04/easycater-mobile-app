# Start EasyCater hotspot on this PC (fixed IP: 192.168.137.1)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

Function Await($WinRtTask, $ResultType) {
  $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
  $netTask = $asTask.Invoke($null, @($WinRtTask))
  $netTask.Wait(-1) | Out-Null
  $netTask.Result
}

$profile = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetInternetConnectionProfile()
if (-not $profile) {
    # No internet profile - try the first available profile instead
    $profiles = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetConnectionProfiles()
    if (-not $profiles) { Write-Output "NO-CONNECTION-PROFILES"; exit 1 }
    $profile = $profiles[0]
}

$tetheringManager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::CreateFromConnectionProfile($profile)

$config = $tetheringManager.GetCurrentAccessPointConfiguration()
$config.Ssid = "EasyCater-Net"
$config.Passphrase = "easycater123"
Await ($tetheringManager.ConfigureAccessPointAsync($config)) ([Object]) | Out-Null

$result = Await ($tetheringManager.StartTetheringAsync()) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])
Write-Output ("Hotspot status: " + $result.Status)
Write-Output ("SSID: EasyCater-Net  Password: easycater123")
