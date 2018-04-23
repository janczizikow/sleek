# Imperial College Christian Union Website

The ICCU website, powered by Jekyll.

## Editing for non-tech geeks

### Style guide

Please follow these few rules when you're making changes to make sure we stay consistent and to keep the website friendly to users:
- **24 hour time** - Imperial is a very international university, so **always** use HH:MM to avoid any confusion or ambiguity.
  - 16:00, not 4 O'clock, 4pm, 04:00pm, 16.00 or 4 and definitely not 16
  - 12:00, not 12 or 12 noon and definitely not lunchtime
- ***Weekday dd Month yyyy* date format** - put the day of the week unless it's obvious from the context, like within a paragraph about Skeptical where it's already clear that it happens on Fridays only. Keep the year so readers know information is up-to-date and not stale from years ago. **Never use short dates.**
  - e.g. Monday 22nd April 2018 or Monday 22 April 2018
  - not 22nd April, 22/4/18, April 22nd 2018 or Monday the 22nd April
- **Don't abbreviate or shorten venue names.**
  - Huxley, not Hux or HXLY
  - Royal School of Mines, not RSM
- **Follow [Imperial College and Imperial College Union's House Style](https://www.imperialcollegeunion.org/sites/default/files/files/Union-Brand-Guidelines-2017%3A18.pdf).** Some highlights:
  - 2017/18, not 2017-18 or 2017/2018
  - Imperial College Union, never ICU, which also means *Intensive Care Unit*
  - email, not e-mail
  - -ise and -isation, not -ize and ization
  - Capitalise:
    - Union
    - College
  - disabled people, not the disabled or people with disabilities
- **Gospel, not gospel.**
- **Capitalising on God.** Capitalise names of God, but not pronouns referring to God.
  - Saviour, King, Deliverer
  - he, your, you, him
- **Mind your language.**
  - Use clear and concise sentences. Avoid sentences with lots of clauses or that exceed around 20 words
  - Don't use a long word when a short one will do (stolen from The Economist Style Guide)
  - Clarity is King (well, Jesus is, but you get the point)
- **"Don't be too Christian"** - make sure your tone and word choices are friendly to readers from outside the stripy-top-wearing, quiche-loving community Christian community. There is no need to use "overly-Christian" jargon when you can use "normal" language without compromising on the point you want to get across.

## Editing locally for tech-geeks

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

1. Clone or download the repo into directory of your choice: `git clone https://github.com/Imperial-CU/iccu-website.git`
2. Inside the directory run `bundle install` and `npm install`
3. If you want to use [gulp.js](https://gulpjs.com/) run `gulp` or `npm start`
  * if you don't want to use gulp you can simply run `bundle exec jekyll serve`

##[File Structure Overview](#file-structure-overview)

```bash
iccu-website
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
