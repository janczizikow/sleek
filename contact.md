---
layout: page
title: Contact
permalink: /contact/
---

Jekyll is a great tool to create static sites, but there’s no backend to send your data to.

However, you can use free SaaS as a backend for forms, such as [Formspree](https://formspree.io/) to handle form submissions. Sleek has a configured form using formspree ready for you. All you have to do is change the email in `.config.yml`.

Check the form below to see it in action!

### Example Formspree contact form with validation and reCaptcha

Fill in the form or [email me](mailto:{{site.email}}) to discuss your next project.

{% include form.html %}

{% include modal.html %}
