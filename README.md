# Imperial College Christian Union Website

The ICCU website, powered by Jekyll.

## Editing and running locally

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
