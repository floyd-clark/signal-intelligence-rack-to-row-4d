# Signal Intelligence

The approved symbol is the exact user-supplied PNG under `public/brand/signal-intelligence-symbol.png`. It is displayed at the top left and used as the browser icon. The source image remains unchanged; the header crops its outer black margins using CSS. No generated substitute, recoloring or external image URL is used.

The interface follows the image's near-black background, metallic silver wordmark and electric-blue accents. Shared CSS variables in `src/styles/main.css` define brand ink, surface, silver, accent, active background and borders. Buttons, links, tabs, sliders, chart accents and selection outlines use this palette. Diagnostic warning/failure/success colors and physical material colors retain their functional meanings.

The symbol is supplied for this project's branding; no third-party license or vendor affiliation is asserted. Keep it local so the production bundle runs offline. If a vector or transparent master is supplied later, replace this asset while retaining the accessible image name, proportions and surrounding spacing.

Current implementation evidence is in `evidence/v2/brand-desktop.png`, `brand-presentation.png`, `brand-1280.png` and `brand-verification.json`.
