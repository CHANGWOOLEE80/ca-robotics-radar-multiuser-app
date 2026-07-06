# Work Hub / Mail Portal Guide

## Purpose
Work Hub connects the Radar App with frequently used internal work tools such as company mail and FabriX.

## Mail Portal Link
- URL: https://kor3.samsung.net/portalapp/home
- The mail portal opens in a new browser tab.
- If Samsung SSO is active in the intranet, users should be logged in automatically.

## Why mail is not embedded directly
Most corporate mail systems block iframe embedding from local or non-approved web origins through browser security policies such as X-Frame-Options or Content-Security-Policy. Directly reading mail also requires approved API access, SSO/OAuth integration, and IT security review.

Therefore, this version provides a safe bridge:
1. Open company mail portal in a new tab.
2. Generate mail draft text from Radar App data.
3. Copy and paste the draft into the mail system.

## Available Functions
- Open company mail system.
- Open FabriX Chat.
- Create mail drafts for weekly sharing, idea review, PoC review, vendor follow-up, and chat follow-up.
- Copy current Radar App work context.
- Show today's key context: top ideas, high priority technologies, ongoing PoCs, vendor follow-up, recent chat.

## Future Integration Options
Direct integration requires one of the following official mechanisms:
- Mail API or groupware API approved by IT.
- SSO/OAuth token-based integration.
- Iframe whitelist for the Radar App origin.
- Migration of Radar App to an approved internal web server domain.

Until then, Work Hub should be used as a launcher and mail drafting bridge.
