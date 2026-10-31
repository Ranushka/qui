# Penpot library rebuild — todo

Worked one item per /loop iteration by a subagent. Each iteration: take the first unchecked item, do it, verify it,
tick it here with a one-line result (date, what was built, revision), then stop. Never start a second item in the same
iteration. If an item is blocked (tab asleep, plugin not answering), write the blocker under the item and stop.

## Rules (hard — read before every iteration)

1. **Instances only.** (Decision 2026-10-31: layout primitives — Box, Stack, Inline, Grid, and look-less containers
   like List, Tabs, TableHeader/TableBody — are plain auto-layout frames named after the primitive, with spacing bound
   to tokens. Every qui component with a look of its own is an instance.) Screens and composed components may only use instances of qui Penpot components. If a qui
   component has no Penpot component, build its set first (spec in `apps/playground/src/spec/specs.tsx`, extract,
   `B.run`). Never draw a qui component as plain frames; never patch a screen in place with hand-sized frames. The
   builder throws when a component or variant is missing — fix the library, never work around the throw.
2. **Folders mirror `packages/ui/src`.** Pages: Foundations, Atoms, Molecules, Organisms (Examples and screens on their
   own pages). A set lives on the page of its folder; its component path is `<Level> / <Component>`, or
   `<Level> / <File> / <Component>` when the file holds several (`Organisms / Table / TableRow`,
   `Organisms / TableCells / MoneyCell`, `Molecules / List / ListItem`). `B.LEVEL_OF` / `comp-paths.json` is the map.
3. **Few variants.** Default variant, then one property changed at a time (`oneAtATime`), plus only the combinations a
   real screen renders. Fixed slot counts + clipping (TableRow 12 slots, Table 20 rows) instead of per-count variants.
4. **Dependency order.** Build a set only after every set it nests. Rebuilding a set replaces its component, so rebuild
   every set that nests it afterwards (e.g. TextCell → TableCell → TableRow → Table).
5. **Saving.** Also check every save's HTTP status in the proxy log — a `400` (a save cut off when the tab slept) stops
   all saving for the session without any backend error:
   `ssh ranu@192.168.0.104 "docker logs --since 5m compose-hack-solid-state-sensor-19p4dq-penpot-frontend-1 2>&1 | grep update-file | grep -o 'HTTP/[0-9.]*\" [0-9]*' | sort | uniq -c"`.
   After a 400, stop and ask the user to reload the tab (unsaved work since the last saved revision is lost — rebuild it).
   Wait for the revision to move after each build before going idle.
   Original rule: After each build, check the server saved it:
   `ssh ranu@192.168.0.104 "docker exec compose-hack-solid-state-sensor-19p4dq-penpot-postgres-1 psql -U penpot -d penpot -At -c \"select revn, modified_at from file where id='a9173937-72c5-8185-8008-cae8d0f199ef'\""`
   and the backend log for `E app.http.errors`. A rejected save stops all saving for the session — stop and report.
6. **Penpot tab (user, 2026-10-30: "you do it when needed").** The working Penpot tab is the main session's
   claude-in-chrome tab (qui file open, keep-awake shim injected). When saves stall or the tab is suspended, the
   subagent stops and reports; the main session reloads that tab itself — only after the last build's save has landed —
   reopens the qui file from the dashboard, re-injects keep-awake, and checks one save. Never ask the user to reload.
   **Flush, don't reload:** while the tab is hidden Penpot holds saves back; navigating the tab to the dashboard
   (`#/dashboard/recent?team-id=a9173937-72c5-8185-8008-bbf8c80db4b4`) sends every pending change (rev 251 → 253 with
   nothing lost, 2026-10-30), then double-click the qui file to reopen it. So on a stall the subagent stops and reports
   "needs flush"; the main session flushes, re-injects keep-awake, and resumes. A real reload is only for a 400.
   Plugin details: One `execute_code` call ≤ ~90 s of work (the MCP times out at 120 s); reload the builder each call:
   `(0, eval)("(()=>{" + await (await fetch("/qui-tmp/builder2.js?" + Date.now())).text() + "})()")`.
   If calls fail with "suspended" or hang, and the MCP log shows "Duplicate connection", restart the MCP container
   (`docker restart compose-hack-solid-state-sensor-19p4dq-penpot-mcp-1`). Otherwise stop and report to the main session (it
   reloads the tab). Never log in, never type passwords, never drive Dokploy in a browser.
