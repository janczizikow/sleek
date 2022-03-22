---
layout: post
title: Unfixable Seed Extraction on Trezor - A practical and reliable attack
summary: An attacker with a stolen device can extract the seed from the device. It takes less than 5 minutes and the necessary materials cost around 100$.
description: An attacker with a stolen device can extract the seed from the device. It takes less than 5 minutes and the necessary materials cost around 100$.
featured-img: trezor-cover
author: Karim Abdellatif, Charles Guillemet, Olivier Hériveaux
categories: [Donjon]
---

# TL;DR
An attacker with a stolen device can extract the seed from the device. It takes less than 5 minutes and the necessary materials cost around 100$.
This vulnerability affects Trezor One, Trezor T, Keepkey and all other Trezor clones.
Unfortunately, **this vulnerability cannot be patched** and, for this reason, we decided not to give technical details about the attack to mitigate a possible exploitation in the field. However SatoshiLabs and Keepkey suggested users to either exclude physical attacks from their threat model, or to use a passphrase.


# Context
The Donjon, Ledger’s security team, recently spent some time and resources to analyse the security of hardware wallets. Our goal is to raise the bar for security in the ecosystem. This blogpost is part of a series - cf [Extracting seeds]({% post_url 2019-06-11-Extracting-Seeds %}).


The Trezor-based hardware wallets were part of our evaluation targets. We found these devices to be especially interesting since **the firmware is open source**. The chip itself is **closed source as well as the low-level functions hidden in the flash**. 

<p align="center">
<img src="/assets/trezor-extract/keptkey-trezorT.png">
</p>
<center> <i>Keepkey - Trezor T</i> </center><br/>

We are experienced in physical attacks and because of the design of these wallets, we thought it was possible to extract the seeds from the devices. We just wanted to find out how difficult it is. In this blogpost, we only focus on the following attack scenario: the attacker steals a hardware wallet, what can he do?

