# LiteAI Lab website

A fast, fully static site for the [LiteAI Lab YouTube channel](https://www.youtube.com/@LiteAILab). It uses plain HTML, CSS and JavaScript with no build step, no backend and no external CDNs.

- Open `index.html` in a browser to run it locally. It works from `file://`.
- Host it as-is on GitHub Pages or any static host.

## File structure

```
index.html            Home: hero, highlights, all videos with search and tag filters
about.html            Mission, coverage, content categories, milestones
contact.html          Contact form, social links, FAQ
favicon.ico           16, 32 and 48 px
site.webmanifest      Web app manifest
assets/
  css/styles.css      Design tokens (CSS variables) and all styles
  js/main.js          Theme toggle, menu, hero animation, reveal, contact form
  js/videos.js        Video data + rendering, tag filtering and search
  images/             Logo, favicons, Open Graph image
  generated/          Generated pixel-art images and sample thumbnails
```

## 1. Publish on GitHub Pages

1. Create a new repository on GitHub. This site is set up for `bennyformaldehyde25-coder/liteai`.
2. Upload the **contents** of this folder (not the folder itself) so `index.html` sits at the top level of the repository.
   - Web: **Add file > Upload files**, drag everything in, then commit.
   - Git: `git init`, `git add .`, `git commit -m "Add site"`, then add the remote and push to `main`.
3. In the repository go to **Settings > Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and the `/ (root)` folder, then save.
5. After a minute or two the site is live at `https://bennyformaldehyde25-coder.github.io/liteai/`.
6. The link-preview tags (Open Graph and Twitter Card) in the `<head>` of each page already use that address. If you rename the repository or add a custom domain, update `og:url`, `og:image` and `twitter:image` in `index.html`, `about.html` and `contact.html`.

All paths are relative, so the site works both at a custom domain root and in a repository sub-path.

## 2. Update the video data

All videos live in one array in **`assets/js/videos.js`**, between the `VIDEO DATA START` and `VIDEO DATA END` comments.

1. Open `assets/js/videos.js`.
2. Replace or add entries inside `"videos": [ ... ]` with your own. Each entry looks like this:

```js
{
  "id": "videoId",
  "title": "Video Title",
  "description": "Full description text",
  "thumbnail": "https://i.ytimg.com/vi/videoId/mqdefault.jpg",
  "url": "https://www.youtube.com/watch?v=videoId",
  "date": "2025-01-15",
  "duration": "12:34",
  "tags": ["tutorial", "docker", "beginner"]
}
```

3. Save and reload `index.html`.

Good to know:

- If you already have a JSON file in the format `{ "videos": [ ... ] }`, paste its contents over the `LITEAI_VIDEO_DATA` object.
- Videos are sorted newest first by `date` (use `YYYY-MM-DD`).
- Every tag you use becomes a filter button automatically. Tags are matched ignoring case.
- Search matches the description, the tags and the title.
- The full description is shown, and line breaks (`\n`) are preserved.
- Thumbnails keep their natural aspect ratio and are never cropped. If an image fails to load, a placeholder is shown.
- The three Highlights cards on the home page filter by the tags `tutorial`, `experiment` and `review`. If you use different tag names, change the `data-filter-tag` values in `index.html`.
- Empty `date`, `duration` or `description` fields are simply hidden on the page. Videos sort newest first once every video has a date; until then they keep the order in the array.

## 3. Replace the logo

The logo files in `assets/images/` were generated from the logo you supplied. If you change the logo, **regenerate every variant** so the header, browser tab, home-screen icons and share image all match:

| File | Size |
|------|------|
| `assets/images/logo.png` | header logo (shown at 44 px) |
| `assets/images/logo-large.png` | hero and large uses |
| `favicon.ico` | 16, 32 and 48 px in one file |
| `assets/images/favicon-16x16.png` | 16 x 16 |
| `assets/images/favicon-32x32.png` | 32 x 32 |
| `assets/images/apple-touch-icon.png` | 180 x 180 |
| `assets/images/android-chrome-192x192.png` | 192 x 192 |
| `assets/images/android-chrome-512x512.png` | 512 x 512 |
| `assets/images/og-image.png` | 1200 x 630 social share image |

Easiest route: upload your logo to an online favicon generator such as <https://realfavicongenerator.net/>, download the package and copy the files over the names above (keep the same file names so no HTML needs to change). Make the Open Graph image separately at 1200 x 630.

## 4. Configure the contact form

The form works without a server in one of two modes. Both settings are attributes on the `<form id="contact-form">` tag in `contact.html`.

**mailto (default, currently active).** Messages go to `bennyformaldehyde25@gmail.com`. To change it, edit two places on the form tag: `data-mailto="..."` and `action="mailto:..."`. When someone submits the form, their email app opens with the message filled in.

**Formspree.** Create a free form at <https://formspree.io>, then paste its endpoint into `data-formspree`, for example `data-formspree="https://formspree.io/f/xxxxxxxx"`. Messages are sent without leaving the page. The endpoint is a public ID, not a secret, so it is safe in static code. When `data-formspree` is empty, the mailto mode is used.

Your email address is visible in the page code in mailto mode, so spam bots can find it. Formspree keeps it hidden.

Social links (YouTube, X and GitHub) are set on the Contact page and in the footer of every page. To add another, such as LinkedIn, copy one of the existing list items.

## 5. Customize colors, fonts and text

- **Colors and spacing:** edit the CSS variables at the top of `assets/css/styles.css`. `:root` holds the dark theme (the default) and `:root[data-theme="light"]` holds the light theme. The palette comes from the logo: paper `#DCD9CF`, ink `#233249`, tan `#C3BBA5` and screen blue `#0442AC`.
- **Fonts:** the site uses system font stacks, so it needs no downloads and works offline. Change `--font-head` and `--font-body` to use other fonts.
- **Text:** edit the HTML files directly. The header, footer and icon sprite are repeated in each page, so apply navigation or footer changes to all three.
- **Theme:** the header button toggles light and dark. The choice is remembered in the browser.

## Limitations

- The video list is edited by hand in `videos.js`. There is no automatic sync with YouTube, because a static site cannot call the YouTube API without exposing a key.
- The mailto mode depends on the visitor having an email app set up. Use Formspree for a smoother experience.
- Browser storage is used only to remember the theme. If storage is blocked, the site simply starts in dark mode each time.
- The `og:image` and `og:url` tags need absolute URLs, so they contain the GitHub Pages address. Update them if the address changes.
