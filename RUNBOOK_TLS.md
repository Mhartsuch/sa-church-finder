# TLS Runbook for `sachurchfinder.com`

## Ownership

- Frontend custom domains: Render static service `sa-church-finder`
- Backend/API origin: Render web service `sa-church-finder-api`
- Edge/TLS termination: Render-managed edge/CDN in front of the static service
- Registrant/DNS owner: whoever controls the `sachurchfinder.com` DNS zone

## Current expected state

- `https://sachurchfinder.com` serves a valid certificate and returns `200 OK`
- `https://www.sachurchfinder.com` serves a valid certificate and redirects to `https://sachurchfinder.com/`
- `http://sachurchfinder.com` redirects to `https://sachurchfinder.com/`
- `http://www.sachurchfinder.com` redirects to `https://www.sachurchfinder.com/`, then to `https://sachurchfinder.com/`
- Render blueprint domains include both `sachurchfinder.com` and `www.sachurchfinder.com`
- Backend `CLIENT_URL` includes both `https://sachurchfinder.com` and `https://www.sachurchfinder.com`

## Renewal model

- Certificates are provider-managed by Render for the custom domains.
- No Certbot or manual ACME job should run inside this repo or app server.
- Renewal depends on the custom domains remaining attached in Render and the DNS records continuing to point at Render.

## Required Render settings

1. Open Render service `sa-church-finder`.
2. Confirm custom domains contain:
   - `sachurchfinder.com`
   - `www.sachurchfinder.com`
3. Confirm HTTPS is enabled for both domains and certificate provisioning shows healthy/issued.
4. Confirm redirect/canonical behavior keeps `www` pointed at the apex domain.

## Required DNS settings

Use the values Render shows in the custom domain setup screen if they differ from the examples below.

1. Apex/root:
   - Create the Render-recommended apex record for `sachurchfinder.com`.
   - Depending on DNS provider, this is usually one of:
     - `ALIAS/ANAME sachurchfinder.com -> sa-church-finder.onrender.com`
     - provider flattening/CNAME-style root alias to `sa-church-finder.onrender.com`
2. `www`:
   - `CNAME www -> sachurchfinder.com`
   - If Render instead requires `www -> sa-church-finder.onrender.com`, use Render's value.
3. Remove stale records that point the apex or `www` somewhere else.
4. If Cloudflare is used as the DNS provider, keep SSL mode set to `Full (strict)` and avoid any page rule that rewrites back to `http`.

## Verification commands

Run these after DNS or Render changes propagate.

```powershell
curl.exe -I -L https://sachurchfinder.com
curl.exe -I -L https://www.sachurchfinder.com
curl.exe -I -L http://sachurchfinder.com
curl.exe -I -L http://www.sachurchfinder.com
```

Expected results:

- final response for apex is `HTTP/1.1 200 OK`
- `www` redirects to `https://sachurchfinder.com/`
- all `http://` requests end on `https://`

Certificate spot-checks:

```powershell
$tcp = New-Object System.Net.Sockets.TcpClient('sachurchfinder.com', 443); try { $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, ({ param($sender,$cert,$chain,$errors) $script:certErrors = $errors; return $true })); $ssl.AuthenticateAsClient('sachurchfinder.com'); $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate); [PSCustomObject]@{ Subject = $cert.Subject; Issuer = $cert.Issuer; NotBefore = $cert.NotBefore; NotAfter = $cert.NotAfter; Errors = $script:certErrors } | Format-List * } finally { if ($ssl) { $ssl.Dispose() }; $tcp.Dispose() }
$tcp = New-Object System.Net.Sockets.TcpClient('www.sachurchfinder.com', 443); try { $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, ({ param($sender,$cert,$chain,$errors) $script:certErrors = $errors; return $true })); $ssl.AuthenticateAsClient('www.sachurchfinder.com'); $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate); [PSCustomObject]@{ Subject = $cert.Subject; Issuer = $cert.Issuer; NotBefore = $cert.NotBefore; NotAfter = $cert.NotAfter; Errors = $script:certErrors } | Format-List * } finally { if ($ssl) { $ssl.Dispose() }; $tcp.Dispose() }
```

Expected results:

- `Errors : None`
- certificate subject matches the requested host
- `NotAfter` is in the future

## Mixed-content guardrail

- The production CSP in `render.yaml` includes `upgrade-insecure-requests`.
- If browser console reports mixed content after deploy, grep the frontend source for `http://` and replace production asset or API URLs with `https://`.

## If TLS breaks again

1. Check Render custom domains first.
2. Check DNS for apex and `www` drift second.
3. Confirm the certificate is being presented for the requested host.
4. Re-run the verification commands above after each external change.
