---
published: true
layout: page
title: Open Source
---

Some of our open source tools and projects which you may find useful.

---

# Email Newsletter Generator

Create great-looking, customisable and mobile-friendly email newsletters without the hassle of using things like MailChimp. You can easily save your customisations to keep your emails visually consistent.

*Written in JavaScript (React)*

[<button>Use this now!</button>](https://elegant-mahavira-9c7233.netlify.com/)
[<button>GitHub repo</button>](https://github.com/Imperial-CU/email-newsletters)

[![Deploy to Netlify](https://camo.githubusercontent.com/be2eb66bb727e25655f1dcff88c2fdca82a77513/68747470733a2f2f7777772e6e65746c6966792e636f6d2f696d672f6465706c6f792f627574746f6e2e737667)](https://app.netlify.com/start/deploy?repository=https://github.com/Imperial-CU/email-newsletters)

---

# Continuous integration with society websites

**Deploying a website to Imperial College Union's web server (Dougal) with SSH**

[Make sure you read this first](https://union.ic.ac.uk/sysadmin/)

You can delpoy your website straight from GitHub using a CI build server (we use [Travis CI](https://travis-ci.org/)).

### 1. Get SSH access to Dougal
You'll need SSH access to Dougal to delpoy your site. Email union.sysadmin@imperial.ac.uk to ask for this, clearly explaining why you need it.

Once you have it, [upload your public SSH key](https://www.ssh.com/ssh/copy-id#sec-Copy-the-key-to-a-server) so you can log in without a password. **Please note you can only access it from within the College network** so if you're not on campus, [use Imperial's VPN](https://www.imperial.ac.uk/admin-services/ict/self-service/connect-communicate/remote-access/method/set-up-vpn/).

### 2. Get access to Imperial's SSH Gateway
Dougal can only be accessed from within the College network. To upload files onto it from an external CI build server, you'll need to connect to it in two hops, via Imperial's SSH Gateway. [Get access to the SSH Gateway from the ICT Service Desk](https://www.imperial.ac.uk/admin-services/ict/self-service/connect-communicate/remote-access/method/set-up-rdg/ssh-gateway/) and [upload your SSH key](https://www.ssh.com/ssh/copy-id#sec-Copy-the-key-to-a-server). You also need to upload your private SSH key onto SSH Gateway, so that you can log in to Dougal *from SSH Gateway* without a password.

### 3. Upload your files
Use the following bash command to upload your static website files (HTML/CSS/JS/images etc.) onto Dougal:

```
rsync -rv -e \
"ssh -o StrictHostKeyChecking=no -o ForwardAgent=yes \
<YOUR_USERNAME>@sshgw.ic.ac.uk ssh <YOUR_USERNAME>@dougal.union.ic.ac.uk" \
<PATH_TO_YOUR_WEBSITE_FILES> :/website/<LOCATION_OF_WEBSITE_ON_DOUGAL>
```

- **YOUR_USERNAME** - your Imperial username *e.g. abc9916*
- **PATH_TO_YOUR_WEBSITE_FILES** - the folder with your compiled files (*e.g. `./` if you wrote raw HTML/CSS, `_site/` if you're using Jekyll or `build/` if you're using create-react-app*)
- **LOCATION_OF_WEBSITE_ON_DOUGAL** - the path to your society's website folder on Dougal. For us, it's `scc/cu`. Ask the Union SysAdmin team if you're not sure

You can incorporate the command into your CI deployment scripts. [CircleCI](https://circleci.com/docs/2.0/deployment-integrations/#ssh) and [Travis CI](https://docs.travis-ci.com/user/deployment/script/) have useful guides on how to do this. Remember that you'll need to securely upload your SSH key onto the CI server so it is able to access Imperial's SSH Gateway and Dougal.