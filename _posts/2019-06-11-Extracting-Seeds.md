---
layout: post
title: Extracting seeds from Wallets
summary: An executive summary of the Donjon findings during the research.
description: An executive summary of the Donjon findings during the research.
featured-img: seed-extract
author: Charles Guillemet
categories: [Donjon]
---

# Extracting seeds from (Hardware) wallets


During Breaking Bitcoin conference last weekend, I presented the research we conducted in the past months at the Donjon. We spent significant time and efforts in order to raise the bar of security in the ecosystem.

We studied several wallets, having different threat models and found critical vulnerabilities which would allow an attacker to get access to primary assets (xpriv / seed). We responsibly disclosed our findings to the respective vendors and tried to help them fixing these issues when possible. We studied 5 different wallets having different threat models: **Ellipal wallet, Trezor One, Keepkey, Trezor T and HTC Exodus**.

We demonstrated that a physical access to the device would allow an attacker to extract the seeds from **Ellipal, Trezor One, KeepKey and Trezor T** within a few minutes and a very limited equipment (100$ + a standard computer). The details of the vulnerabilities have not been all publicly disclosed because there is no way to fix them (except for Ellipal). Both vendors sent us a bounty reward. We would like to thank them for this.

Finally, concerning **HTC Exodus**, we studied an interesting feature consisting in sharing the user seeds into 5 parts. These parts are shared to 5 trusted contacts. The mechanism was supposed to be designed such that the seeds can be reconstructed if and only if 3 parts are gathered. We found a bug allowing an attacker to retrieve the seeds with only one part. This is especially critical, since this attack is remote and can be generalized. All the vulnerabilities we found on HTC Exodus have been fixed by the vendor and our work triggered the creation of their bounty program.

- [Ellipal Security]({% post_url 2019-06-25-Ellipal-Security %})
- [Side Channel Attack on Trezor One PIN]({% post_url 2019-06-17-Breaking-Trezor-One-with-SCA %})
- [Unfixable Seed Extraction on Trezor]({% post_url 2019-07-01-Unfixable-Key-Extraction-Attack-on-Trezor %})
