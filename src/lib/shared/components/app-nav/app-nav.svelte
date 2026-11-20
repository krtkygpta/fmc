<script lang="ts">
  import { common as t } from "$lib/shared/i18n";
  import { page } from "$app/state";
  import { authModel } from "$lib/modules/auth/model";
  import { fileUrl } from "$lib/shared/api";
  import WatchSheet from "$lib/modules/device/components/watch-sheet.svelte";
  // importing the model is also what puts a saved accent colour on the page at startup
  import { appearanceModel } from "$lib/modules/appearance/model";
  import AccentDialog from "$lib/modules/appearance/components/accent-dialog.svelte";
  import LanguageDialog from "$lib/modules/appearance/components/language-dialog.svelte";
  import { Avatar } from "$lib/shared/components/avatar";
  import { Icon, type IconName } from "$lib/shared/components/icon";
  import { Menu, MenuItem } from "$lib/shared/components/menu";

  const { $user: user, logout } = authModel;
  const { accentDialogOpened, languageDialogOpened } = appearanceModel;
  const path = $derived(page.url.pathname);
  const nav = $derived<{ title: string; url: string; icon: IconName; active: boolean }[]>([
    // one tab for every shelf — watchfaces, apps, firmware: the store's own header switches
    // between them (see store-tabs), so the bar stays at four tabs on a phone
    {
      title: $t.store,
      url: "/",
      icon: "storefront",
      active:
        path === "/" ||
        ["/market", "/my", "/apps", "/firmware", "/community", "/user", "/companion"].some((p) =>
          path.startsWith(p),
        ),
    },
    { title: $t.editor, url: "/editor", icon: "edit", active: path.startsWith("/editor") },
  ]);
  const signingIn = $derived(path.startsWith("/login") || path.startsWith("/register"));

  // The phone's dock has a thumb: a lighter patch of glass under the tab you are on. Its
  // glyphs are a second, lit copy of the row (`tabs`, drawn in .lit) clipped to the thumb, so
  // switching reads as a mask sliding along the dock — and the thumb can be dragged by finger.
  const tabs = $derived<{ title: string; icon: IconName }[]>([
    ...nav,
    { title: $t.watch, icon: "watch" },
    $user ? { title: $t.account, icon: "person" } : { title: $t.signIn, icon: "login" },
  ]);
  // only pages hold the thumb: the watch panel and the account menu are overlays
  const activeAt = $derived(
    signingIn && !$user ? tabs.length - 1 : nav.findIndex((item) => item.active),
  );

  let bar = $state<HTMLElement>();
  // a drag in progress: the thumb's position as a fractional tab index
  let dragAt = $state<number | null>(null);
  // the tab a drag was dropped on, held until the navigation it started lands
  let droppedAt = $state<number | null>(null);
  const thumbAt = $derived(dragAt ?? droppedAt ?? activeAt);

  $effect(() => {
    void path;
    droppedAt = null;
  });

  let start: { x: number; id: number } | null = null;
  let dragged = false;
  const tabEls = () => [...(bar?.querySelectorAll<HTMLElement>("[data-tab]") ?? [])];

  function at(x: number) {
    const r = bar!.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(bar!).paddingLeft);
    const cell = (r.width - 2 * pad) / tabs.length;

    return Math.min(tabs.length - 1, Math.max(0, (x - r.left - pad) / cell - 0.5));
  }

  function onPointerDown(e: PointerEvent) {
    // the dock only: the rail on md+ has no thumb, and the watch panel lives inside <nav> too
    if (!matchMedia("(max-width: 767px)").matches) return;
    if (!(e.target as Element).closest("[data-tab]")) return;
    start = { x: e.clientX, id: e.pointerId };
  }

  function onPointerMove(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return;
    if (dragAt === null) {
      if (Math.abs(e.clientX - start.x) < 8) return;
      bar?.setPointerCapture(start.id);
    }
    dragAt = at(e.clientX);
  }

  function onPointerUp() {
    const to = dragAt === null ? null : Math.round(dragAt);

    start = null;
    dragAt = null;
    if (to === null) return;
    if (to !== activeAt) {
      const el = tabEls()[to];

      // a page keeps the thumb while it loads; an overlay lets it spring back
      if (el instanceof HTMLAnchorElement) droppedAt = to;
      el?.click();
    }
    // the click the browser makes of the drag itself must not land on a tab
    dragged = true;
    setTimeout(() => (dragged = false));
  }

  function onPointerCancel() {
    start = null;
    dragAt = null;
  }
</script>

