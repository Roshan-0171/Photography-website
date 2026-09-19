# Photography portfolio — Kathmandu

Next.js (App Router) + Tailwind v4. Light chrome, dark lightbox, no component library.

```bash
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run photos       # rebuild image derivatives from photos-source/
npm run photos:force # ignore the cache and rebuild every photograph
```

Copy `.env.example` to `.env.local` and fill it in before the contact form will
send anything.

## Design system

`design-system/kathmandu-photographer/MASTER.md` is the source of truth, generated
by the ui-ux-pro-max skill. Read its **Approved overrides** section first — it
records where the project deliberately departs from the generated output and why.

Tokens live in [globals.css](src/app/globals.css) under `@theme`. Do not add
`--spacing-<t-shirt-size>` tokens: in Tailwind v4 that namespace also defines
`max-w-*`, so `--spacing-3xl` silently turns `max-w-3xl` into 6rem.

## Photographs

> The photographs currently in `photos-source/` are **Pexels stock, not the
> photographer's own work.** See [PLACEHOLDER-PHOTOS.md](PLACEHOLDER-PHOTOS.md)
> for provenance and the checklist to follow before launch.

```
photos-source/            ← originals. gitignored, never deployed, never served
  hero/                     the one full-bleed banner image
  about/                    the portrait of you on /story
  portrait/  editorial/  personal/     the three galleries
        │
        │  npm run photos
        ▼
public/photos/<category>/<name>-<width>.{avif,webp,jpg}   ← committed
src/data/photos.generated.ts                              ← committed, DO NOT EDIT
src/data/photo-text.json                                  ← committed, YOU edit this
```

### Adding, removing and reordering photographs

Everything about a photograph — which one it is, its order, where it appears,
its alt text and caption — comes from two places: the file itself in
`photos-source/`, and its entry in
[src/data/photo-text.json](src/data/photo-text.json). Nothing else ever needs
editing; there is no other file that names an individual photograph.

1. **Add** — drop a file into the right `photos-source/<category>/` folder.
   Any name you like — `Kiran on the roof.JPG` becomes the id
   `kiran-on-the-roof`.
2. **Remove** — delete the file from `photos-source/`. On the next run its
   derivatives in `/public`, its entry in `photos.generated.ts` and its entry
   in `photo-text.json` are all removed, so nothing can drift out of step —
   note this means its alt text and caption are gone too, not just hidden.
3. **Reorder** — set `order` on the photograph's entry in `photo-text.json` to
   a number. Lower numbers sort first within that photograph's gallery.
   Photographs with no `order` set sort after every ordered one, alphabetically
   by filename — so you only need to touch the ones you actually want to move.
   Renaming a file is never required to change where it appears.
4. Run `npm run photos`.
5. Write the alt text. The script adds a blank entry per photograph to
   `photo-text.json`; fill in `alt` and, optionally, `caption`. Your words live
   in that file alone and survive every rebuild — the generated file
   (`photos.generated.ts`) is overwritten each run and must never be edited.

To change a photograph without changing which slot it occupies — swap out a
weak frame for a better one — just replace the file in `photos-source/` (any
filename) and re-run. Nothing elsewhere references the old filename, so
nothing else needs to change; the one exception is the photograph's own
`photo-text.json` entry, which follows its old id and won't automatically
carry over alt text written for a completely different picture.

### The home page

The front page lives at `/home` (`/` permanently redirects there, so old
links and bookmarks keep working).

`home` in `photo-text.json` controls what appears in "Selected work" on it and
in what order — set it on any photograph in any gallery, unset it to remove
one, renumber to reorder.

To pull an entire category off the home page at once — no weddings on the
front page, say — rather than clearing `home` on every photograph in it one by
one, edit `homeCategories` near the top of
[src/data/photos.ts](src/data/photos.ts). It is the one place in this
workflow that is genuine code rather than data, kept deliberately short (a
one-line array of the four category names) for exactly this kind of bulk,
occasional edit; day-to-day curation still happens in `photo-text.json`.

### The hero banner and the /story portrait

`photos-source/hero/` and `photos-source/about/` each hold exactly one file —
the full-bleed home page banner and the portrait on `/story`. The build fails
loudly if either folder ever holds more than one. Because the site looks each
one up by folder rather than by filename, swapping either photograph is just:
delete the old file, drop in the new one (any name), run `npm run photos`.

### What the script guarantees

- **All metadata is stripped** from every derivative — GPS coordinates, camera
  serial numbers, timestamps. It is verified on the written bytes and the build
  stops if anything survives. This is a privacy requirement, not a file-size one.
- **Nothing full-resolution is published.** Derivatives cap at 2000px wide
  (`MAX_WIDTH` in the script). Originals stay in the gitignored source folder.
- **Idempotent.** Each original is fingerprinted; unchanged files are skipped.
- **Dimensions are read from the file**, never typed by hand, so the reserved
  layout space always matches the real photograph and nothing shifts on load.

### Alt text is not optional

