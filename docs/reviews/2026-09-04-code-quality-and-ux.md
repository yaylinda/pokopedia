# Pokopedia code quality and UI/UX review

Reviewed September 4, 2026, against `main` at `082834eea2cd4af5e7c6a662cc8324319d7a10af`.

Branch: `linda/repo-quality-ux-review`. The branch was created from freshly fetched `origin/main` in a separate worktree. The existing uncommitted `data/grouping-studio.json` in the original checkout was preserved. This report is the only committed change.

The review covered the app shell, roster and studio features, models and persistence, data ingestion and generation, tests, build/deployment configuration, README, schema documentation, and design guidance. The UI pass used independent source review and a static detector. No browser automation or rendered-page verification was performed, in accordance with the supplied agent instructions.

Priorities: **P1** = address first because correctness or user work is at risk; **P2** = meaningful improvement; **P3** = polish. No P0 issue was established.

## Pass 1: code quality and engineering

### C1 · P1 · Studio saves can overwrite other work and collide

**Evidence:** [vite.config.ts:7](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/vite.config.ts#L7), [vite.config.ts:68](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/vite.config.ts#L68), [src/modules/region-roster/GroupingStudioWorkspace.tsx:182](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L182), [src/modules/region-roster/RegionGroupPlanner.tsx:74](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionGroupPlanner.tsx#L74).

The API replaces the entire document with each PUT and uses one shared temporary filename. The frontend serializes requests only within one mounted studio instance. Changing region remounts that instance, creating a new queue and loading another copy of the document. Two tabs also have independent queues.

**Verified with the actual Vite middleware and disposable temporary data:** two saves based on the same starting document both returned 204, but the second discarded the first region's new scope. Five out of five pairs of simultaneous PUTs produced one 400 response from a failed temporary-file rename. Neither test touched the user's planning file.

**Improve:** give the server responsibility for concurrency. Apply scope-level changes against the latest document, or require a revision/ETag and reject stale writes; serialize the read/modify/write transaction and use unique temporary files. Keep pending document state above region navigation. Test two writers and a region switch while saving. A client queue alone cannot solve this.

### C2 · P1 · Roster moves and studio grouping disagree about evolution families

**Evidence:** [src/data/rosterConstraints.ts:35](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/rosterConstraints.ts#L35), [src/data/rosterConstraints.ts:111](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/rosterConstraints.ts#L111), [src/data/rosterConstraints.ts:147](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/rosterConstraints.ts#L147), [src/modules/region-roster/hooks/useRegionRosterWorkspace.ts:168](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/hooks/useRegionRosterWorkspace.ts#L168).

The studio builds families using the complete canonical graph, including form links. Roster moves and violation checks use a second graph whose edges are filtered to current residents *before* connected components are built. This disconnects relatives whose middle stage is missing.

**Verified on the current roster:** Zubat/Crobat, Horsea/Kingdra, and Lotad/Ludicolo each appear as separate one-Pokémon move groups. The three Tatsugiri forms are also split by the move graph. The studio groups those families together. Thus a roster move can split a family without the violation counter detecting it.

**Improve:** use one canonical family resolver everywhere, then intersect the complete family with the selected snapshot's residents. Keep placement mutations, displayed linked members, and violation checks on that same definition. Extend tests beyond studio grouping to the roster move path.

### C3 · P1 · Browser-storage recovery can erase saved user data

**Evidence:** [src/data/userData.ts:163](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/userData.ts#L163), [src/data/UserDataProvider.tsx:10](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/UserDataProvider.tsx#L10).

Malformed stored JSON becomes an empty default document, and the provider writes that default back immediately on mount. The original value is lost. Storage access itself is also unguarded: `getItem` sits outside the try/catch, and `setItem` has no error handling.

**Verified using an in-memory localStorage stub:** the read/write sequence replaces malformed saved content with an empty version-8 document. A thrown storage-read error escapes the reader.

**Improve:** return explicit success/missing/corrupt/unavailable states; preserve the original value for recovery; avoid writing defaults after a failed load; expose save failures and a backup/export path. Cover corrupted JSON, denied storage, quota failure, and schema migration.

### C4 · P2 · The documented home-plan generator no longer runs

**Evidence:** [README.md:53](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/README.md#L53), [scripts/generate_region_home_plan.py:18](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/scripts/generate_region_home_plan.py#L18), [scripts/generate_region_home_plan.py:275](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/scripts/generate_region_home_plan.py#L275), [docs/region-home-plan.md:1](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/docs/region-home-plan.md#L1).

The generator still has five hardcoded region targets totaling 308, while the current catalog has **367** entries. Running it with temporary output paths fails with `ValueError: Region targets cannot accommodate hard assignments`. The checked-in report and JSON are a July 27 plan for 308 Pokémon across five regions and 86 homes.

The generator also consumes the complete catalog without excluding Ditto, does not use the canonical evolution-family constraints, and requires the litter file even though README calls that input optional. Fixing only the capacity error would leave those policy differences.

**Improve:** either label and archive this as a historical experiment, or update its scope, capacities, resident exclusions, and family rules before presenting it as the supported planning command. Add a deterministic smoke test against checked-in inputs. Do not silently regenerate the user's current roster.

### C5 · P2 · Resident identity and counts are inconsistent

**Evidence:** [src/data/currentRegionRoster.ts:342](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/currentRegionRoster.ts#L342), [src/data/rosterSnapshots.ts:64](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/rosterSnapshots.ts#L64), [src/modules/region-roster/hooks/useRegionRosterWorkspace.ts:101](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/hooks/useRegionRosterWorkspace.ts#L101), [src/modules/region-roster/groupPlannerModel.ts:321](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/groupPlannerModel.ts#L321).

The current data contains **355 placements representing 344 unique slugs**. The snapshot sets both eligible and assigned counts to 344, so the header's “Placements” value is wrong. Meanwhile overrides are keyed by species slug, the roster retains placement records, and studio family construction deduplicates by slug.

**Verified example:** modeling Gyarados into Palette Town produces two Gyarados records in the roster, but one in studio family output.

**Improve:** define whether a planner entity is a species or an individual placement. Use stable instance IDs if duplicates are intentional; enforce one placement per slug if they are not. Separately fix the header to use the existing placement count. Do not delete duplicate source records without resolving their meaning.

### C6 · P2 · Persistence validation is inconsistent and silently repairs incompatible data

**Evidence:** [vite.config.ts:51](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/vite.config.ts#L51), [src/modules/region-roster/groupingStudioModel.ts:104](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/groupingStudioModel.ts#L104), [src/data/userData.ts:130](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/userData.ts#L130), [src/modules/region-roster/groupingStudioApi.ts:31](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/groupingStudioApi.ts#L31).

The server checks only the top-level version and that scopes is an object; it accepts malformed nested scopes. The client parser never rejects an unsupported studio schema version: a version-999 document was parsed as version 1. Invalid data is often reduced to empty defaults, while all load failures become a bundled read-only result. These behaviors make corrupted input, future versions, and unavailable services hard to distinguish.

**Improve:** define one validated document contract, reject unsupported versions, and implement explicit migrations. Share compatible validators between the API and browser. Preserve invalid originals and distinguish unavailable/read-only/invalid states. TypeScript assertions on JSON do not provide runtime validation.

### C7 · P2 · CI and local tooling miss the failure paths that matter

**Evidence:** [.github/workflows/deploy.yml:27](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/.github/workflows/deploy.yml#L27), [package.json:6](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/package.json#L6), [tsconfig.app.json:20](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/tsconfig.app.json#L20), [tests/groupingStudioModel.spec.ts:20](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/tests/groupingStudioModel.spec.ts#L20).

Both PR verification and main deployment run the build but skip lint and tests. The 13 tests cover model behavior, not persistence, API writes, roster move behavior, routing, or the Python pipeline. Their Playwright runner starts Vite SSR servers without opening a browser; one passing run emitted a dependency-scan shutdown warning.

CI uses a floating Node version and upgrades to `npm@latest`. The repository has no runtime pin or engines declaration; this machine's default shell resolves Node 16, requiring a newer runtime for validation. TypeScript strict mode is absent, although an explicit strict-mode check currently passes.

**Improve:** run lint, typechecking, model/integration tests, and a generator/data-validation smoke check before deployment, including direct main pushes. Pin the supported Node/package-manager setup and document it. Enable strict mode. Centralize test setup and avoid unnecessary dependency scanning in model-only tests. Add tests for C1–C6 before broadening happy-path coverage.

### C8 · P2 · Large UI modules and obsolete APIs blur ownership

**Evidence:** [src/modules/region-roster/GroupingStudioWorkspace.tsx:71](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L71), [src/modules/region-roster/EvolutionPregroupWorkspace.tsx:44](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/EvolutionPregroupWorkspace.tsx#L44), [src/modules/region-roster/RegionRosterWorkspace.tsx:57](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionRosterWorkspace.tsx#L57), [src/data/UserDataProvider.tsx:67](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/UserDataProvider.tsx#L67), [src/data/userDataContext.ts:9](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/userDataContext.ts#L9).

Three feature files are approximately 1,100–1,300 lines each. The studio owns persistence, mutation rules, drag state, filtering, layout, and many child views. Shared `EvolutionGroupCard` lives in a file named for an older workspace; that workspace export has no current caller. The old `rosterGroupsByScope` setter also has no UI consumer, while those saved groups remain in storage.

This is a concrete maintenance problem: save lifetime depends on presentation lifecycle, and older group APIs imply functionality the current UI cannot access.

**Improve:** extract a studio document controller, pure neighborhood mutation functions, and focused view components. Move shared family cards/details into explicitly named components. Decide how to expose/export/migrate legacy groups before retiring their UI-facing API; preserve their data. Consolidate repeated visual styles into a small set of semantic tokens as components are extracted. Avoid introducing a general-purpose framework for this personal app.

### C9 · P2 · Data delivery is heavy despite route splitting

**Evidence:** [src/data/currentRegionRoster.ts:1](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/currentRegionRoster.ts#L1), [src/data/favoriteCategories.ts:1](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/favoriteCategories.ts#L1), [src/data/rosterSnapshots.ts:59](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/data/rosterSnapshots.ts#L59), [src/modules/region-roster/groupPlannerModel.ts:236](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/groupPlannerModel.ts#L236).

The production build emits a **1,319.03 kB shared roster chunk** and a **1,444.64 kB planner chunk** after minification, plus a 255.73 kB entry chunk. Their gzip sizes are 159.41, 203.68, and 79.76 kB respectively. Full source-rich JSON catalogs and eager snapshots become JavaScript modules. Compatibility calculation scans the complete item/category index for each family.

The bundle sizes are measured; no claim of observed interaction lag is made.

**Improve:** generate lean frontend projections while retaining source-rich ingestion data, load historical snapshots on demand, and separate detailed item catalogs from the basic roster path. Cache or index compatibility calculations if profiling confirms they matter. Keep the existing lazy planner boundary; merely suppressing the chunk warning would not reduce payload.

### C10 · P2 · README and design/agent guidance have drifted

**Evidence:** [README.md:10](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/README.md#L10), [README.md:30](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/README.md#L30), [.impeccable.md:10](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/.impeccable.md#L10), [.impeccable.md:16](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/.impeccable.md#L16), [scripts/pokopia-data-schema.md:1](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/scripts/pokopia-data-schema.md#L1).

- README describes the roster and GitHub Pages but omits the full-screen grouping studio, its dev-server-only write API, and the Sites worker/build output.
- Setup omits supported runtime versions, lint/tests, persistence locations, backup/recovery, and the distinction between browser-only roster overrides and file-backed neighborhoods.
- The prominently documented generator is broken; its generated report is historical.
- The design guide still specifies comfort-first grouping, while the roster implementation is habitat-first. It describes localStorage as the working store with import/export backups, but studio state is file-backed and no current import/export UI exists.
- The data-schema document mixes “proposed” structures with implemented contracts and does not cover studio/user-data schemas.
- **No tracked AGENTS.md, CLAUDE.md, or copilot instruction file exists in this checkout.** The agent instructions supplied in this conversation were followed; there is no obsolete tracked agent file to remove.

**Improve:** document the actual workflows, data ownership, supported commands, deployment capabilities, and historical artifacts. Update the design context to match current deliberate choices. If repo-contained agent guidance is desired, add one short AGENTS.md linking to maintained documentation and recording the browser-verification restriction and validation cadence.

### C11 · P2 · Refresh and triage the locked dependencies

A fresh `npm ci` / `npm audit` reports **10 affected packages: 7 high, 1 moderate, 2 low**. The lock resolves Vite 8.0.8 and React Router 7.15.0; the audit reports available fixes. These are dependency advisories, not evidence of an exploitable deployed app.

For example, the [Vite advisory](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) applies to specific Windows/network-exposed dev-server conditions, and the [React Router open-redirect advisory](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) requires the relevant navigation input path. Other router findings concern server features this app does not visibly use.

**Improve:** refresh compatible versions in a separate change, distinguish dev-tool and runtime exposure, and run the normal checks. Do not treat every audit severity as a demonstrated app vulnerability or perform an unreviewed major-version upgrade.

## Pass 2: UI/UX

### Overall assessment

Keep the compact, habitat-first cards, Pokémon portraits, family-level studio placement, and light game-companion palette. These are purposeful choices. The strongest opportunity is making experimentation recoverable and detailed comparisons easier, rather than replacing the visual direction.

**What works:** the Unassigned/Neighborhoods split supports the planning task; drag actions have a Move-menu alternative; explanatory empty states and family-level grouping reduce manual work. The app includes named controls, focus styles, a skip link, and search announcements. Its repeated cards represent real planning objects, so repetition alone is not a design defect.

### U1 · P1 · Destructive edits have no Undo

**Evidence:** [src/modules/region-roster/GroupingStudioWorkspace.tsx:258](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L258), [src/modules/region-roster/GroupingStudioWorkspace.tsx:601](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L601), [src/modules/region-roster/RegionRosterWorkspace.tsx:281](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionRosterWorkspace.tsx#L281).

Deleting a neighborhood immediately saves its removal and returns its families to Unassigned. The four-second snackbar has no action. The arrangement must be reconstructed from memory. “Reset moves” also acts immediately.

**Improve:** add Undo that restores the exact neighborhood name, membership, and order, and undoable roster resets. Preserve quick editing without adding a confirmation to every ordinary action.

### U2 · P1 · Save/load failures offer no actionable recovery

**Evidence:** [src/modules/region-roster/GroupingStudioWorkspace.tsx:197](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L197), [src/modules/region-roster/GroupingStudioWorkspace.tsx:755](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L755), [src/modules/region-roster/groupingStudioApi.ts:31](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/groupingStudioApi.ts#L31).

“JSON save failed” is only a chip/tooltip. There is no Retry, backup download, or durable unsaved draft; closing or changing region can discard the in-memory version. Intentional hosted read-only mode and a local load failure look the same.

**Improve:** show “Changes not saved” with Retry and Download backup, preserve drafts through navigation, distinguish read-only hosting from service failure, and announce state changes in a live status region. Fix C1 alongside this; better feedback cannot compensate for unsafe writes.

### U3 · P2 · Favorite details need a stable reading surface

**Evidence:** [src/modules/region-roster/EvolutionPregroupWorkspace.tsx:327](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/EvolutionPregroupWorkspace.tsx#L327), [src/modules/region-roster/EvolutionPregroupWorkspace.tsx:736](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/EvolutionPregroupWorkspace.tsx#L736), [src/modules/region-roster/EvolutionPregroupWorkspace.tsx:922](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/EvolutionPregroupWorkspace.tsx#L922).

The outer favorites tooltip contains detailed ranked items and category previews; categories open nested tooltips. The outer content has no viewport-height bound or scrolling. The transient structure makes sustained comparisons harder; exact clipping and focus behavior require rendered verification.

**Improve:** retain compact hover/focus previews and add an explicit control that pins a bounded, scrollable details panel. Show shared categories before exact items and keep Pokémon names available there. This can preserve compact cards without restoring expansion-heavy layouts.

### U4 · P2 · The studio's minimum width affects desktop accessibility

**Evidence:** [src/modules/region-roster/GroupingStudioWorkspace.tsx:373](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/GroupingStudioWorkspace.tsx#L373).

The columns require 360 + 520 = **880px**, with horizontal overflow and no narrow-layout breakpoint. Narrow desktop windows and zoomed laptop screens cannot keep the source pool and destination visible together; phones inherit the limitation.

**Improve:** preserve two panes at comfortable desktop widths. Below that, offer labeled Unassigned/Neighborhoods views with persistent placement context and the existing Move control. Validate zoom and keyboard navigation when browser verification is authorized.

### U5 · P2 · Small selected rating numerals have low contrast

**Evidence:** [src/modules/region-roster/RegionRosterWorkspace.tsx:1024](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionRosterWorkspace.tsx#L1024), [src/modules/region-roster/RegionRosterWorkspace.tsx:1119](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionRosterWorkspace.tsx#L1119).

Near-white 0.72rem numerals appear on the selected Like/Usefulness fills. Calculations from the source OKLCH values give approximately **3.39:1** and **3.74:1** contrast, below the usual 4.5:1 target for small text. The latter is an sRGB clipping estimate; actual rendering was not measured.

**Improve:** darken the fills or use dark numerals, then check the rendered colors. Keep the compact scale and meaningful rating colors.

### Smaller UI improvements

- **P2:** ratings support nullable state but provide no Clear action after choosing 1–5. Add a compact reset-to-unrated action and ensure the state model distinguishes that from “use the default.” [src/modules/region-roster/RegionRosterWorkspace.tsx:1093](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionRosterWorkspace.tsx#L1093)
- **P2:** studio portraits depend on recognition; add individual names on hover/focus and a failed-image fallback while keeping names from overwhelming cards. [src/modules/region-roster/components/PlannerVisuals.tsx:30](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/components/PlannerVisuals.tsx#L30)
- **P3:** simplify “Visualize JSON snapshot,” graph-node/edge counts, and “Committed JSON” into task language. Keep file/source provenance in secondary details. [src/modules/region-roster/components/RosterPageHeader.tsx:67](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/components/RosterPageHeader.tsx#L67)
- **P3:** the group-planner tab automatically opens a full-screen dialog, whose open state is not represented in the URL. A dedicated route would make back/forward behavior and state ownership simpler. This is an architectural/interaction opportunity, not a reason to remove the focused studio. [src/modules/region-roster/RegionGroupPlanner.tsx:19](https://github.com/yaylinda/pokopedia/blob/082834eea2cd4af5e7c6a662cc8324319d7a10af/src/modules/region-roster/RegionGroupPlanner.tsx#L19)

### Provisional usability score

These are source-review estimates, not measured usability or accessibility results.

| Heuristic | Score / 4 | Main observation |
| --- | ---: | --- |
| Visibility of system status | 2 | Save indicator exists; announcements/recovery are incomplete |
| Match to real-world tasks | 3 | Good domain language, with some implementation terminology |
| User control and freedom | 2 | Move/close controls, but no deletion Undo or rating clear |
| Consistency and standards | 3 | Cohesive controls; nested tooltip interaction is less predictable |
| Error prevention | 2 | Studio family rules help; destructive actions remain easy |
| Recognition rather than recall | 3 | Portraits and summaries help; recovery requires recall |
| Flexibility and efficiency | 3 | Search, skill filters, drag and Move alternatives |
| Aesthetic and minimalist design | 3 | Purposeful compact structure; rendered composition unverified |
| Error recovery | 1 | No direct save/load recovery actions |
| Help and documentation | 2 | Helpful empty states; guidance and docs have gaps |
| **Total** | **24 / 40** | **Preserve the foundation; prioritize reliable editing** |

Cognitive-load checklist: single focus, semantic chunking, grouping, one decision at a time, and progressive disclosure pass from source; hierarchy is a provisional pass. Two cautions produce a **moderate** rating: up to nine skill choices and many destinations, plus reconstructing deleted arrangements from memory. Familiar ratings and expert filters should not be hidden merely to satisfy an arbitrary item-count limit.

Two walkthroughs informed the review. An experienced player can search, compare, and place families efficiently, but deletion or failed saving undermines the end of that session. A keyboard/low-vision planner benefits from named Move controls and focus cues, but zoom, small rating text, and transient detail/status content need attention. These are heuristic walkthroughs, not observed user tests.

### Static detector result and limitations

Impeccable 2.3.2 scanned 31 source files, including 15 TSX files, and returned **zero flags**. No false positives were reported. Its implementation uses regex-based TSX checks and does not evaluate MUI `sx` objects or theme object styles, where most of this app's design lives. Therefore the clean result does not validate contrast, layout, or accessibility, and does not override the source findings above. No strong source evidence supports replacing the app's visual identity as “generic AI design.”

## Validation and recommended sequence

| Check | Result |
| --- | --- |
| Fresh dependency installation | Passed under Node 24.19.0 |
| `npm run lint` | Passed |
| `npm run build` | Passed; two chunks exceed the size-warning threshold |
| `npm test` | 13 passed; Vite dependency-scan shutdown warning |
| TypeScript with `--strict` | Passed |
| All checked-in data JSON parsing | Passed |
| Python script syntax parsing | Passed |
| Catalog/preference coverage | 367 records in each; no catalog slug missing preferences |
| Home-plan generator with temporary outputs | Failed with capacity error |
| Isolated API stale-writer/concurrency probes | Reproduced lost scope and temporary-file collision |
| SSR model and storage-stub probes | Reproduced family, count, and recovery inconsistencies |
| Browser/UI verification | Not performed |

Recommended order:

1. Repair studio concurrency and persistence recovery, with focused regression tests; add Undo alongside the reliable save path.
2. Unify family resolution and clarify resident identity/counts.
3. Restore or retire the historical generator; update README/design guidance and CI/runtime settings.
4. Improve persistent favorite details, narrow-window behavior, and rating contrast.
5. Extract the large feature modules and reduce catalog payload where measured costs justify it.

This review makes no application, dependency, roster, or design changes. It provides the evidence and scope for separate implementation commits.