7. **Work slowly with Penpot** (user, 2026-10-30). One set or one finish step per `execute_code` call, under ~30 s of
   work; never chain several sets in one call. Pause ~20–30 s after each call so the tab repaints and saves, and check
   the saved revision advanced before the next build. On a timeout or "suspended", retry at most once after a pause,
   then stop and report — never retry in a tight loop.
8. **Page cap: 3,000 shapes** (raised from 1,500 by the user, 2026-10-30) (all layers, nested included: `page.findShapes().length`). Pages above that froze the
   tab (Organisms hit 4,314 with the table sets). Check the count before and after every build. A level page that would
   pass the cap is split by file, keeping the folder structure: `Organisms · Table`, `Organisms · TableCells`, … (the
   component paths stay `Organisms / Table / …`). Keep pages few: split only when the cap forces it, moving just the
   heaviest file's sets, never one page per file by default. A single set that alone passes ~1,200 shapes must be cut down
   (fewer variants or slots) before it is built.
9. **Code rules.** Never pass className/style into qui components. Don't run prettier on whole files. Keep `design/`
   untracked. Run Bash through `rtk` (`rtk proxy <cmd>` fallback). Don't commit or push.
10. **Verify by looking.** Export the set or screen (`export_shape`) and compare with the code / live page screenshot
   (agent-browser on `http://[::1]:5199`). Text missing in an export right after a build is a render delay: re-export.

## Pipeline reference

- Spec sheet `#/spec` → `extract2.js` via agent-browser (viewport 1600×900, `window.__x2={key,cells:"[data-spec]"}`) →
  relay :8777 → `store-<key>.json` → `node split-specs.mjs store-<key>.json` → `./push.sh spec-<N>.json spec-<N>.js`.
- Sets: `await B.run(name)` once per `execute_code` call, until it returns `done:true` (each call works ≤ ~20 s, resumes
  where the last stopped: drop → build 3 variants per batch → settle → fix → finish; a call after `done:true` or with
  `{restart:true}` rebuilds). Options `{budget, batch, pause}`. Wait for the revision + HTTP 200 between calls.
- Screens: viewport 1440, `window.__x2={key:"scr-<name>", root: <element>}`, push `store-scr-<name>.json` as
  `scr-<name>.js`, then `B.page(...)`, `B.screenPlan(key, tree, 0, 0)` (parts ≤ 60 nodes), then `await B.screenStep(key)`
  once per call until it returns `done:true` / a `root` (≤ ~20 s per call; a big instance part, e.g. the whole Table, is
  placed whole and its slot overrides are spread over calls — `staged: "content 6/15"`).
- Yields inside the plugin use `B.nap(ms)` (≤ 500 ms; races setTimeout with a tiny fetch, since a backgrounded tab
  throttles setTimeout — a 300 ms `B.sleep` measured 16 s). Never use long `B.sleep`s in a build.
- Builder: `tools/design-sync/builder2.js` (push after every edit). Foundations: `foundations.js`.

## Items

- [x] **1. Folder structure.** Generate `comp-paths.json` (component → level/file) from `packages/ui/src`; builder sets
      each set's page and component path from it; move the table sets (Tables page) to Organisms with paths
      `Organisms / Table / …` and `Organisms / TableCells / …`; remove the Tables page; existing sets get their paths.
      _Partly done by a stopped run (2026-10-30, rev 219): comp-paths.mjs/json written, builder/specs edited, table sets
      moved to Organisms (now 4,314 shapes — over the cap). Finish it under rule 8: Table → 1 variant (striped,
      comfortable) with `TABLE_ROWS = 14`; put the table sets on `Organisms · Table` / `Organisms · TableCells` pages
      if Organisms would pass 1,500; check every set's path; remove the empty Tables page; re-test "Test · Table"._
      **Done 2026-10-30, rev 225:** Table rebuilt as 1 variant (striped, comfortable), `TABLE_ROWS = 14` (Table set 3,746 →
      ~880 shapes), so Organisms is 1,450 and no split page was needed (builder `B.pageOf` / `B.SPLIT_FILES` is ready for
      `"Organisms/Table"` when item 6 adds sets); all 34 built sets' paths match `packages/ui/src`; Tables page removed;
      "Test · Table" rebuilt from instances and matches. Pages: Examples 1,520 (over cap, not a level page), Dashboard 1,449,
      Foundations 969, Atoms 762, Molecules 1, Organisms 1,450, Test · Table 875.
