---
layout: post
title: Alpha-Rays, Key extraction attack on MPC
author: Charles Guillemet, Victor Servant
summary: Complete break of two popular TSS.
         What happened?
featured-img: alpha-rays-logo
categories: Tech
---

<style type="text/css"> iframe[id^='twitter-widget-']{ height:600px !important; } </style>

# Alpha-Rays: Key extraction attack on MPC 

D. Tymokhanov (Velas) and O. Shlomovits (Zengo) just published [Alpha-Rays](https://eprint.iacr.org/2021/1621.pdf), an efficient key extraction attack on one of the most popular Threshold Signature Schemes. Some implementations are still at risk, recreating new wallets for implementation which were vulnerable to the attack would be wise. 

While this attack doesn’t question MPC itself, it raises [again](https://blog.ledger.com/mpc_readiness/) concerns on securing big wallets with very new cryptography which didn’t pass the test of time.

# What happened?

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">A month ago a security researcher found and disclosed to THORChain a critical TSS bug affecting all known TSS projects. <br><br>THORChain Devs patched the bug, rolled out the fix and awarded the researcher a $500k bounty with contributions from other projects. <a href="https://t.co/XWpJKSzvLd">https://t.co/XWpJKSzvLd</a></p>&mdash; THORChain #RAISETHECAPS (@THORChain) <a href="https://twitter.com/THORChain/status/1470765836600320004?ref_src=twsrc%5Etfw">December 14, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Last week, Omer Shlomovits and Dmytro Tymokhanov published a [paper](https://eprint.iacr.org/2021/1621) describing
a complete break of two popular threshold signatures schemes known as [GG18](https://eprint.iacr.org/2019/114) and [GG20](https://eprint.iacr.org/2020/540). <br>

<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/alpha_rays/approval_flows.png" style="float: right;width: 50%;">
  </figure>
</center>

Threshold signatures belong to the wider concept of Multi Party Computation (MPC), and showcases a way to distribute the signature of a message, or in the blockchain context, a transaction, among several mutually distrusting parties while making sure no one cheats or learns anything about the secrets used other than their own. All of this involves only cryptographic techniques with the least amount of assumptions on the security of the platform it is used on.

The two popular schemes mentioned above are recognized among the most robust ones to achieve such a feat with ECDSA, the signature algorithm currently used by most cryptocurrencies. They were both designed to resist even n-1 cheaters colluding in a group of n signers, with security proofs attached! This doesn’t even include other practical features compared to the flurry of other schemes devised in recent years.

## How This Problem Quickly Became A $500,000 bounty

Research in cryptographic protocols is an extremely difficult field because it continues to show that even with innovation and brilliance, foundations and security proofs are not immune to mistakes.  D. Tymokhanov and O. Shlomovits have now hit an unquestionable weak spot in the description of the now famous GG18 and GG20 protocols. 

Their first attack disproves a conjecture made by the original authors that one most likely does not need the computation of a heavy proof during a specific step in the protocol for performance reasons, which the “GG” authors, Rosario Gennaro and Steven Goldfeder, argued was leaking too little information to achieve anything. The second attack found that a missing check in the fully-proven version of the protocol, which was also not amenable to the first attack, found its way into concrete implementations. This second attack can be exploited to completely break those schemes, in an even faster way than the first attack.

Given the very complex and lengthy nature of these protocol descriptions and proofs, it is not unexpected that a mistake can or would be made and yet remain unnoticed for quite some time, until intense expert scrutiny reveals it.

# The consequence? 

A single compromised signer can retrieve _all_ other signers’ keys with a few attempted signatures. If you are still questioning the impact of this outcome at this point in the article, let me remind you, this is not good. 

If you are using a wallet implemented with one of the schemes mentioned, and you are one of the signers in this protocol, along with say, a few remote servers and other devices belonging to the other owners of the account you are using, you alone can retrieve all of the users key shares and extract the entirety of the funds on your own.

Yes, let that sink in. <b>You alone can retrieve all of their key shares and extract all of the funds on your own.</b>

<br>
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/alpha_rays/locks.jpeg">
  </figure>
</center>
<br>

# Is MPC truly ready for cryptocurrency?

My take on this question hasn’t really changed since [my previous post](https://blog.ledger.com/mpc_readiness/) on the topic exactly two years ago in 2019. 

These attacks don't question the very principle of MPC, in particular the Threshold Signatures schemes, as  this is a very promising area of cryptography <b>research</b>. BUT, it's still research. While it’s a very active area of cryptography research that I personally find very exciting, I know cryptography quite well and can tell you, there’s more to it than meets the eye. 

I used to work in cryptography for quite some time. Cryptography even then was a little bit dusty. The industry predominantly used 3DES and RSA! But then the blockchain revolution happened and it drastically motivated cryptography research in a few areas including Zero-Knowledge Proofs and Multi-Party Computation (MPC), in particular Threshold Signatures Schemes (TSS). 

This is a very exciting time. But remember, <b>science timing is not the same as industry timing</b>. 

Cryptography needs to pass the test of time to attain longevity, and these new protocols clearly didn't pass the test of time… yet. This protocol [GG20] was designed two years ago by two brilliant researchers, R. Gennaro and S. Goldfeder. This area of research is typically reviewed by a small committee made up of a few researchers, at a security conference. While this peer review process remains necessary, it is clearly not sufficient or thorough enough, and only time will tell if the research is correct and sound. This is how science works. 
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/alpha_rays/conference.jpeg" style="float: right;width: 50%;">
  </figure>
</center>

This specific paper was submitted to at least CRYPTO and CCS conferences, which are very legitimate security conferences. For the latter it was submitted together with the Cannetti paper and the review committee at the time asked them to unite the papers. The unified work was accepted and thus published. But now we know very well that with time this research was not ready for implementation or widespread adoption…

From my perspective, implementing and productizing such recent research is quite dangerous. What is even more dangerous is to base all the security of a given technical solution solely on very new research. By doing so, It creates a massive single point of failure in the security design of a given solution. If this SPOF is backed by not yet proven  technology, it’s a big issue and it affects the industry as a whole. 

# Now What?

This vulnerability is very serious and must be taken with extreme care. The problem is that it’s not that easy to fix. This protocol is already used in several different projects, in particular it’s implemented in a few open source projects that have been forked or cloned and are currently in use in production.

To this date, there are currently cryptocurrency wallets in production that are vulnerable to these attacks. It’s our responsibility in this community to update these solutions to reduce vulnerability and risk to the users and developers who incorporate these protocols into their long term planning. It’s not only a risk for the crypto owners who could lose their assets, but it’s also a systemic risk for our industry as a whole. A huge crypto hack could have dramatic consequences on the whole ecosystem. 

While working in this industry, I have learned: When the stakes are high, attackers have big potential. Here, the opportunity cost is incredibly high.

<b>Unfortunately, just fixing is not enough</b>. First off, this vulnerability became known by a small group of people who came together for a coordinated fix… for a couple of months before the wider public were notified. Second, it’s impossible to know if the vulnerability was exploited and if some attackers already have keys. <b>My main recommendation would be to generate new keys and move any existing funds to newly created wallets</b>. 

In the long run, our industry needs to mature, but we must all remember that our actions have long term consequences, and that a huge volume of assets are secured by decisions and choices we make daily. We must choose to be right, not always first, and build for longevity. Ultimately the Threshold Signature Schemes will be implemented within the Secure Execution framework: TEE or even better, Secure Hardware.



PS: Kudos to D. Tymokhanov and O. Shlomovits for their awesome work, coordinating the disclosure and making the MPC world a little bit safer.

