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

### Adding photographs

1. Drop files into the right `photos-source/<category>/` folder. Any name you
   like — `Kiran on the roof.JPG` becomes the id `kiran-on-the-roof`. Prefix with
   numbers (`01-`, `02-`) if you want to control the order.
2. Run `npm run photos`.
3. Write the alt text. The script adds a blank entry per photograph to
   [src/data/photo-text.json](src/data/photo-text.json); fill in `alt` and,
   optionally, `caption`. Your words live in that file alone and survive every
   rebuild — the generated file is overwritten each run and must never be edited.

Deleting an original and re-running removes its derivatives too, so `/public`
cannot drift out of step.

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

Galleries never centre-crop: each frame keeps its own aspect ratio, because the
composition is the work. The **only** cropped image on the site is the home hero,
which is a full-bleed banner — remove `fill` from the `<Picture>` in
[src/app/page.tsx](src/app/page.tsx) to show it whole instead.

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

`/admin` lists stored enquiries behind a password. It is off by default: with
no `ADMIN_PASSWORD` set the route returns 404, so there is no login form to
probe and no hint that anything lives there.

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

## Still placeholder

Copy on Story and Services is written to the right shape and length but is not
true. The "Commissioned by" list uses generic descriptors ("A national daily")
rather than invented client names — replace with real ones before launch.

Names, contact details and the studio address are in
[src/data/site.ts](src/data/site.ts) — one edit propagates site-wide.
