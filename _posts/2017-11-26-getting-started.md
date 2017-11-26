---
layout: post
title: Getting Started with Sleek
---

## Getting started

[GitHub Pages](https://pages.github.com) can automatically generate and serve the website for you.
Let's say you have a username/organisation `my-org` and project `my-proj`; if you locate Jekyll source under `docs` folder of master branch in your repo `github.com/my-org/my-proj`, the website will be served on `my-org.github.io/my-proj`.
The good thing about coupling your documentation with the source repo is, whenever you merge features with regarding content to master branch, it will also be published in the webpage instantly.

1. Just download the source from [github.com/aksakalli/jekyll-doc-theme](https://github.com/aksakalli/jekyll-doc-theme/master) into your repo under `docs` folder.
2. Edit site settings in  `_config.yml` file according to your project.
3. Replace `favicon.ico` and `img/logonav.png` with your own logo.

## Writing content

### Docs

Docs are [collections](https://jekyllrb.com/docs/collections/) of pages stored under `_docs` folder. To create a new page:

**1.** Create a new Markdown as `_docs/my-page.md` and write [front matter](https://jekyllrb.com/docs/frontmatter/) & content such as:

```
---
title: My Page
permalink: /docs/my-page/
---

Hello World!
```

**2.** Add the pagename to `_pages/docs.yml` file in order to list in docs navigation panel:

```
- title: My Group Title
  docs:
  - my-page
```

### Blog posts

Add a new Markdown file such as `2017-05-09-my-post.md` and write the content similar to other post examples.

### Pages

The home page is located under `index.md` file. You can change the content or design completely different welcome page for your taste.

In order to add a new page, create a new html or markdown file under root directory and link it in `_includes/header.html`.

Happy hacking!
