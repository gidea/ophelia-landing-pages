# Ophelia landing pages

Six static landing-page concepts for Ophelia, an ophthalmology voice assistant.

## Designs

| Page | Design |
| --- | --- |
| `1.html` | Quiet Minimal |
| `2.html` | Neural Dark |
| `3.html` | Paper Editorial |
| `4.html` | Daylight |
| `5.html` | Product Shell |
| `6.html` | Ophelia Glass |

`index.html` is an exact copy of version 6. The bottom picker switches between all six designs; number keys 1–6 also work outside inputs and dialogs.

## Run locally

From the repository directory:

```sh
python3 -m http.server 4173
```

Open http://localhost:4173/ or a numbered page such as http://localhost:4173/4.html.

## Publish

GitHub Pages serves the repository root from the `main` branch. There is no build step or dependency installation. `.nojekyll` disables Jekyll processing. Push changes to `main` to publish updates.

The picker resolves the site base from its own script URL, so it works both at a domain root and under a GitHub Pages repository path. Use the `.html` links when sharing individual designs.

## Validate

```sh
node scripts/validate.mjs
```

## Structure

- `1.html`–`6.html`: page designs
- `index.html`: default homepage (version 6)
- `assets/`: local photography and logo files
- `shared/`: styles, glass effects and interaction scripts
- `scripts/`: dependency-free checks

These are marketing prototypes, not a clinical application. The UI examples do not record audio, connect to an EHR, or process patient data. Version 6's contact form is a front-end demonstration and does not deliver submissions. Integrations, product claims and privacy copy should be reviewed before a production launch.

This export excludes the original Sites hosting metadata, credentials, unrelated workspace files and previous Git history. The original hosted Site remains separate and unchanged.
