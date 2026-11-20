<script lang="ts">
  import { page } from "$app/state";
  import { afterNavigate } from "$app/navigation";
  import { tick, untrack } from "svelte";
  import { fade } from "svelte/transition";
  import type { RecordModel } from "pocketbase";
  import { SearchInput } from "$lib/shared/components/search-input";
  import { Icon } from "$lib/shared/components/icon";
  import { Menu, MenuItem } from "$lib/shared/components/menu";
  import { StoreTabs } from "$lib/shared/components/store-tabs";
  import { authModel } from "$lib/modules/auth/model";
  import { marketModel } from "../model";
  import { WatchfaceList } from "../components/watchface-list";
  import { CreatorShelf } from "../components/creator-shelf";
  import { DEVICES, matchesDevice } from "../lib/devices";
  import CompanionPromo from "$lib/modules/store/components/companion-promo.svelte";
  import { t } from "../i18n";

  const { $user: user } = authModel;
  const {
    $items: items,
    $myItems: myItems,
    $likes: likes,
    $marketLoading: marketLoading,
    $myLoading: myLoading,
    $marketView: marketView,
    $topCreators: topCreators,
    marketViewPatched,
    marketFilterPicked,
    marketUrlChanged,
    marketLoadRequested,
    myLoadRequested,
  } = marketModel;

  marketLoadRequested();
  // the filters come from the URL on a load, a link, Back/Forward — not on a pick's own write
  // (type "goto"), which already updated the view (see marketFilterPicked)
  afterNavigate(({ type, to }) => {
    if (type !== "goto" && to) marketUrlChanged(to.url);
  });

  // one page, two shelves: everyone's published faces, or the signed-in user's own (drafts
  // included). The shelf is in the URL (?mine) so it survives a reload and can be linked.
  const mine = $derived(Boolean($user) && page.url.searchParams.has("mine"));
  // the faces the signed-in user hearted (?liked): the published catalog narrowed by $likes,
  // so un-liking a card here drops it from the shelf at once
  const liked = $derived(Boolean($user) && !mine && page.url.searchParams.has("liked"));
  const uid = $derived($user?.id);

  const tab = $derived(mine ? "mine" : liked ? "liked" : "all");

  $effect(() => {
    if (mine && uid) myLoadRequested(uid);
  });

  const SORT_OPTIONS = $derived([
    // not a sort of the grid: it swaps the grid for a shelf of creators over the thresholds in
    // lib/top-creators, each with a horizontal rail of their faces
    { value: "creators", label: $t.topCreators },
    { value: "new", label: $t.newest },
    { value: "popular", label: $t.popular },
    { value: "downloads", label: $t.mostDownloaded },
  ]);

  // "" — every watch. The shelf is mostly Watch 3 Pro faces right now, so a Watch Pro 2 owner
  // needs a way to see their own watch's faces without us moving or hiding anyone's work.
  const DEVICE_OPTIONS = $derived([
    { value: "", label: $t.allDevices },
    ...DEVICES.map((d) => ({ value: d.value, label: d.label, short: d.short })),
  ]);

  const likeCount = (id: string) => $likes.filter((l) => l.watchface === id).length;
  const likedIds = $derived(new Set($likes.filter((l) => l.user === uid).map((l) => l.watchface)));

  // Everything that narrows or orders the shelf, as the rows of one menu; each row opens its
  // own list in place. The shelf itself (whose faces) is the first of them for a signed-in
  // user — it used to be a row of tabs of its own in the header.
  const filters = $derived([
    ...($user
      ? [
          {
            id: "shelf",
            name: $t.show,
            value: tab,
            options: [
              { value: "all", label: $t.everyones },
              { value: "mine", label: $t.mine },
              { value: "liked", label: $t.liked },
            ],
            pick: (value: string) => marketFilterPicked({ key: "shelf", value }),
          },
        ]
      : []),
    {
      id: "device",
      name: $t.device,
      value: $marketView.device,
      options: DEVICE_OPTIONS,
      pick: (value: string) => marketFilterPicked({ key: "device", value }),
    },
    {
      id: "sort",
      name: $t.sort,
      value: $marketView.sort,
      options: SORT_OPTIONS,
      pick: (value: string) => marketFilterPicked({ key: "sort", value }),
    },
  ]);
  // which of them is open in the menu; null — the list of filters itself
  let pane = $state<string | null>(null);
  const current = $derived(filters.find((f) => f.id === pane));

  // the filter button carries a dot while the shelf isn't the default one
  const filtered = $derived(
    tab !== "all" || $marketView.device !== "" || $marketView.sort !== "new",
  );

  const viewQuery = $derived($marketView.query.trim().toLowerCase());
  const inView = (wf: RecordModel) =>
    matchesDevice(wf.device, $marketView.device) && wf.name.toLowerCase().includes(viewQuery);

  const shown = $derived(
    (mine ? $myItems : $items.filter((wf) => Boolean(wf.owner)))
      .filter((wf) => !liked || likedIds.has(wf.id))
      .filter(inView)
      .toSorted((a, b) =>
        $marketView.sort === "popular"
          ? likeCount(b.id) - likeCount(a.id)
          : $marketView.sort === "downloads"
            ? (b.downloads || 0) - (a.downloads || 0)
            : b.created.localeCompare(a.created),
      ),
  );

  // the creators view narrows the same way, but per rail: the search and device filter pick
  // which faces a creator shows, never the header's totals — a creator drops out only when
  // nothing of theirs matches. Qualifying on the thresholds is the model's job ($topCreators),
  // computed over the whole catalog. On ?mine the shelf is just you, if you made the cut
  const creatorsShown = $derived(
    $topCreators
      .filter((c) => !mine || c.id === $user?.id)
      .map((c) => ({
        ...c,
        faces: c.faces.filter((wf) => (!liked || likedIds.has(wf.id)) && inView(wf)),
      }))
      .filter((c) => c.faces.length),
  );

  const PAGE = 60;

  let scroller = $state<HTMLElement | null>(null);
  let restoring = true;

  $effect(() => {
    if ((mine ? $myLoading : $marketLoading) || !visible.length || !scroller || !restoring) return;
    let cancelled = false;

    tick().then(() => {
      if (cancelled || !scroller) return;
      scroller.scrollTop = $marketView.scrollTop;
      restoring = false;
    });
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    const shelf = tab;

    untrack(() => {
      if ($marketView.shelf === shelf) return;
      marketViewPatched({ shelf });
    });
  });

  $effect(() => {
    if (scroller && $marketView.scrollTop === 0) scroller.scrollTop = 0;
  });

  const visible = $derived(shown.slice(0, $marketView.visibleCount));
