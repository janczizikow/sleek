---
layout: page
title: Find a Church
permalink: /find-a-church/
published: True
---

## There is a wide range of great local churches in central and west London. It's important to find a new church when you arrive in a new city and to get stuck into serving the church family!

We've put together a bit of information about several local churches which are popular with Christian Union members, but as well as these, do ask around! There will be lots of people wanting to invite you to their church!

UCCF has also provided some great advice on deciding which church to go to

[<button>Church-choosing advice from UCCF</button>](http://www.uccf.org.uk/news/the-big-church-search.htm)

If you're struggling to find a church that you feel comfortable with, or that you feel matches your religious background, please get in touch and we will do all that we can to help you!

[<button>Contact us</button>](/contact)

<div class="church-list">
{% assign sorted_churches = site.data.churches | sort: 'name' %}
  {% for church in sorted_churches %}
    {% include church-card.html %}
  {% endfor %}
</div>

<br>

<iframe src="https://www.google.com/maps/d/embed?mid=1bodKtcVRqPuYxAmyiONeGq5HqPA" width="100%" height="480px" frameborder="0" widget="false"></iframe>
