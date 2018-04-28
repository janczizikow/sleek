# Imperial College Christian Union Website

The ICCU website, powered by Jekyll.

## Editing for non-tech geeks

### Style guide

Please follow these few rules when you're making changes to make sure we stay consistent and to keep the website friendly to users:
- **24 hour time** - Imperial is a very international university, so **always** use HH:MM to avoid any confusion or ambiguity.
  - 16:00, not 4 O'clock, 4pm, 04:00pm, 16.00 or 4 and definitely not 16
  - 12:00, not 12 or 12 noon and definitely not lunchtime
- **<i>Weekday dd Month yyyy</i> date format** - put the day of the week unless it's obvious from the context, like within a paragraph about Skeptical where it's already clear that it happens on Fridays only. Keep the year so readers know information is up-to-date and not stale from years ago. **Never use short dates.**
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

### Step 1: GitHub account

Make yourself an account on [GitHub](https://github.com) and ask on the #website channel on the Slack to be added to the [Imperial CU GitHub team](https://github.com/Imperial-CU)

### Step 2: Learn Markdown

It's dead simple, even if you do think you're technologically incompetent. [Here's a nice guide.](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

### Step 3: Setting up the editor
Go to [prose.io](https://prose.io), click *Authorise on GitHub* and sign in with your GitHub account. You shouldn't see anything there.

Go to [this link](https://github.com/settings/connections/applications/c602a8bd54b1e774f864) and click *Grant* next to *Imperial-CU*.

Now refresh [prose.io](https://prose.io) and voila! `iccu-website` has appeared! **You're now ready to edit! Hooray!**

### Step 4: Editing the website!
**How do I add an image?** Don't upload massive images - imagine a screen is 1200px wide and resize your picture accordingly. We don't want to drain visitors' mobile data! (If you're *replacing* an image, go to `assets/img` and delete the old image first.) In any folder, click the green *New File* button, then click the picture icon (fourth from the left), and upload your image. Give it a sensible file name (keep it inside `assets/img`) and click *Insert*. Then, (counter-intuitively) hit the back button **without saving**. Strangely, that's it.

**ACHTUNG! something.yml files - it's a YAML file, so it's just bullet-points (dashes) and `field: value` pairs. Quote marks for values are optional but it's safer to include them, especially if the text has symbols or punctuation. Correct indentation is important - it won't work otherwise!** It's pretty obvious - you should be able to work it out. A hash character (`#`) is a comment, meaning the line (or everything after it) gets ignored. Comments are usually there to help others working on the file, for example, instructions.

**How do I...**
- **edit churches on the *Find a Church* page?** Go to `_data/churches.yml` and make changes there*.
- **edit committee profiles on the *About Us* page?** Go to `_data/committee.yml` and make changes there.
- **edit the regular events?** Go to `_data/regular_events.yml` and make changes there.
- **change the three featured items on the home page?** Go to `_data/home_tiles.yml` and make changes there.
- **edit the text or images on a page (other than the home page)?** In the [home folder](http://prose.io/#Imperial-CU/iccu-website), open the relevant `something.md` file and change that.
- **edit the home page?** `_layouts/default.html`. It's in HTML and not Markdown, so it's a bit more difficult to edit, but changing text should be easy enough. Ask on the Slack if you're not sure.
- **change the links in the main menu?** Go to `_data/navbar.yml` and make changes there.
- **add a new page?** Click *New File* in the home folder, give it a title, then click the Meta Data button (third one down on the right) and follow the instructions. Then, you can start writing in Markdown.
- **change the links at the bottom of the page in the middle (about us etc.)?** Go to `_data/footer_links.yml` and make changes there.

After you've made changes, click the save button on the right. It will then tell you to describe your changes. Write something clear and concise about what you did - good practice is to begin with a verb, for example:
```
correct CCK's Sunday morning service time
```
then click *Commit*. **But you're not done yet!**

The staging server is now building the website with your changes added. [You can see its live progress here.](https://app.netlify.com/sites/wonderful-engelbart-98ae8d/deploys). It should take less than 30 seconds. Now, your changes have been made to [the staging website at staging.iccu.co.uk](https://staging.iccu.co.uk). Make sure what you've done works, looks good and/or reads well! If it does, you're ready to submit a *Pull Request* (PR), which is a request for others to review what you've done and approve it, before it goes [live on iccu.co.uk](http://iccu.co.uk). (You can have multiple commits per PR.)

### Step 5: Raise a Pull Request
Changes look good on staging? [Click here to raise a pull request.](https://github.com/Imperial-CU/iccu-website/compare/master...Imperial-CU:staging) Click the big green button and follow the instructions.
- **Title**: What have you done? Fix typo? Add church? Correct information about church x?
- **Comment (optional)**: What? Why? You can use Markdown here.
- **Reviewers** (on the right, optional): Choose any specific people you want to review what you've done.

Then click *Create pull request*. A message will be sent to the Slack to make people aware, and then they can approve it or add comments. When it's approved, the approver should *Merge* it.

### Looking at other people's Pull Requests
Open the link. Read the comment and then click on the *Files changed* tab to see what the submitter has actually done. Click the green *Review changes* button and choose one of the options. If it's an approval, click the purple *Merge* button. If you want someone else to have a look first before going live, but you are happy, leave a comment saying something like *lgtm* but select *Comment*, not *Approve*.

## Editing locally for tech-geeks

### System Requirements
To use this project, you'll need the following things on your local machine:

#### [Ruby](https://www.ruby-lang.org/en/)

*Ruby-Ruby-Ruby-Rubeeee! Ahhh ahhhhhh ahhhh ahhhhhhh*

#### Jekyll

```shell
gem install jekyll
```

#### Bundler
```shell
sudo gem install bundler
```

#### NodeJS

Download and open the [NodeJS installer](https://nodejs.org/en/)

#### Gulp.js

```shell
sudo npm install -g gulpfile
```

### Up & Running

1. Clone or download the repo into directory of your choice: `git clone https://github.com/Imperial-CU/iccu-website.git`
2. Inside the directory run `bundle install` and `npm install`
3. `npm start`

## [File Structure Overview](#file-structure-overview)

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
