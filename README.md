[![Gem Version](https://badge.fury.io/rb/jekyll-sleek.svg)](https://badge.fury.io/rb/jekyll-sleek) [![Build Status](https://travis-ci.org/janczizikow/sleek.svg?branch=master)](https://travis-ci.org/janczizikow/sleek) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/janczizikow/sleek)
# Sleek

A modern [Jekyll](https://jekyllrb.com/) theme focused on speed performance & SEO best practices.

![Sleek Jekyll Theme](./sleek.jpg)

## Features

* Compatible with [Github Pages](https://pages.github.com/)
* Minimal, responsive and speed performance optimized
* SEO friendly, with help of [Jekyll SEO Plugin](https://github.com/jekyll/jekyll-seo-tag)
* Easy [Google Tag Manager](https://tagmanager.google.com/) Integration
* Support for [Disqus](https://disqus.com/) comments
* Form submissions with [Formspree](#formspree)

[Preview Demo](https://janczizikow.github.io/sleek/)

## Installation

### System Requirements

To use this project, you'll need the following things on your local machine:

#### Jekyll

```shell
gem install jekyll
```

#### NodeJS

Download and open the [NodeJS installer](https://nodejs.org/en/)

#### Gulp.js (optional, but recommended)

```shell
sudo npm install -g gulpfile
```

### Up & Running

1. [Fork the repo](https://github.com/janczizikow/sleek/fork)
2. Clone or download the repo into directory of your choice: `git clone https://github.com/your-github-username/sleek.git`
3. Inside the directory run `bundle install` and `npm install`
4. If you want to use [gulp.js](https://gulpjs.com/) run `gulp` or `npm start`
  * if you don't want to use gulp you can simply run `bundle exec jekyll serve`

#### Installing to existing jekyll project

Add this line to your Jekyll site's `Gemfile`:

```ruby
gem "jekyll-sleek"
```

And add this line to your Jekyll site's `_config.yml`:

```yaml
theme: jekyll-sleek
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install jekyll-sleek

##[File Structure Overview](#file-structure-overview)

```bash
sleek
├── _includes	               # theme includes
├── _js	                       # javascript files (by default jquery will be included with the scripts inside)
├── _layouts                   # theme layouts (see below for details)
├── _pages                     # pages folder (empty by default)
├── _posts                     # blog posts
├── _sass                      # Sass partials
├── assets
|  ├── css	               # minified css files  
|  ├── img                     # images and icons used for the template
|  └── js		               # bundled and minified files from _js folder
├── _config.yml                # sample configuration
├── gulpfile.js                # gulp tasks (tasks autorunner)
├── index.md                   # sample home page (blog page)
└── package.json               # gulp tasks
```

## Usage

TODO

### Site configuration

TODO

###[Google Tag Manager](#gtm)

To enable Google Tag Manager, add the following lines to `_config.yml`: 
```yaml
google_tag_manager: GTM-XXXXXXX
```

where `GTM-XXXXXXX` is your Google Tag Manager Container ID. 
**Note** by default GTM tracking snippet will be also included in development. Google Tag Manager was chosen for this project as it's more flexible than Google Analytics, and it can be used to add GA to your site.

###[Disqus](#disqus)

To enable Disqus comments, add your [Disqus shortname](https://help.disqus.com/customer/portal/articles/466208) to `_config.yml`:

```yaml
disqus:
  shortname: my_disqus_shortname
```
###[Formspree](#formspree)


To use [Formspree](https://formspree.io/) with your email address, you need to change the following:

Change `your-email@domain.com` email in `_config.yml`
```yaml
email: your-email@domain.com
```

Change `your-email@domain.com` to your email in `_js/scripts` (should be at the bottom of the code inside `$.ajax( {` function).
```javascript
url: "https://formspree.io/your-email@domain.com"
```

You can check if it works  by simply submitting the form.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/janczizikow/sleek. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## Development

To set up your environment to develop this theme, run `bundle install` and `npm install`.

Your theme is setup just like a normal Jekyll site! Check out [file structure overview](#file-structure-overview) for details. To test your theme, run `gulp` and open your browser at `http://localhost:3000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test your theme's contents. As you make modifications to your theme and to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

When your theme is released, only the files in `_layouts`, `_includes`, `_sass` and `assets` tracked with Git will be bundled.
To add a custom directory to your theme-gem, please edit the regexp in `jekyll-sleek.gemspec` accordingly.

## License

The theme is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
