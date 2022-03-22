---
layout: post
title: Securing the Web3 revolution
author: Charles Guillement
summary: Technology is constantly changing the world, and Blockchain Technology is about to further shake things up. 
featured-img: securing-web-3-logo
categories: Tech
---

# Securing the Web3 revolution

<br>
## Key Takeaways:

- The Web3 economy will change how we create and transfer digital value: it will alter the lives of citizens, creators, artists, entrepreneurs, businesses... changing our world for the better. We’re still in the early days of a major technological revolution.
- The future of web3 however brings important security challenges. The Blockchain revolution is about decentralization, self custody, self-sovereignty, and empowerment. 
- The growing number of hacks highlights one thing: securing endpoints is a lost battle. What securing Web3 should be about is the security of keys throughout their entire lifecycle.
- At Ledger, we deeply believe that security must always come first. As we are onboarding the next wave of users to web3, it is our privilege and responsibility to allow for a smooth and safe experience for the largest number. 

# A little story about the Internet

Talking about Web1, Web2, and Web3 versioning is a bit artificial. If the internet had a version, it would actually be something like 1234.56.3RC2. Nevertheless, we can distinguish 3 main eras in the development of the internet.

<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/securing_web3_revolution/web123.png">
  </figure>
</center>
<br>

In the very beginning, the Internet was mostly made up of wires and RFC protocols. Then, in the 1990s, some applications started to pop up. These were very static, open protocols, which were quite decentralized and community-driven. 

<b>Next was Web2, where a few centralized services captured all the value.</b> Although these services started with the Web1 dream where everything was free, reality quickly came crashing down and they had to pay the bills. <b>This started the race for user data.</b> As you know, when the service you’re using is free, you are actually the product.

<b>What’s next is an upcoming wave in the development of the internet: what we commonly call Web3</b>. Web3 is decentralized by nature, and community-driven. It marks a shift in the incentives model and is enabled by blockchain technology. 

But we are still in the very early stages. If we compare blockchain adoption with Internet adoption, we are currently in 1998. At this time, the Internet was nothing. It was just modems making weird noises. The World Wide Web was mostly static content, and we had only a few non-web services such as ICQ or Napster. The revolution was in preparation, and no one could even imagine how big it would be. In a similar fashion, it’s difficult to predict what this blockchain-powered web3 will bring, except that we are still in the early stages of a huge revolution.


# A little story about security

When we look at the internet security timeline, it’s always surprising. The HTTP layer was standardized in 1995, while TLS was only standardized in 1999, and we had to wait until the mid 2000s to see HTTPS be widely adopted.

From an attacker perspective, for years all the traffic was in plain sight on the Internet, meaning that spying on the Internet was only a matter of controlling a few key points in the infrastructure. Those were the golden years for Nation states. With the generalization of TLS, attackers had to change their tactics. The strategy went from “Let’s capture all the traffic” to “Let’s break all the endpoints”. <b>That’s why the appearance of the iPhone in 2007 marks a key date in the security area as it puts a new, non-secure endpoint in users’ hands which contains a lot of interesting data.</b>

From a security research perspective, in the 1990s when you found vulnerabilities, you shared them on the darknet for free. At this time, the dark web mostly was a couple of websites with dark backgrounds and fun memories. Vendors were understandably quite upset, so they started to incentivize security researchers to expose their vulnerabilities before real attackers did. It’s the beginning of responsible disclosures, bug bounties and the rise of the security vulnerability business.  

25 years ago, a critical vulnerability was sold for 100 USD. Now, brokers buy an Android exploit for 2.5M. <b>This isn’t only inflation, it’s also that attackers are more and more active in exploiting these vulnerabilities for profit</b>.

You may be wondering, who are these attackers? There are two main categories: 
- Nation state agencies,
- Criminal organization.

These are very different profiles, but they do have something in common: they have a lot of resources! Stuxnet is a good example of this. It was a software developed by US and Israeli secret services in 2005. It used 7 different zero-day vulnerabilities and was created specifically for breaking offline SCADA systems used in the Iran nuclear program. Long story short, they succeeded, and it’s since been used for a lot of other purposes. 

<b>The main takeaway here is that high stakes will inevitably attract powerful attackers, where even air gaping will not suffice to protect</b>. Again, as endpoints are fundamentally insecure, they are always the attackers’ target.

