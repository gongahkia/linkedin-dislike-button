# Firefox Submission Packet

## Submit This File

Upload this exact package to AMO:

- `submission/firefox/respectful_reaction_button-2.1.0.zip`

Firefox accepts ZIP uploads for AMO submission. You do not need to rename this file to `.xpi`
for AMO.

## Do Not Submit These

Do not upload the repository root or any of these paths directly to AMO:

- `README.md`
- `README2.md`
- `AUDIT.md`
- `asset/`
- `safari-macos/`
- `.github/`
- `.git/`
- the parent `src/` folder itself as a folder upload

The AMO upload should be the packaged extension archive only.

## What Is Inside The Upload

The AMO archive currently contains exactly the extension runtime files Firefox needs:

- `manifest.json`
- `content.js`
- `styles.css`
- `popup.html`
- `popup.js`
- `popup.css`
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`
- `images/dislike.png`

## Source Code Submission

For this version, a separate AMO source-code upload should not be required because:

- the extension package is readable and unminified
- there is no bundler or transpilation step
- the build step only zips `src/` into an AMO upload archive

If Mozilla explicitly asks for source later, provide the repository source plus the build command
from `scripts/package-firefox.sh`.

## Recommended AMO Listing Values

Add-on name:

`Respectful Reaction Button`

Short summary:

`Adds a draft-only reaction action on linkedin.com and fills a respectful reply without posting automatically.`

Homepage:

`https://github.com/gongahkia/linkedin-dislike-button`

Support site:

`https://github.com/gongahkia/linkedin-dislike-button/issues`

Privacy policy URL:

Publish the privacy section from `README2.md` to a stable public URL, then use that URL here.

## Reviewer Notes

Paste the contents of `submission/firefox/reviewer-notes.txt` into the AMO reviewer-notes field.

## Verification Before Upload

Run these before every AMO submission:

```console
scripts/package-firefox.sh
```

Then confirm:

- `submission/firefox/respectful_reaction_button-2.1.0.zip` exists
- `submission/firefox/respectful_reaction_button-2.1.0.zip.sha256` exists
- the upload archive still contains only the extension files listed above

## Current Artifact Integrity

The current checksum is stored in:

- `submission/firefox/respectful_reaction_button-2.1.0.zip.sha256`