</script>

<div class="page">
  <div class="toolbar">
    <!-- the store's sections double as the page title -->
    <StoreTabs />
    <!-- the search and, beside it, one button for everything that narrows or orders the
           shelf: which watch, which order -->
    <div class="find">
      <SearchInput
        bind:value={() => $marketView.query, (value) => marketFilterPicked({ key: "q", value })}
      />
      <Menu align="end">
        {#snippet trigger({ open, toggle })}
          <button
            type="button"
            class="filter"
            class:open
            title={$t.filters}
            aria-label={$t.filters}
            onclick={() => {
              pane = null;
              toggle();
            }}
          >
            <Icon name="tune" size={22} />
            {#if filtered}<span class="dot"></span>{/if}
          </button>
        {/snippet}
        {#key pane}
          <div class="pane" in:fade={{ duration: 180 }}>
            {#if current}
              <MenuItem stay onClick={() => (pane = null)}>
                <Icon name="arrow_back" size={20} />
                <span class="type-label">{current.name}</span>
              </MenuItem>
              {#each current.options as opt (opt.value)}
                <MenuItem
                  checked={opt.value === current.value}
                  onClick={() => current.pick(opt.value)}>{opt.label}</MenuItem
                >
              {/each}
            {:else}
              {#each filters as f (f.id)}
                <MenuItem stay onClick={() => (pane = f.id)}>
                  <span class="filter-name">{f.name}</span>
                  <span class="filter-value"
                    >{f.options.find((o) => o.value === f.value)?.label}</span
                  >
                  <Icon name="chevron_right" size={20} />
                </MenuItem>
              {/each}
            {/if}
          </div>
        {/key}
      </Menu>
    </div>
  </div>

  <main
    bind:this={scroller}
    onscroll={() => {
      if (!restoring && scroller) marketViewPatched({ scrollTop: scroller.scrollTop });
    }}
  >
    {#if tab === "all"}<CompanionPromo />{/if}
    {#if $marketView.sort === "creators"}
      <CreatorShelf creators={creatorsShown} loading={mine ? $myLoading : $marketLoading} />
    {:else}
      <WatchfaceList
        items={visible}
        loading={mine ? $myLoading : $marketLoading}
        manage={mine}
        showAuthor={!mine}
        empty={mine ? $t.emptyMine : liked ? $t.emptyLiked : $t.emptyAll}
        onMore={$marketView.visibleCount < shown.length
          ? () =>
              marketViewPatched({
                visibleCount: Math.min($marketView.visibleCount + PAGE, shown.length),
              })
          : undefined}
      />
    {/if}
  </main>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .toolbar > :global(.tabs) {
    margin-inline-end: auto;
  }
  .find {
    display: flex;
    gap: 0.5rem;
    width: 17rem;

    > :global(.search) {
      flex: 1;
      min-width: 0;
    }
  }
  /* a square control the height of the field beside it */
  .filter {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    width: var(--control-height);
    height: var(--control-height);
    padding: 0;
    border: none;
    border-radius: var(--border-radius);
    color: var(--color-text);
    background: oklch(from var(--color-text) l c h / 7%);
    cursor: pointer;
    transition: background-color 0.15s ease;

    @media (hover: hover) {
      &:hover {
        background: oklch(from var(--color-text) l c h / 10%);
      }
    }
    &.open {
      background: oklch(from var(--color-text) l c h / 14%);
    }
    &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
  .dot {
    position: absolute;
    top: 0.5rem;
    inset-inline-end: 0.5rem;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--color-accent);
  }
  /* the filter menu: two rows, each opening its own list in place */
  .pane {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 15rem;
  }
  .filter-name {
    flex: 1;
  }
  .filter-value {
    color: oklch(from var(--color-text) l c h / 55%);
    white-space: nowrap;
  }

  /* A phone gets two short rows: the sections, then the search with the filter button beside
     it (and All / Mine / Liked under them when signed in). */
  @media (max-width: 767px) {
    .toolbar {
      --control-height: 2.75rem;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }
    .toolbar > :global(.tabs) {
      flex: 1 1 100%;
    }
    .find {
      flex: 1 1 100%;
      width: auto;
    }
  }
  main {
    flex: 1;
    overflow-y: auto;
  }

  /* The tab bar is translucent glass on a phone (app-nav). The layout reserves a strip for it
     under the page, so nothing would ever scroll beneath it: stretch the page into that strip
     and pad the scroller by the same amount, so the last card still clears the bar. */
  @media (max-width: 767px) {
    .page {
      height: calc(100% + var(--dock-space));
      margin-block-end: calc(-1 * var(--dock-space));
    }
    main {
      padding-block-end: var(--dock-space);
    }
  }
</style>
