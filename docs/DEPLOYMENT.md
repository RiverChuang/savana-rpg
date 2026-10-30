# GitHub Pages deployment

Repository: https://github.com/RiverChuang/savana-rpg

Live game: https://riverchuang.github.io/savana-rpg/

The workflow publishes `dist/` after tests and checks. It needs contents:read, pages:write and id-token:write. Push main or run `gh workflow run deploy-pages.yml`. Pull requests run checks without deployment.

Official actions were checked against their GitHub release API on 2026-10-30: checkout v7.0.1, setup-node v7.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1. These are official GitHub actions, not a third-party deployment service.

References: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Pages REST API](https://docs.github.com/en/rest/pages/pages).

## Initial setup

1. Authenticate locally with `gh auth login`; do not place tokens in source or URLs.
2. Create the public repository only if it does not exist. Set origin to the intended repository.
3. Enable Pages with `gh api --method POST repos/OWNER/REPO/pages -f build_type=workflow`. If Pages exists, GET its current settings and PUT build_type=workflow only if needed. A 409 alone is not fatal.
4. Push main, inspect `gh run list --workflow deploy-pages.yml`, and verify the relevant run with `gh run view RUN_ID`.
5. Confirm Pages status and run `node scripts/verify-http.mjs LIVE_URL`.

The source uses relative module/style/asset paths. The local server's `/savana-rpg/` prefix exercises the repository-subpath deployment.

## Troubleshooting

- Apparent invalid token inside a restricted sandbox: verify `gh auth status` with network permission before asking the owner to authenticate again.
- Permission/403: check repository administration, Actions/Pages availability, and workflow token permissions. Do not delete/recreate the repository to fix this.
- Pages 404 on first publish: wait for a successful deployment, confirm build_type=workflow, and inspect logs rather than guessing new repository paths.
- JavaScript MIME errors: check deploy artifact paths with verify-http; ES modules must return a JavaScript content type.
- Local connection refused/denied: grant local preview server and readiness-check network permission. A sandbox-only server may not be reachable by the desktop browser.
- Save unavailable: game requires localStorage in the browser; no server/database stores player state. Moving between localhost and the live origin does not transfer saves.

Actual run ID, deployment evidence and acceptance results are recorded in [VALIDATION.md](VALIDATION.md).
