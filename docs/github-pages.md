# GitHub Pages implementation

## Purpose

The Pages site provides a public project landing page, a browser-based view of the existing graph explorer, and a multilingual Markdown documentation reader.

## Build layout

The workflow builds a static artifact from the checked-out commit:

- `site/index.html` → site root landing page.
- `index.html` → `explorer.html`, preserving the existing browser UI without making it the landing page.
- `site/docs.html` → documentation reader.
- `docs/`, `data/`, and `schemas/` → read-only static files used by the reader and examples.
- `.nojekyll` → avoids Jekyll processing of the artifact.

The documentation reader loads `docs/i18n/{language}/system-overview.md` from the deployed site and renders Markdown in the browser. It includes a source link to the corresponding file in GitHub. The renderer is loaded from a public CDN; if the CDN or browser network policy blocks it, the Markdown source remains available through GitHub.

## Workflow behavior

`.github/workflows/pages.yml` builds and uploads a Pages artifact for pushes to `main`, pushes to `hardening/**`, pull requests, and manual runs. Deployment is deliberately restricted to pushes/manual runs on `main`, so a feature branch cannot replace the production Pages site.

The workflow requires GitHub Pages to be configured with **GitHub Actions** as the build and deployment source. The repository's Pages settings and environment permissions must permit the workflow to deploy. A successful workflow run is required before the published URL can be considered verified.

## Limitations

- The site is static; it has no server-side API or private credentials.
- The existing explorer is copied as-is. This deployment does not automatically wire its UI to the validated corpus/query modules.
- Links to source code use the `hardening/graph-data-validation` branch as a review convenience; update these links if the release branch changes.
- The browser documentation renderer uses the Marked CDN and only renders repository-owned Markdown. Do not render untrusted user-submitted Markdown as HTML without sanitization.
- GitHub Pages publication is not confirmed until the Pages workflow succeeds on `main` and the deployed URL is checked.