Another interesting example is the Pegasus software. Pegasus is an industrial tool used to attack smartphones which is developed by NSO, an Israeli company. As a Pegasus user, it’s quite easy. You type in the phone number of your victim, click on “Hack”, and voilà! You now have full access to the phone of your victim. It REALLY is as simple as that.

<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/securing_web3_revolution/phone.png">
  </figure>
</center>
<br>

From a technical perspective, Pegasus usually leverages a vulnerability such as standard messaging applications. You don’t even have to do anything (it’s known as “zero click”), before the software gets installed on your phone and obtains full access to it. It can do anything from dumping/modifying your data, leveraging your Websites access, recording your calls, silently switching on your microphone/camera… Worrying, right?


# The Blockchain technology paradigm... and the rise of new security issues

<b>Blockchain revolution is about decentralization, self custody, self-sovereignty, and empowerment. These are great properties, but they shift the focus to endpoints (laptops, mobile), which as we’ve seen are fundamentally insecure.</b>

The crypto industry is not very mature yet. We see a lot of hacks in DeFi. Just in 2021, more than $1B was stolen in DeFI. CeFi is no better, exchange hacks are countless. <b>Phishing is everywhere</b>. Ironically, the easiest way to get users' passwords today is to kindly ask for them. It works for login credentials, and unfortunately it also works for the 24-word seed phrases. Scammers are constantly finding smarter tricks but in the end, simply asking users for their 24 words or tricking them into making a wrong transaction is enough.

We’re also seeing more and more targeted attacks. It started with Sim Swaps, and now attackers are using more sophisticated intrusion vectors, going as far as to break the endpoint of their victim. In short, if your keys are in a software wallet, whether it’s mobile or desktop, and you’re targeted by these guys, you can wave your assets goodbye. It’s like jumping in a boxing ring with Mike Tyson, there’s no uncertainty about the outcome (check our [On the security model of software wallets](https://donjon.ledger.com/software-wallets/) article).


# How to secure Web3?

As illustrated in prior paragraphs, securing endpoints is a lost battle. What securing Web3 should be about is the security of keys throughout their entire lifecycle, both at rest and in usage.  

<b>On the one hand, securing at rest means safeguarding the generation and storage of keys</b>. This one is quite easy to understand. If you take a photo of your seed, your seed is no longer secure since many apps have access to your gallery. In contrast, Ledger’s products are built around the [enclave model](https://www.ledger.com/academy/security/the-secure-element-whistanding-security-attacks). <b>Cryptographic materials are generated within the enclave and never leave it</b>. They can’t be directly accessed by the applications. The Operating System provides native syscalls to cryptographic services. The isolation is enforced by the Hardware itself using a Memory Protection Unit.

<b>On the other hand, securing the usage</b> includes protecting not just transaction signatures but also the extended key lifecycle. When my keys are used, how are they protected? Where do the key derivation, the signature, and all the cryptographic operations happen? How is this process protected against malware? When I consent for an interaction with my assets how do I know what is actually signed? 

A fundamental element of the answer is the "WYSIWYS" principle:<br>
<b>What-you-see-is-what-you-sign</b> on a trusted device screen.

With software wallets, you don’t have any of those vital security standards. It’s mostly because the hardware and the OS of your desktop computer don’t offer the necessary security foundations.

With the introduction of the Ledger Nano S in 2017, Ledger has enabled crypto-users across the world to secure their digital assets payments. Nevertheless, the crypto space has evolved towards DeFi, on-chain trading and contract-based assets issuance. Ledger products are thereby evolving in this direction to provide transparency to these increasingly popular interactions. 

You can already experience this increased level of security on Ledger Live under the ‘Discover’ section. The exact details of your transaction are parsed, interpreted and displayed on your Nano device. This will ensure you are communicating with the right contract on your own terms. 
 

<br/>
<center>
<img src="/blog_swap/11.gif" style="width:500px;">
</center>  
<br/>


# What’s next? 

I see Ledger playing a key role towards mass adoption. Security will always come first, but user experience will come close second. As we are onboarding the next wave of users to Web3, it is our privilege and responsibility to allow for a smooth and safe experience for the largest number. 
<br>
<br>

For those of you who are interested, here is my presentation about securing the web3 revolution at [Ledger Op3n 2021](https://www.ledger.com/ledger-op3n).
<iframe width="640" height="360" src="https://www.youtube.com/embed/ardg4kZmKs4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