Every photograph starts with empty alt text and the script says so loudly. Empty
alt means the photograph does not exist for anyone using a screen reader, and
does not exist to image search either.

Set `PHOTOS_REQUIRE_ALT=1` to turn the warning into a hard failure — do this in
CI so a photograph can never be published without it.

### Layout rules the code keeps

Gallery tiles are a uniform 4:5 grid — two columns on a phone, four on a
desktop, chosen by the gallery's own width — so every row lines up. To get
there each tile is a centre crop (weighted slightly toward the top, where a
face usually is). The **whole, uncropped frame is always what the lightbox
shows**: the grid is a contact sheet, the lightbox is the print. The home hero
is the other crop, a full-bleed banner in
[src/app/home/page.tsx](src/app/home/page.tsx).

The hero is the LCP element: preloaded, high fetch priority, never lazy. Keep it
that way.

## The enquiry form

Copy `.env.example` to `.env.local` and fill it in — see that file for what each
variable does.

**Email copy lives in one file:** [src/data/emails.ts](src/data/emails.ts). Both
the notification to you and the confirmation to the enquirer are plain prose at
the top of that file, with a comment explaining the `${placeholders}`. Nothing
else needs touching to rewrite them.

Preview your changes without spending sends:

```bash
INQUIRY_DRY_RUN=1 npm run dev     # prints both emails to the terminal
```

## Storing enquiries

Optional. Without `DATABASE_URL` the notification email is the only record of an
enquiry — delete it and it is gone. Set one and every enquiry is also written to
Postgres, so a deleted email or a Resend outage no longer loses a booking.

```bash
npm run inquiries        # the 20 most recent
npm run inquiries -- 50
npm run test:db          # runs the schema and queries against real Postgres
```

Where a row goes:

| `DATABASE_URL` | Environment | Storage |
|---|---|---|
| set | anywhere | Neon Postgres, over HTTP |
| unset | development | a local Postgres file in `.pgdata/` — no account, no server |
| unset | production | off; the notification email is the only record |

So storage works in development straight away: run the site, send an enquiry,
then `npm run inquiries`. The local database is PGlite — the same Postgres engine
the SQL is tested against — held in a gitignored directory, and it is a
devDependency that never reaches production.

For anything deployed, create a free database at [neon.tech](https://neon.tech)
and paste the pooled connection string into `.env.local`. The table is created on
first use.

**What this changes:** an enquiry now survives if *either* the database row or
the notification email lands, rather than the email alone. Only losing both is a
failure — losing a booking to a mail outage when the enquiry is sitting safely in
Postgres would be absurd. With no `DATABASE_URL` the old behaviour applies
unchanged. The stored row records whether each email actually went out, and
`npm run inquiries` flags any enquiry you were never emailed about.

## Reading enquiries from your phone

Sign in at `/admin`; the list is at `/admin/enquiries`. Off by default: with no
`ADMIN_PASSWORD` set, both routes are 404s — no login form to probe, no hint
that anything lives there.

Signed out, `/admin/enquiries` is also a 404 rather than a redirect to the
sign-in page. A redirect would confirm to anyone probing that something is
there; a 404 looks exactly like a page that does not exist.

```bash
openssl rand -base64 24    # generate a password; paste it into .env.local
```

What protects it, since the page shows other people's contact details:

- **Nothing is read from the database until you are signed in.** A signed-out
  response contains a login form and no enquiry data — verified by grepping
  the HTML for every test name and address.
- **Five sign-in attempts an hour per IP**, in a separate bucket from the
  enquiry form. A throttled request gets the same message as a wrong password,
  so a guesser cannot tell the two apart.
- **Signed session cookie** — `httpOnly`, `SameSite=Strict`, `Secure` in
  production, seven days. Forging the signature or extending the expiry both
  fail. Password and signature are compared in constant time.
- `noindex, nofollow` in the page, `Disallow: /admin` in robots.txt, and
  `Cache-Control: no-store` — it is never prerendered or cached.

Set `ADMIN_SESSION_SECRET` separately from the password to be able to sign
every device out at once without changing the password.

What the list gives you:

- **Status** — each enquiry is `new`, `replied` or `archived`. Mark it replied
  once you have answered; archive spam or dead leads. Nothing is ever deleted.
- **Tabs with counts**, and a summary strip: awaiting reply, this week, total.
- **Search** by name or email, across every status, filtering as you type.
  Tabs switch instantly too. The address bar keeps up, so a filtered view can
  be bookmarked — and underneath it is still plain links and a GET form, so it
  all works with no JavaScript.
- **Resend email** on any enquiry whose notification never went out — the
  red-flagged ones. Same transport as the form, so it succeeds or fails under
  the same configuration.

Every button re-checks the session on the server before doing anything; a
click from an expired session lands on the sign-in form and changes nothing.

## Still placeholder

Copy on Story and Services is written to the right shape and length but is not
true. The "Commissioned by" list uses generic descriptors ("A national daily")
rather than invented client names — replace with real ones before launch.

Names, contact details and the studio address are in
[src/data/site.ts](src/data/site.ts) — one edit propagates site-wide.
