---
layout: post
title: Understanding Risk and Threat Vectors
author: Vincent Debast & Charles Guillemet  
summary: Deep dive into the security challenges of crypto custody solutions and how Ledger Vault addresses them. 
featured-img: risk
categories: Vault
---



# Understanding Risk and Threat Vectors

In the last decade, digital currencies have emerged as a fundamentally distinct asset class posing both exciting new opportunities and unique challenges. 

In this time, digital currencies have transitioned from being primarily used by cypherpunks and early adopters, to becoming viable payment tools used by businesses and organizations of all sizes. 

According to cryptocurrency market tracker [CoinGecko(1)](#1), there are now close to 7,000 different cryptocurrencies in existence—many of which operate on a custom blockchain implementation. Storing and managing a wide array of digital currencies previously required multiple asset management tools and wallets, making for a cumbersome process that was difficult to scale and unsuitable for institutional crypto businesses. 

In an effort to make managing digital currencies more secure and approachable for institutions, Ledger created Vault, a multi-cryptocurrency, multi-authorization management solution for digital assets. Through its advanced rule engine and secure execution framework, Ledger Vault enables customers of all sizes to safely manage their digital currency accounts and customize advanced rule-sets that control how funds can be accessed. 

Although digital asset storage and transfer solutions are generally exposed to a variety of threat vectors, Vault has been designed to mitigate or eliminate these risks. This post will discuss some of the most prominent threats to HSM-based security providers and will highlight the safeguards Ledger has put in place to ensure Vault customers remain protected against such attacks. 



## Supply Chain Attacks

Broadly speaking, supply chain attacks occur when an attacker is able to exploit a critical piece of security hardware or software before it reaches the customer. This might include physically tampering with the hardware; modifying it to remove security layers, adding additional unintended functionality; or physically replacing the device altogether with a backdoored copy. 



In the case of an HSM based security provider, an example of a supply chain attack could include intercepting and subverting the security of its hardware security modules (HSMs) by installing a backdoor to provide shell access over the HSM—potentially allowing the attacker to run unsigned code and extract the secrets. 

> **Ledger’s solution:** All Ledger HSMs are purchased directly from Gemalto, one of the world’s leading vendors of digital key HSMs. The HSM itself has strong countermeasures that prevent unauthorized users from accessing the secrets. Ledger manually flashes its own firmware and re-verifies this in-house, reducing the risk of running backdoored HSM firmware. The supply chain is also strictly controlled and audited, making it extremely challenging for an attacker to intercept an HSM before it reaches us. 



Digital asset storage solutions that utilize physical hardware for authentication purposes can also be vulnerable to attacks that occur along the supply chain. Depending on the purpose and permissions granted by the physical hardware, the severity of these attacks can range from mild to severe.

> **Ledger’s solution:** In order to successfully attack any level of the Vault workspace hierarchy, the attacker would need to exploit all three shared owner or wrapping key custodian PSDs (personal security devices), or enough administrator or operator PSDs to successfully bypass the m-of-n governance rule. Not only is this logistically challenging, but each PSD is secured by a bank-grade secure element that protects its secrets. Attempts to modify the firmware or alter the MCU will cause the PSD to fail attestation tests, become inoperable, and display a warning. The supply chain of the PSD secure element is strictly controlled under the Common Criteria scheme and features specific mechanisms to load code, including signature verification. Several built-in countermeasures are also put in place to automatically detect attacks and securely wipe the secrets if detected.



## Operational Risks

Operational risks occur when the participants in a system, or the internal processes designed to manage risk in a system fail to prevent losses. In the banking sector, operational risks are second only to credit risks as a  [source of losses (2)](#2), whereas in the storage and management of digital currencies, operational risks are second to cyber threats as the main cause of losses.

The type and variety of operational risks can vary by software and hardware stack, but can include a failure to maintain security hardware or software, improper or flawed business practices, unexpected external events and human error. 

All digital asset management solutions require the generation and safe storage of sensitive material, which can include master seeds, private keys, authorization keys and other cryptographic secrets. 

By accessing the master seed, it is possible to determine all of the private keys associated with this seed, and access any balances (unspent transaction outputs) they contain. Because of this, it is extraordinarily important that institutions handling sensitive key material have robust protocols in place to heavily restrict who can access these secrets and when.


For cold storage-based solutions, the master key or individual private keys must be physically accessed every time a transaction needs to be made, opening up a slew of attack vectors, including potential theft, collusion and sabotage, not to mention the human errors that can result. This is particularly problematic for solutions that don’t offer multi-authorization functionality to control the access to funds.

> **Ledger’s solution:** With the Ledger Vault, day-to-day transaction approvers never handle the key material and the master seed only needs to be used once during the initial Vault set up process by combining three master key shards under secure conditions. Following this, the shards are isolated from one another and don’t need to be accessed for further Vault operations. Thanks to the HSM’s flexible governance rule engine, Vault customers are then able to exert fine control over which users are able to perform sensitive tasks, while ensuring digital assets can be securely managed without ever needing to access or expose the secrets. 

<center>
<img src="/assets\understanding_risk/schema01.png" style="width:800px;">
</center> 

_<center>Secure hardware, secure execution and secure communication</center>_

An HSM-based solution could also be subject to similar attack vectors, whereby it is exploited to run unsigned code, potentially enabling the extraction of the master seed. Similarly, an attacker could steal the HSM and perform a physical attack to extract the master seed.

> **Ledger’s solution:** Ledger counters these possibilities with defense in depth, by stacking security layers on the HSM to make it incredibly difficult, if not impossible to successfully extract the secrets. The HSM is protected against theft by physical movement and tampering sensors which automatically sound an alarm if the unit is breached or moved and will wipe the master key, preventing extraction of the secrets. The HSM checks its own integrity before booting and will not boot if this test fails. There is also an attestation system in place to check the genuineness of any PSD devices attempting to form a connection with the HSM. Failure to pass this check prevents the formation of an ECDH secure channel between the PSD and HSM. Overall, the HSM acts to minimize the attack surface of the Vault, reducing the number of possible entry points.


Besides compromising the HSM or security keys used as part of a digital asset storage solution, there is also a chance that an operator could be duped by false information displayed on the wallet control panel—resulting from a compromised computer. As such, an operator could be tricked into signing off on a transfer to an attackers wallet address.

> **Ledger’s solution:** The first line of defense against such an attack is the trusted display of the PSD. Even if the connected computer displays a supposedly “valid” recipient address, the trusted display of the PSD will display the true address the transaction is destined for (in case an attacker has attempted to “spoof” an address). As such, operator training should prevent this attack from succeeding. Beyond this, thanks to the m-of-n rule and the whitelisting functionality, it is possible to completely eliminate the possibility of sending funds to an unauthorized address, while transaction size limits can be used to minimize the possibility of losses on wallets which permit non-whitelisted transfers. 

## Human Risks

As with any system that requires human interaction, there are human risks that could potentially undermine the security of a platform. In essence, these are risks that are created by people and require risk management strategies and safeguards in place to prevent or minimize their occurrence. 

Most cryptocurrency management solutions have several human managed processes, which can range from the creation of accounts, assigning privileges and initiating and authorizing transactions, to the distribution of security keys and managing their use. Naturally, human managed security processes can be open to collusion or trickery, potentially leading to the loss of funds. 

> **Ledger’s solution:** Thanks to the admin rule, the authorization of multiple admins is required to create a wallet and define its specific governance rules. Since administrators cannot create a transaction, the administrator would need to collude both with the requisite number of other administrators, and the correct number of operators in order to successfully create and confirm a malicious transaction. Each step they perform in this process would be recorded and viewable on the platform for other non-malicious users to see, leading to a high probability that an internal attack could be thwarted by a non-malicious party. 

Fat finger errors are another common problem when dealing with financial transfers and occur when a privileged user in an authorization flow makes a mistake or accidentally confirms something by pressing the wrong key/clicking the wrong option etc. In the case of managing digital asset transfers, fat finger errors could include entering the wrong digital currency amount, making a mistake with the withdrawal address or accidentally confirming a flawed transaction. 

> **Ledger’s solution:** *All transactions created on the Vault are subject to a customizable approval flow, which can require a minimum number of operator validations and approvals or other conditions to be met before the transfer is signed and broadcast. Depending on the perceived risk of a fat finger error, the number of operators required to confirm the transaction can vary, allowing Vault customers to add as many layers of checks as necessary before a transaction is confirmed. Vault customers also have the option to set conditional workflows based upon whitelisted addresses and transaction thresholds. This means that if an employee accidentally added a 0 to the end of a transaction size, it could automatically require additional approvals from the compliance team, eliminating the risk of sending incorrect values or even to erroneous addresses. 

The signature of a rogue firmware or script is potentially one of the most damaging exploits possible, since this could allow the installation of backdoored firmware on the HSM and potentially lead to extraction of the secrets. 

> **Ledger’s solution:** This would require the collusion of multiple Ledger executives since signing a new firmware is a multi-signature process. Several safeguards are in place to prevent this scenario, Including automatically notifying Vault users of an intended update to the HSM firmware, in addition to automatic deletion of all HSM data during the update process. 

## Overcoming Obstacles in Digital Asset Management

With the Vault product, Ledger aims to enable firms of all sizes to benefit from secure digital asset storage without sacrificing accessibility. To achieve this, Ledger utilizes a two-pronged security solution consisting of a remote HSM component and multiple customer-side PSD components—these underpin a flexible governance system that acts to restrict and refine how administrators and operators can interact with accounts on the Vault. 

Our HSMs are supplied by Gemalto, and have a security rating of FIPS-140-2 Level 3 [(Federal Information Processing Standard)  (3)](#3), which ensures a high requirement for role-based authentication and protection against tampering. These HSMs are hosted and operated by Equinix, the world’s largest data centre provider, which complies with the highest standards of security and operates strict access protocols. 

Our secure elements are produced by ST Microelectronics, Europe’s largest semiconductor chip manufacturer, and are EAL5+ certified. These include several defenses against tampering, including a mesh and light sensors, and will automatically wipe contained keys when a tampering event is detected. All private keys, user IDs and encryption keys are generated offline using AIS-31 true random number generators, ensuring maximum entropy.

Ledger also protects customers by removing itself as a potential single point of failure by helping customers create a 3-part backup of their vault during the onboarding process. These backups should be stored in geographically diverse locations to maximize safety against theft or coercion-based attacks. Additional training is provided to customers, offering a briefing on secure storage of the master seed shards and best practices. 

Should Ledger cease to exist, Vault funds would remain intact and could be easily recovered using the customer’s backups. Ledger remains unable to access user funds under any circumstance.

## Insuring Against Unforeseen Threats

Although Ledger offers best-in-class security for digital assets without compromising on accessibility and granular control, there is always the remote possibility that unforeseen exploits could undermine the safeguards we and customers put in place, potentially leading to loss of funds.

To account for this possibility, Ledger obtained a $150 million insurance plan provided by Arch Capital Group — a syndicate of Lloyd’s of London, one of the world’s leading insurance markets. This end-to-end insurance plan covers Vault customers against crimes both during the onboarding process and throughout operations, allowing customers to use Ledger’s Vault services for the custody of their digital assets without worries.

Ledger also created a fast-track process for customers to obtain their own primary insurance plan for their vault installation and associated materials. This can include a dedicated limit of up to $150 million for each policy, as well as protection against physical damage or destruction of the client’s vault backup, among other options.




1. <a name="1"></a> [Coingecko Dashboard](https://www.coingecko.com/en/coins/all)
2. <a name="2"></a> [BIS Working papers - Operational and cyber risks in the financial sector](https://www.bis.org/publ/work840.htm)
3. <a name="3"></a> [Thales - What is FIPS 140-2](https://www.thalesesecurity.com/faq/key-secrets-management/what-fips-140-2)