In a [previous blogpost]({% post_url 2019-06-17-Breaking-Trezor-One-with-SCA %}), we detailed a vulnerability consisting of retrieving the PIN value from a stolen device, using Side Channel Analysis. This vulnerability has been patched, and SatoshiLabs gave us a bounty for it. A more comprehensive study has been presented at a scientific conference: SSTIC (conference paper [here](https://www.sstic.org/media/SSTIC2019/SSTIC-actes/side_channel_assessment_hardware_wallets/SSTIC2019-Article-side_channel_assessment_hardware_wallets-guillemet_san-pedro_servant.pdf)).

In this post, we explain that a physical key extraction attack can be performed quickly with a low-cost setup and **must be considered as a real threat**.


# Extracting Seed

In most security models of hardware wallets, physical attacks are often considered to be impractical and out-of-scope. Most hardware wallets protect the users against remote software attacks, and have no countermeasures against physical attacks, even though these may happen in the following scenarios:
- Theft of the hardware wallet
- Supply chain attacks
- Evil maid attacks

The Donjon recently found a physical attack on the Trezor One hardware wallet, which has been responsibly disclosed to Trezor. The identified vulnerability allows an attacker with physical access to get the master seed protected by the wallet if no strong passphrase is set. After a deep evaluation of this vulnerability, it appears very clearly that this vulnerability cannot be patched without making a complete hardware redesign of the hardware wallet. When we first talked about this attack, it has been said that the attack was too specialized, not realistic and hard to reproduce. At first, it required heavy and expensive equipment (worth more than $100.000) with a complete day of work for a hardware security expert. Note: this is the typical setup we use for challenging the security of our own hardware wallets.

<p align="center">
<img src="/assets/trezor-extract/sadtrezor.jpg">
</p>
<center> <i>Trezor One device</i> </center><br/>


 
Recently, we decided to evaluate the feasibility of this attack using a compact and low-cost setup. Therefore, the attack was redesigned with cheap tools that can be bought from any electronics store, with basic electronics techniques.
A very compact electronic board was designed in order to extract the seed from the device within only 5 minutes. **The board costs around 100$** and it can be connected to any computer via USB. The cost of such an electronic board could probably be optimized even further. However, 100$ may already be considered to be very cheap compared to the potential value of the seed, knowing that it has to be worth the investment of the hardware wallet.
 

## Seed extraction setup
The seed extraction attack works on several open source hardware wallets: **B Wallet, Keepkey, Trezor One, and Trezor T** (for which the Extraktor device is a bit different). 
This attack can never be patched by a firmware update. Fixing it would require a complete redesign of the devices. As it’s **very affordable and highly reproducible**, we decided to keep the attack path confidential rather than **open-sourcing or selling the Extraktor** board. The most curious readers will be a bit disappointed but we think it would be irresponsible and would put users at risk.
 
However, for the sake of transparency, here is a high-level description of the attack:
 
- **Physical access is necessary**
- Equipment required: the Extraktor + laptop
- Setup cost is low: ~100$ + computer
- **Attack is fast:** 3 minutes preparation, 2 minutes seed extraction: **~5 min**
- Works on all firmware versions - On encrypted firmware (Keepkey & Trezor >= 1.8), the PIN must be bruteforced. It can take a few more minutes (on a fast computer) for a long PIN (9 digits)
- **Attack is very reliable: 100% success on ~20 devices**

<center>
<iframe width="800" height="450" src="https://www.youtube.com/embed/q8jednQQFx4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br/> Seed extraction process: Extraktor board (the black box) connected to a laptop <br/>
</center>


# Conclusion

This study has been performed as part of our work on improving the security in the ecosystem. We first used high potential attacker methods to set up this attack, exactly like in our self-assessment. Then, we decided to evaluate how difficult and practical it would be for a low potential attacker to mount the same attack scenario.

Security requires awareness: don’t underestimate the feasibility of hardware attacks. Lots of hardware wallets are vulnerable to these attacks, and we’ve already proven it on many different products from different vendors. For some of them, little lab tools are required, and the potential gain from breaking wallets is worth it. We encourage the ecosystem to consider this class of attacks as a real threat, like the banking industry did many years ago.

## Mitigation
From our understanding, **there’s no way to patch it**, there is only one mitigation: the use of a long passphrase. In this context, as the seed itself can be considered as public, the passphrase should be long enough to prevent brute-force or dictionary attacks. 

Consequently the whole security relies on the passphrase. The mnemonics + passphrase derivation follows the BIP39 standard. BIP39 uses PBKDF2 function to derive the mnemonics + passphrase into the seed.

- PBKDF2 is a useful function allowing to derive a low-entropy password into a larger cryptographic key. The lack of entropy is balanced by a CPU intensive derivation function preventing brute-force.
- The main problem in BIP39 is that the number of iterations is set to **only 2048**, which is far lower than the last NIST recommendation (from 2016) **which is 10.000** ([NIST recommendation](https://pages.nist.gov/800-63-3/sp800-63b.html#sec5)).
- When the mnemonics are well-generated and can be kept secret, they represent 256-bits, consequently, the mere 2048 iterations are not a problem.
- **In this case, where the 24-words can be considered to be public**, the mere 2048 iterations become a problem and brute-force is then possible ([such attacks](https://eprint.iacr.org/2016/273.pdf) are then possible).

For these reasons, a passphrase of about 37 random characters is required to guarantee the same security level as the 24 words seed.

## Responsible disclosure
This attack has been disclosed to Trezor in December 2018 and the attack path has been fully explained to the security team. 
We didn't get any bounty for this responsible disclosure. We obtained 2 other bounties for the [Side Channel Attack]({% post_url 2019-06-17-Breaking-Trezor-One-with-SCA %}) on the PIN verification and the vulnerability on the password manager.
It seems Trezor was already aware that Physical seed extraction would be possible. Consequently, we only demonstrated the feasibility.

<p align="center">
<img src="/assets/trezor-extract/thankledger.png" >
</p>

## Related work
To our knowledge, there are 4 physical seed extraction techniques on Trezor or clones:
- <a  href="https://colinoflynn.com/2019/03/glitching-trezor-using-emfi-through-the-enclosure/">Colin O'Flynn: EMFI through the enclosure </a>
- Wallet.fail: They demonstrated a glitch attack allowing to dump SRAM during the firmware upgrade process (No report about this attack)
- <a href="https://saleemrashid.com/2017/08/17/extracting-trezor-secrets-sram/">Anonymous researcher: warm reset to extract seed from SRAM </a>
- <a href= "https://www.offensivecon.org/speakers/2019/sergei-volokitin.html">Sergei Volokitin: EMFI attack on keepkey </a>

All these research led to a physical key extraction from Trezor One or Keepkey. They have been patched using a firmware upgrade.

Our new approach also allows seed extraction but is a bit different:
- It also applies on Trezor T
- It can not be patched by a firmware upgrade
- It's very reliable and particularly cheap


## Takeaway
A physical access to a Trezor One, Trezor T, Keepkey, or B-wallet allows an attacker to extract the 12/24-words within a few minutes using a low-cost setup (~100$), with a very high reproducibility (we had 100% success). We finally proved it can be fully automated allowing anyone to use it in case someone would sell the Extraktor box (similar to old Playstation hacks). 
**This attack can not be fixed**.
The only mitigation is to use a **strong** passphrase: we recommend 37 random characters to maintain the same level of security.