<!-- the app's navigation: a bottom tab bar on a phone, a rail down the left side on md+ -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
  bind:this={bar}
  class:dragging={dragAt !== null}
  style:--n={tabs.length}
  style:--i={Math.max(thumbAt, 0)}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  ondragstart={(e) => e.preventDefault()}
  onclickcapture={(e) => {
    if (!dragged) return;
    e.preventDefault();
    e.stopPropagation();
  }}
>
  <a class="logo type-title" href="/">fmc</a>
  {#each nav as item (item.url)}
    <a class="type-label" data-tab draggable="false" href={item.url} class:active={item.active}>
      <span class="icon">
        <Icon name={item.icon} size={24} fill={item.active} />
      </span>
      {item.title}
    </a>
  {/each}
  <WatchSheet>
    {#snippet trigger({ toggle, connected })}
      <!-- no .active while open: the watch panel is an overlay, not a page -->
      <button class="type-label" data-tab onclick={toggle}>
        <span class="icon">
          <Icon name="watch" size={24} />
          {#if connected}<span class="dot"></span>{/if}
        </span>
        {$t.watch}
      </button>
    {/snippet}
  </WatchSheet>
  <!-- the account closes the bar: the app has no top bar, so this is where it lives -->
  {#if $user}
    <span class="account">
      <Menu align="start">
        {#snippet trigger({ toggle })}
          <button class="type-label" data-tab onclick={toggle}>
            <span class="icon">
              <Avatar
                name={$user.name || $user.email}
                src={$user.avatar ? fileUrl($user, "avatar") : undefined}
              />
            </span>
            {$t.account}
          </button>
        {/snippet}
        <MenuItem href="/user/{$user.id}">
          <Icon name="person" size={16} />
          {$t.profile}
        </MenuItem>
        <MenuItem onClick={() => accentDialogOpened()}>
          <Icon name="palette" size={16} />
          {$t.accentColor}
        </MenuItem>
        <MenuItem onClick={() => languageDialogOpened()}>
          <Icon name="translate" size={16} />
          {$t.language}
        </MenuItem>
        <MenuItem href="https://github.com/freethinkel/fmc/issues">
          <Icon name="help" size={16} />
          {$t.reportIssue}
        </MenuItem>
        <MenuItem danger onClick={() => logout()}>
          <Icon name="logout" size={16} />
          {$t.logOut}
        </MenuItem>
      </Menu>
    </span>
  {:else}
    <!-- the same slot as the account it turns into: the far end of the rail -->
    <span class="account">
      <a class="type-label" data-tab draggable="false" href="/login" class:active={signingIn}>
        <span class="icon">
          <Icon name="login" size={24} />
        </span>
        {$t.signIn}
      </a>
    </span>
  {/if}
  <!-- the lit copy of the row, visible only inside the thumb (see .lit) -->
  <div class="lit" class:off={thumbAt < 0} aria-hidden="true">
    {#each tabs as tab, i (tab.title)}
      <span class="type-label">
        <span class="icon">
          {#if i === tabs.length - 1 && $user}
            <Avatar
              name={$user.name || $user.email}
              src={$user.avatar ? fileUrl($user, "avatar") : undefined}
            />
          {:else}
            <Icon name={tab.icon} size={24} fill />
          {/if}
        </span>
        {tab.title}
      </span>
    {/each}
  </div>
</nav>
<AccentDialog />
<LanguageDialog />

<style>
  nav {
    /* it sits out page transitions (global.css) */
    view-transition-name: app-nav;
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    height: calc(var(--nav-bar-height) + var(--safe-area-bottom));
    padding-bottom: var(--safe-area-bottom);
    background: var(--color-background);
    border-top: 1px solid oklch(from var(--color-text) l c h / 10%);
  }
  .icon {
    /* Avatar has no size prop — it reads this */
    --avatar-size: 1.5rem;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
  }
  .dot {
    position: absolute;
    z-index: 1;
    /* the glyph's top-right corner */
    top: -0.125rem;
    inset-inline-end: -0.25rem;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--color-accent);
  }
  a,
  button {
    border: none;
    background: transparent;
    cursor: pointer;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    position: relative;
    text-decoration: none;
    color: oklch(from var(--color-text) l c h / 45%);
    transition: color 0.15s ease;

    @media (hover: hover) {
      &:hover {
        color: var(--color-text);
      }
    }
    /* where you are: full ink, a filled glyph, and one accent dot — no pill behind the icon */
    &.active {
      color: var(--color-text);

      &::after {
        content: "";
        position: absolute;
        bottom: 0.3125rem;
        left: calc(50% - 0.125rem);
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 50%;
        background: var(--color-accent);
      }
    }
  }
  /* the Menu wraps its trigger in a box of its own — hand it the tab's share of the bar */
  .account,
  .account :global(.root) {
    display: flex;
    flex: 1;
    min-width: 0;
  }
  .account > :global(*),
  .account :global(.root > :first-child) {
    flex: 1;
    min-width: 0;
  }
  /* phone only — see the dock below */
  .lit {
    display: none;
  }
  .logo {
    display: none;
    flex: none;
    color: var(--color-text);
    text-decoration: none;
  }
  @media (min-width: 768px) {
    nav {
      position: relative;
      flex-direction: column;
      justify-content: start;
      gap: 0.5rem;
      width: var(--nav-rail-width);
      height: 100%;
      padding: calc(1.5rem + var(--safe-area-top)) 0 calc(1.5rem + var(--safe-area-bottom));
      border-top: none;
      border-inline-end: 1px solid oklch(from var(--color-text) l c h / 10%);
    }
    a,
    button {
      flex: none;
      padding-block: 0.625rem;
    }
    a.active::after {
      bottom: calc(50% - 0.125rem);
      left: 0.5rem;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-block: 0.5rem 0.75rem;
    }
    /* the account sits at the far end of the rail, away from the pages */
    .account {
      flex: none;
      justify-content: center;
      margin-block-start: auto;
    }
    .account :global(.root) {
      flex: none;
    }
  }

  /* The phone's bar is a floating dock of frosted glass: a pill lifted off the bottom edge,
     the page scrolling under and around it, blurred. --nav-bar-height (tokens.css) is the strip
     pages reserve for it — the dock plus its margins. Phone-only: the md+ rail sits beside the
     page, with nothing under it to blur. Nothing is animated on the filter, and there is an
     opaque fallback where blur isn't supported or less transparency is asked. */
  @media (max-width: 767px) {
    nav {
      --pad: 0.375rem;

      inset-inline: 0.75rem;
      /* a dock, not a toolbar: on a wide phone or a narrow window it stops growing and sits
         centred, so four tabs don't spread into a strip */
      max-width: 26rem;
      margin-inline: auto;
      /* absolute in the app shell, not fixed: Safari neither paints a fixed box below its
         layout viewport nor shows the page under its toolbar while one sits at the bottom
         edge (global.css). The shell never scrolls, so this holds as still as fixed did;
         --under-bar is how much of the shell lies below the visible viewport. */
      position: absolute;
      bottom: calc(var(--under-bar) + var(--dock-inset));
      height: 4rem;
      padding: 0 var(--pad);
      border: 1px solid oklch(from var(--color-text) l c h / 10%);
      border-radius: 625rem;
      background: var(--color-surface);
    }
    /* a sideways drag on a tab moves the thumb, not the page; and every tab is the same
       width whatever its label, so the lit copy lands exactly on the row beneath it */
    a,
    button {
      touch-action: pan-y;
      min-width: 0;
      padding: 0;
      /* and nothing of the browser's own: no link ghost, no long-press preview, no selection */
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    /* the thumb says where you are: no dot under the label here */
    a.active {
      color: oklch(from var(--color-text) l c h / 45%);

      &::after {
        content: none;
      }
    }
    /* The thumb. This layer repeats the row in full ink with filled glyphs, on a lighter
       patch of glass, and is clipped to one tab's cell: --i is which (fractional while a
       finger drags it), --n how many. Moving the clip is the whole animation — the lit
       glyphs stay put and the mask slides over them. A stadium, not a circle: the cell is
       wider than it is tall. */
    .lit {
      --cell: calc((100% - 2 * var(--pad)) / var(--n));

      position: absolute;
      inset: 0;
      display: flex;
      padding: 0 var(--pad);
      border-radius: inherit;
      pointer-events: none;
      color: var(--color-text);
      background: oklch(from var(--color-text) l c h / 16%);
      clip-path: inset(
        var(--pad) calc(var(--pad) + (var(--n) - 1 - var(--i)) * var(--cell)) var(--pad)
          calc(var(--pad) + var(--i) * var(--cell)) round 625rem
      );
      transition:
        clip-path var(--spring-transition),
        opacity 0.2s ease;

      &.off {
        opacity: 0;
      }
      span:not(.icon) {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
      }
    }
    /* under the finger the thumb follows at once, and swells a little */
    .dragging .lit {
      transition: none;
      background: oklch(from var(--color-text) l c h / 22%);
    }
    @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
      nav {
        background: oklch(from var(--color-surface) l c h / 72%);
        -webkit-backdrop-filter: blur(1.5rem) saturate(1.6);
        backdrop-filter: blur(1.5rem) saturate(1.6);
      }
    }
    @media (prefers-reduced-transparency: reduce) {
      nav {
        background: var(--color-surface);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
    }
  }
</style>