- [x] **2. Card number space.** Done 2026-10-30, rev 229: extract2.js keeps whitespace the browser renders; builder
      gives a text ending in a space a fixed (browser) width because Penpot's auto-width drops trailing spaces;
      MaskedCell rebuilt; "Test · Table" rebuilt and exported — Card column reads "•••• 6187" like the live page.
- [x] **3. Lighter builds.** Builder yields between batches (await a short sleep every few variants) so the tab stays
      responsive and saves between steps; no call blocks the tab for more than ~20 s at a time.
      **Done 2026-10-30, rev 237:** `B.run` resumable (≤ 20 s/call, 3 variants per batch, `B.nap` between steps, `done`
      flag); `B.pump`/`B.finish`/`B.screenStep` async with naps; `screenPlan` parts ≤ 60 nodes; big instance parts staged
      (override split into swap/content leaves across calls, instance never split). Badge 2 calls (11.5 s), Table 2 calls
      (15.4 s, 4.1 s), "Test · Table" 3 steps (18.8 s, 16.9 s, 3.6 s), all saves 200, export matches; Atoms 762, Organisms
      1,450, Test · Table 875. Note: the tab suspends when backgrounded (2 "suspended" errors, recovered after a pause).
- [x] **4. Atoms.** Rebuild every atom spec in dependency order with the alias-token fix (Icon, Badge, Button,
      IconButton, Pill, Avatar, AvatarGroup, Swatch, Shortcut, WorkspaceAvatar, Heading, Spinner, LogoSpinner,
      CircularProgress, LinearProgress, Separator, Checkbox, Radio, Switch, Toggle, IconToggle, AnchorButton,
      TextButton, Input, NumberField, TextArea, Slider, Skeleton, Tooltip, CheckboxGroup, RadioGroup), then any set
      that nests them. Zero raw hex where a token exists.
      _Blocked 2026-10-30 (stopped run): spec sheet re-extracted (`store-sall18.json`) — only React auto-id diffs, the
      pushed spec files already carry the alias fix, nothing pushed. Rebuilt and saved (all update-file 200, rev 237 → 247):
      Icon 8, Button 17, IconButton 16, Pill 9, Avatar 20, AvatarGroup 8, Swatch 5, Shortcut 2, WorkspaceAvatar 9, Heading 9
      variants, hex 0 for all, paths `Atoms`; Atoms 762 shapes. Spinner (2 variants, hex 0) was then built at ~19:39 UTC but
      the tab stopped saving: no update-file request at all (no 400 either) for 10+ min, revision stuck at 247, the
      notifications websocket closed at 19:45:02 and did not reconnect, while the plugin still answered. The user must
      reload/wake the Penpot tab; then rebuild Spinner (unsaved) and continue: LogoSpinner, CircularProgress,
      LinearProgress, Separator, Checkbox, Radio, Switch, Toggle, IconToggle, AnchorButton, TextButton, Input, NumberField,
      TextArea, Slider, Skeleton, Tooltip, CheckboxGroup, RadioGroup; then UserCell, ProgressCell → TableCell → TableHead →
      TableRow → Table, re-test "Test · Table". Note: Avatar was rebuilt, so UserCell / AvatarGroup instances in built
      sets need the dependant rebuilds (AvatarGroup already redone after Avatar)._
      _Blocked again 2026-10-30 ~20:03 UTC (stopped run): after the tab reload, Spinner and LogoSpinner are saved (rev 251;
      LogoSpinner 2 variants, hex 0, sits below Spinner so it is current). CircularProgress was rebuilt at 19:58:24 (6
      variants, 18 colours bound, hex 0, one B.run call, 12.7 s), but no update-file request followed (no 400 either) and
      the tab sent no HTTP request at all after 19:58:24, while the plugin still answered. Revision stuck at 251 for 4+ min.
      Main session: reload the tab, then rebuild CircularProgress (unsaved) and continue: LinearProgress, Separator,
      Checkbox, Radio, Switch, Toggle, IconToggle, AnchorButton, TextButton, Input, NumberField, TextArea, Slider, Skeleton,
      Tooltip, CheckboxGroup, RadioGroup; then UserCell, ProgressCell → TableCell → TableHead → TableRow → Table, re-test
      "Test · Table". The Atoms page still has old copies of LinearProgress, Separator, Radio, Switch, Toggle, Checkbox at the
      top (B.run drops them). Atoms 762 shapes on the plugin's view._
      _Run 2026-10-31 (progress, updated as sets land): CircularProgress saved rev 253. LinearProgress 10 variants hex 0
      (rev 255), Separator 2 hex 0 (256), Checkbox 8 hex 0 (258), Radio 4 hex 0 (259). Fix: disabled Checkbox ring
      (`shadow-[inset…var(--txt-disabled)]`) and Radio ring (`currentColor`) had no token — extract2.js now falls back to
      the text-colour token for shadow rings, drops no-op shadows (0/0/0/0) and never picks `--border-width-*` as a
      colour; specs Checkbox/Radio/NumberField/Input/TextArea patched to match and pushed. Switch 6 (260), Toggle 6 (261),
      IconToggle 6 (262), AnchorButton 9 (263), TextButton 6 (264), all hex 0. Fix: Input threw "no Penpot component
      for Input" (its inner `<input>` carries the Input tag) — `make()` now skips nodes tagged with the set's own
      component (`ctx.owner`), as `domLeaves` already did; builder pushed. Input 8 (266), NumberField 4 (267), TextArea 6
      (268), hex 0. Slider 6 (269), Skeleton 2 (270), Tooltip 1 (271), CheckboxGroup 3 (272), RadioGroup 3 (273), hex 0.
      All atoms done; Atoms 1,155 shapes. Organisms: UserCell 2 (274), ProgressCell 4 (275), TableCell 6 (276), TableHead
      10 (277), TableRow 6 (279), Table 1 (281), hex 0, Organisms 1,450. "Test · Table" rebuilt from instances (3
      screenSteps, rev 285), export matches (Card "•••• 6187", avatars, pills), 875 shapes._
      **Done 2026-10-31, rev 293.** Export check of the Atoms sets against the live spec sheet found and fixed: (a) filled
      Input / TextArea and every NumberField had no value text — extract2.js now records a text control's value (and a
      textarea's text sits at its top padding, not centred); Input/NumberField/TextArea re-extracted
      (`store-sfix2.json`, only the text nodes changed), pushed, rebuilt (8/4/6, hex 0, rev 287–289). (b) horizontal CheckboxGroup /
      RadioGroup wrapped their 3rd option (Penpot instances a hair wider than the browser) — builder keeps a flex-wrap row
      the browser laid on one line unwrapped; both rebuilt (rev 290–291). (c) Slider without header had its thumb below
      the track (a main-axis "fill" child in a hugging parent collapsed) and the range Slider's fill started at 0, not
      at the low thumb (`position: relative` offset) — builder keeps the browser size for main-axis fill in a hug parent
      and turns a start-aligned relative offset into a left margin; Slider rebuilt (rev 293). Checkbox/Radio patched
      specs were confirmed identical to a fresh extraction with the fixed extract2.js (`store-sfix1.json`). Final shape
      counts: Atoms 1,160, Organisms 1,450, Test · Table 875. Open points (need a decision, not blocking):
      Input "invalid" variant looks like default — the spec passes `aria-invalid`, but the frame keys off Base UI
      `data-invalid` (only set inside a `Field`), so the live cell is not red either; Input "disabled" also looks like
      default in code (same border/fill, placeholder colour unchanged). The "⌘" glyph in Shortcut (and Input's end slot)
      renders garbled in Penpot exports (font fallback for U+2318)._
- [x] **5. Molecules.** Tab, ListItem, StateGroupHeader, Property, RailItem, ListSection, ViewToolbar, WorkItemRow.
      **Done 2026-10-30 ~22:55 UTC, rev 303** (all update-file 200, no backend errors; spec files on server = local, no
      re-extraction). Tab 6 variants (rev 294), ListItem 8 (295), StateGroupHeader 2 (296), Property 2 (297), RailItem 2
      (298), ListSection 2 (300), ViewToolbar 2 (301), WorkItemRow 4 (303), every set hex 0 (all paints bound), paths
      `Molecules / Tabs`, `Molecules / List` (ListItem, ListSection), else `Molecules`. Each set exported and compared
      with `#/spec/<Name>`: they match. Fixes: (a) the closed ListSection's chevron pointed down (DisclosureIndicator
      rotates its wrapper `-rotate-90`, extract2 dropped it) — extract2.js now records an svg's rotation (its own + a
      wrapper holding only it) as `rot`, builder `B.turn` rotates the icon (when building and in instance overrides);
      spec-ListSection.json patched (`rot: 270` on cell 1's chevron) instead of re-extracting, pushed. NavSidebar has 2
      rotated chevrons too: re-extract (or patch) it in item 6. (b) WorkItemRow had a ~10 px gap between "ACME-45" and the
      title (the browser shows 3.3 px): each single-line text gets 3 px slack, so in an inline run the space text now
      gives back the slack of the text before it; WorkItemRow rebuilt. Only WorkItemRow has such whitespace texts, so no
      other set needed a rebuild. Molecules page 603 shapes. Count chips (ListItem count, StateGroupHeader board badge)
      show their bg-layer-3 fill in Penpot. The live sheet's grey page hides it, so this is correct._
- [x] **6. Organisms.** NavSidebar, ProjectHeader, WorkItemCard; rebuild the table sets in order after their atoms.
      **Done 2026-10-31, rev 307** (all update-file 200). Organisms page 2,486 shapes (under the 3,000 cap, no split page).
      _Run 2026-10-31: table sets not rebuilt (rebuilt in item 4; no atom/cell they nest changed since).
      NavSidebar re-extracted (`store-snav1.json`): only the 2 chevron `rot: 270` + React ids changed, pushed;
      ProjectHeader / WorkItemCard re-extracted too (`store-sProjectHeader.json`, `store-sWorkItemCard.json`): no
      change. NavSidebar 3 variants, hex 0 (176/176 paints bound), path `Organisms`, rev 304 (200), Organisms
      1,450 → 1,825; export matches `#/spec/NavSidebar` (closed sections' chevrons point right). ProjectHeader 4
      variants, hex 0 (116/116), path `Organisms`, rev 305 (200), Organisms 2,094; per-variant exports match
      `#/spec/ProjectHeader` (the whole-set export shows uneven underline/rule shades — downscaling only). WorkItemCard
      6 variants (2 B.run calls), hex 0 (276/276), path `Organisms`, rev 306–307 (200), Organisms 2,486; export matches
      `#/spec/WorkItemCard` (avatars, pills, overdue icon, sub-items, parent id). No builder or spec fixes needed._
- [x] **7. Dashboard gaps.** Capture `#/examples/dashboard` (viewport 1440×2110); list every component it renders that
      has no Penpot set or variant; add specs for them (in their folder level) and build them.
      **Done 2026-10-31, rev 329** (all update-file 200, no backend errors), with two open user decisions below. Coverage
      after (`store-scr-dashboard3.json`, re-captured with the final extract2.js and pushed as `scr-dashboard3.js` for item 8):
      every instanceable qui node has its set and exact variant — Button ×5, Badge ×20, ListItem ×32 (21 with End value),
      ListSection closed ×9, TabsList + Tab ×3, Table + TableRow ×12 + TableHead ×3 + TableCell ×27 (compact),
      LinearProgress ×17, DonutChart status/centre ×2 (+ ChartLegend ×2), LineChart ×1, Heading, TextButton, Input,
      IconButton, Avatar, WorkspaceAvatar, Shortcut. Built as frames (canInstance false): NavSidebar ×1 and the open
      Workspace ListSection (7 rows) — decision 2; Icon glyphs (by design); recharts' hover-box "Tooltip" ×3 (empty).
      Shape counts: Atoms 1,208, Molecules 668, Organisms 2,794 (no split page needed), Foundations 973.
      **Decisions needed (user):**
      1. Layout primitives (Box/Stack/Inline/Grid, and look-less containers List, Tabs): give them Penpot components, or
         treat them as plain auto-layout frames? They have no fixed look and no spec, so they are not n.comp in a normal
         capture and the builder draws them as frames without throwing (they already sit as frames inside built sets, e.g.
         NavSidebar's Stack/Inline). Recommendation: plain auto-layout frames, named after the primitive; a component per
         primitive would only add an empty wrapper that every screen overrides.
      2. NavSidebar / ListSection with other row counts: the Acme shell's sidebar (no action, a 6-row main list, 10
         sections, the open one with 7 rows) cannot be an instance of the 3-section NavSidebar set, so it is built as a
         frame holding ListItem / closed-ListSection instances. Recommendation: fixed slots + clipping like TableRow —
         ListSection with ~8 row slots (clipped to the screen's height), NavSidebar with a main-list slot run and ~10
         section slots — then rebuild ListSection → NavSidebar and re-test the screens that use them.
      Open points (not blocking): chart plots are the set's drawing (an instance cannot re-plot), so the dashboard's DNA
      donut (93/63/30) shows the sample slices (97/58/31, ~2° off) — legend and centre texts are overridden; svg tick
      labels import as `svg-raw` with an inlined hex (no token binding possible). LogoSpinner's dot sits outside the ring
      in Penpot (centred in the browser), unrelated to the ring-colour fix. Sets rebuilt here replace their components,
      so the older Examples / Dashboard pages hold stale copies (item 8 builds the Dashboard on a fresh page).
      _Run 2026-10-31 (progress, updated as sets land): captured `store-scr-dashboard3.json` (1440×2110) and a diagnostic
      `store-scr-dashboard3-all.json` (`comps` = every comp-paths name, to see qui components that have no spec). Coverage
      before: missing variants — Button secondary/md/both; Badge success-xs-start ×5, brand-xs ×3 (table tier cells),
      info/success/warning/danger-sm, success/warning/danger-xs; ListItem rows with an endIcon (count + chevron, 21 rows:
      the set had no end slot, the builder would throw "no slot"); Table {Striped, Density: compact}; NavSidebar reported
      {closed, closed} as an instance — wrong: its props hold one `<AcmeNavigation>`, so `sectionsOf` saw no sections.
      No set: DonutChart ×2, ChartLegend ×2, LineChart ×1, TabsList ×1 (has a look: bg-layer-3 pill). Pure containers
      with no look (List, Tabs, TableHeader/Body, CollapsiblePanel, Menu = the Button it wraps, ListItemButton/Link/Label
      inside ListItem) and layout primitives (Text 83 excluded; Inline 71, Stack 58, Box 31, Grid 8) are not n.comp in the
      normal capture (no spec), so the builder draws them as frames and does not throw. The 3 "Tooltip" nodes were
      recharts' own `Tooltip` (same name). Specs changed: Button + Badge extras; ListItem `End: none|value` axis (+extra
      Icon start/End value); new `TabsList` (molecules, 4 Tab slots clipped, contained/underline; TabsList added to
      `B.CLIP_COMPS`), so ProjectHeader now nests it; ListSection: a closed section is an instance whatever its row count;
      NavSidebar canInstance/toVariant read the DOM (`navShape`), so the Acme shell's sidebar (no action, 6-row list, 10
      sections, Workspace open with 7 rows) is now honestly not an instance; Table drops the Density axis (density is the
      cells': the one-variant Table + compact TableHead/TableCell slot swaps); Tooltip `canInstance` skips
      `.recharts-tooltip-wrapper`; new charts (organisms): ChartLegend (Colors palette|status), DonutChart (Colors × Center,
      4), LineChart (Series 1|2), sample data = what the dashboard plots, `animate={false}`. Builder: a non-icon svg group
      is one override leaf and keeps its component's drawing. Spec sheet `store-sall19.json`; pushed Badge, Button,
      ListItem, ListSection, NavSidebar, ProjectHeader, Table, TabsList, ChartLegend, DonutChart, LineChart (the other
      diffs were only offscreen hidden-input y and React ids). Build order: Badge, Button, ListItem, TabsList,
      ListSection, StateGroupHeader, ViewToolbar, NavSidebar, ProjectHeader, ChartLegend, DonutChart, LineChart.
      Built (all update-file 200, hex 0, exports match `#/spec/<Name>`): icon check@14 (rev 308); Badge 19 variants (rev
      312 — the first call threw "icon component missing" and lost a variant, so it was rebuilt with `restart`), Button 18
      (314), Atoms 1,208; ListItem 10 (315), TabsList 2 (316, path `Molecules / Tabs`, 4 Tab instances, clipped),
      ListSection 2 (317), StateGroupHeader 2 (318), ViewToolbar 2 (319), Molecules 668; NavSidebar 3 (320),
      ProjectHeader 4 (321, now nests TabsList underline), ChartLegend 2 (324, path `Organisms / ChartShared`), DonutChart
      4 (325, `Organisms / ChartPie`, nests ChartLegend), LineChart 2 (327). extract2.js fixes for the charts: a colour set
      through the element's own inline style / svg attribute `var(--x)` binds that token (chart palette → `extended-color-*`
      primitives, status tones, `bg-surface-1` slice gaps; the legend dots had 2 raw hex), svg part tokens are unaliased
      (`border-color-subtle` → `border-subtle`), shapes inside `<defs>/<clipPath>/<mask>` are no parts, svg `<text>` gets
      its computed fill + font inlined (ticks rendered black serif). builder2.js: `B.bindParts` skips Penpot's
      `base-background` rect. That offset bug also mis-bound CircularProgress (track = accent, ring = txt.primary) and
      LogoSpinner since item 4: both rebuilt (6, rev 328; 2, rev 329), rings now bg-layer-3-selected / accent, match the
      spec sheet. Final spec sheet `store-sall22.json` (only chart specs differ from sall19)._
- [x] **7b. Sidebar slots** (user decision 2026-10-31: fixed slots + clipping). ListSection gets ~8 row slots and
      NavSidebar ~10 section slots (and an optional action), clipped to the size a screen gives, like TableRow; spec
      `canInstance` / `toVariant` read the real structure; rebuild ListSection → NavSidebar (and anything nesting them);
      re-capture the dashboard and confirm the shell sidebar is now one NavSidebar instance with no missing variant.
      **Done 2026-10-31, rev 338** (all update-file 200, no backend errors). ListSection 2 variants (9 row slots), hex 0,
      path `Molecules / List`; NavSidebar 2 variants (`Action` true|false, 4-row main list, 10 section slots), hex 0
      (226/226), path `Organisms`, 518 shapes (rev 334). Nothing else nests either set. Pages: Foundations 977, Molecules 733,
      Organisms 2,937 (under the cap, no split — but only ~60 shapes left: the next Organisms set needs
      `B.SPLIT_FILES`). Dashboard re-captured (`store-scr-dashboard3.json`, pushed as `scr-dashboard3.js`): coverage has
      no missing variant or icon; the shell sidebar is ONE `NavSidebar {Action:false}` instance (its leaves: Heading,
      2 IconButtons, 4 ListItems, ListSection open + 9 closed); frames are only Icon glyphs ×78 and recharts' Tooltip ×3.
      Test placement on "Test · Table" (removed afterwards): `B.override` fits with no warnings and the export matches the
      live sidebar (Workspace 7 rows with Dashboards selected, the spare slots clipped, 10 sections). Exports of both sets
      match `#/spec/<Name>`. Note for item 8: a loose instance whose x is set right after `instance()` kept its children
      at the old offset until a relayout (padding nudge); instances placed in a flex parent are not affected.
      Not instanceable (frames of instances, by design): an open Accounts section (12 rows > 9 slots), a sidebar with
      screen `extra` lists (AI chat) or a main list other than 4 rows. Open point: builder-drawn layout primitives are
      still named "Frame" (e.g. NavSidebar's header Inline and main List), not after the primitive as decision 1 asks:
      extract2 does not record primitive names (they are not n.comp)._
      _Run 2026-10-31 (progress, updated as sets land): specs.tsx — `SECTION_ROWS = 9` (every Acme section but Accounts'
      12 rows; Spend has 9, Workspace 7), `NAV_SECTIONS = 10`, `NAV_MAIN_ROWS = 4` (exact: the sections follow the main
      list, so a shorter list cannot clip its slots). ListSection renders 9 rows, canInstance/toVariant read the DOM
      (`sectionOf`: trigger aria-expanded + rendered rows ≤ 9). NavSidebar axes now `{Action: true|false}` (was
      Workspace/Projects open/closed): header, optional action, 4-row main list, 10 ListSection slots (first open, 3 rows);
      section open/closed is the nested slot's swap. canInstance: optional B, `L4`, ≤ 10 sections each `S-` or `S≤9`.
      builder2.js: `CLIP_COMPS` += ListSection, NavSidebar; `ovSwap` now throws when a slot's icon component is missing
      (it silently kept the default glyph: the ListSection "Archive" row showed `house` — no `folder@16` in the library).
      Spec sheet `store-sall23.json` (other diffs: offscreen hidden-input y, recharts ids); pushed spec-ListSection,
      spec-NavSidebar, builder2.js. Built: ListSection 2 variants, hex 0 (51/51), rev 330; icon folder@16 made on
      Foundations (rev 331, 977 shapes); ListSection rebuilt (rev 332), Molecules 733, export matches `#/spec/ListSection`._
- [x] **8. Dashboard.** Build the Dashboard on a fresh page from instances only; compare with a same-size screenshot
      overlay; fix builder issues until it matches; report differences that remain.
      **Done 2026-10-31, rev 383** (all update-file 200, no backend errors). Page "Dashboard · instances" (old Dashboard
      page untouched): 2,259 shapes, 7 screenSteps (~19–20 s each), no warnings. 105 instances at screen level (NavSidebar,
      Table, DonutChart ×2, LineChart, TabsList, ListItem ×21, Heading ×17, Badge ×17, LinearProgress ×17, TextButton ×9,
      Button ×5, IconButton ×2, Input, Avatar, WorkspaceAvatar, 8 loose icon glyphs); 175 frames: primitives Box 31, Stack
      58, Inline 48, Grid 8, List 4, Tabs 1, plus expected non-primitives — the example's root wrapper div ("Frame"), 8 Icon
      wrappers (Icon is frame + glyph instance by design), 16 "Label" spans (the example's own `truncate` spans, no qui
      component); 55 plain text layers (Text = text style). Changes: (a) decision 1 implemented — extract2 records `prim`
      (Box/Stack/Inline/Grid/List/Tabs/TableHeader/TableBody; never `comp`), builder names those frames after it (specs
      re-split from `store-sall24.json`; only LinearProgress/ProgressCell/TableCell/TableRow/Table pushed, other specs
      still name primitives "Frame" until their next rebuild). (b) LinearProgress had no valueless variant (the
      engagement bar is `showValue={false}`, the builder threw): spec axis `Value: true|false` (+ md success Value:false,
      indeterminate → Value:false), 12 variants, rebuilt with dependants ProgressCell → TableCell → TableRow → Table (rev
      346–355), hex 0. (c) builder: value-driven bars (absolute, childless, painted boxes: progress indicator, slider
      fill/thumb) are override slots (`bx`: resized + offset to the page), so bars show 92%/98%/… instead of the set's 62%.
      (d) text slots take the page's font weight/size/style when they differ (bold Total row, semibold counts). (e) an
      instance whose root is a flex-wrap row the browser wrapped turns wrapping on (`B.fitWrap`: DNA legend on 2 lines).
      (f) extract2 records an ellipsis-truncated run as the string the browser shows ("Categories & segme…", `full` keeps
      the original). (g) `B.page(name, true)` now really clears the page. Re-captured `store-scr-dashboard4.json` (pushed
      as `scr-dashboard4.js`); coverage + a dry-run override of all 97 screen-level instances: nothing missing. Compared
      with a live 1440×2110 screenshot (agent-browser `set media light reduced-motion`, else recharts is caught
      mid-animation): layout, positions, sizes, colours and content match. Remaining differences (need decisions, not
      builder bugs): 1. font — the app loads the variable IBM Plex Sans (100–700), Penpot renders Google's static IBM Plex
      Sans, ~5–7 % narrower, so text looks smaller/lighter, some gaps look wider ("46.2M  AED", "17  / 23") and "Total
      spend (domestic + FX)" breaks after "+" instead of before; fix = upload the app's font files as a Penpot team font.
      2. icon strokes — every Icon component keeps stroke-width 2 at 14/16 px (the browser scales to 2·size/24 = 1.17 /
      1.33 px), so glyphs look heavier/darker; copies carry tinted (touched) strokes, so fixing the mains does not
      propagate (tested on house@16, reverted): needs makeIcons to scale strokes + a sweep over every icon copy (or
      rebuild of all sets). 3. known: donut slices are the set's sample plot (~2° off), ⌘ glyph garbled in Shortcut.

- [ ] **9. Tabler icons** (user decision 2026-10-31: qui moves from Lucide to Tabler). The app side is done:
  `packages/ui/src/icons.ts` maps qui's 171 icon names to Tabler and is exported as `Icons` from `@qui/ui`.
  extract2.js now reads icon names from the `tabler-icon-<name>` class, and builder2.js bakes the drawn stroke width
  into each svg before import (`B.scaleStroke`: 2px on a 24 grid → 1.167 at 14px, 1.333 at 16px). To do, in order:
  re-extract the spec sheet (new store), build the Tabler icon components on Foundations (the old Lucide ones stay
  until nothing uses them), rebuild every set that holds an icon in dependency order (atoms → molecules →
  organisms), rebuild the Dashboard on a fresh page, then delete the old Lucide icon components. Check one icon's
  stored strokeWidth after the first build (expect 1.167 at 14px). Rules 5–8 apply throughout.
