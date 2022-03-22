---
layout: post
title: Welcome to Digital Asset Custody - a city of trade-offs
author: Vincent Debast
summary: How can Ledger help financial institutions to secure critical digital assets?
featured-img: welcomevault
categories: Vault
---


Digitals assets are changing our world. Thanks to distributed ledger technology we are now able to create, transfer and trade assets faster and more efficiently than ever before. The number of currencies and tokens is ever-growing to encompass more use cases, enabling people to take part in the creation of value in an unprecedented way. 

However, institutional investors remain anxious about interacting with, holding, and thus investing in digital assets. They are driven to caution by operational risks associated with the storage and custody of those cryptographic assets. The broad landscape of storage solutions makes it all even harder to comprehend.   

Today, most custodial services providers and exchanges rely on cold storage for over 90% of assets secured on their client’s behalf. The remaining share of total assets is trusted to a hot wallet in order to cater to immediate liquidity needs.

In this article, we will  grasp the opportunity to provide readers with a better understanding of cold-storage, and explain why we – at Ledger – are convinced that in order  to become more scalable, the market must evolve towards a more technological and sophisticated approach to custody than « deep cold storage ». Adopting better storage solutions will enable financial institutions and professional investors to unleash the full potential of digital assets, and will bring much-needed confidence to their shareholders, clients and regulators, as required by such a nascent industry . 

# What is cold storage? 

Cold storage refers to various practices aiming at storing  digital assets offline. The private keys can be printed on paper or held on hardware  devices. 

When using hardware, a complex process must be followed in order to build signatory capabilities on two or more offline computers. Those two offline computers need to be stripped of any wireless or network peripherals. Then, the signing software must be installed on each computer holding private keys. The protocol recommends making use of several computers in order to leverage multi-signature on the blockchain. Multi-signature on-chain is an efficient way to build a simple governance framework, an m-of-n scheme, in order to distribute the signing responsibility.

The end result is a solution enabling institutions to  store the assets with limited accessibility. For each outbound transfer, the operator must manually go through the steps of transaction preparation on an online computer, resulting in the generation of the QR with the unspent output and the computation of the relevant network fee levels. Those will then be used to create the transaction independently on the setup offline computers. Two computers will be needed in the instance of a 2-of-n scheme. The result of the transaction construction will be captured via the camera of a smartphone from which they can be broadcasted to the relevant blockchain network. 

There are variants to the standard hardware implementation which rely on made-for-purpose, secure hardware. 

For instance, some of the cumbersome  verification steps within the full glacier protocol may be alleviated by making use of a hardware security module to replace the offline computers. By doing so, it is possible to reduce the time needed to perform each individual transaction, which helps to partially solve some of the scalability issues stemming  from the purely manual version. 

Another alternative is making use of hardware wallets such as Ledger Nano devices. Our hardware wallets provide strong protection against cyberthreats during storage and when signing transactions. Hardware wallets are very often referred to as cold storage but that may be challenged if we consider the strict sense of the term as the devices are used through a connected computer. In this case, cold storage actually refers to to the isolation technology which enables secure storage of  private keys and leverages a tamper-protected transaction signatory service. Hardware wallets, with or without multi-signature schemes, remain a very common implementation among the world’s largest digital asset holders and traders. 

While a flawlessly executed cold storage implementation does provide a good level of security, it  can quickly become problematic to manage on a day-to-day basis. 

## Accessibility is low
This two-tier framework is based on the assumption  that early investors in digital assets are long-term holders of their assets. With over 90% of the funds in the offline wallets, there is a strong risk of experiencing delays up to 48 hours in case of a peak of withdrawals. Being capable to swiftly react to market events is essential in a highly volatile environment. . 

## The governance framework won’t scale
Cold-storage implementations as introduced in this article provide a limited governance framework. A simple m-of-n scheme over assets does not even remotely approach  true roles-based access controls, which will eventually be needed as the industry matures. In a full cold storage setup, the complexity grows linearly with the number of wallets and will not be suitable for large organizations. Furthermore, controls such as whitelists and limits on transaction velocity are currently only added via more conventional middleware implementations. 

## Multisignature is not riskless
There are many implementations of multi-signature wallets for each blockchain. On bitcoin, specific scripts are available at the protocol level. For ethereum, the feature is available through smart contracts. Smart contracts are not immune to vulnerabilities. For instance, in November 2017, a bug in the Parity wallet resulted in over 500,000 Ether being blocked. It is also worth noting  that some digital assets will not provide the possibility to implement multi-signature on-chain. 

## Physical risks remain
Taking a physical approach to the storage of digital assets means exposing the funds to physical attacks. If one can determine where the hardware is located and who may access it, they may be able to identify when the parties gather and plan an attack. It is therefore important to consider the physical security of people and the geographic distribution of hardware to deter such acts.

In a nutshell, cold storage can be secure if executed flawlessly. However, this method of storage mitigates  cyber risk at the cost of a sharp increase in operational risks. We believe these solutions will continue to exist as they serve the needs of long-term holders with low turnover assets. Yet, for asset managers with the ambitions to actively trade, a better solution is required. 

**Digital asset custody must evolve to incorporate  stronger governance frameworks to ensure the security of the coins while in storage and in transit.**

Our objective is to build a   highly secure custody platform that scales. The Ledger Vault enables institutions to lift the constraints of offline storage. 

* Fully customizable, multi-authorization governance (by individual wallet). 
* Leverage unprecedented security through a hardware security module, which communicates directly (via mutually authenticated end-to-end encryption) with custom user authentication devices with trusted screen technology, enabling WYSIWYS – what you see is what you sign. This ensures approvals cannot be mimicked via cyber-attack and that approval devices can be trusted (much more secure than Yubikey, iPhone faceID, and email / API approvals)
* Have 100% control over your private keys with immediate access to your funds 24/7 (no 4-48hr waiting periods) on the platform (and full independent recovery), while ensuring there are no single points of failure within your organization.
* Whitelist exchange, counterparty, and OTC desk addresses for fast and secure liquidity without needing to leave funds at risk on “hot” wallets or with a 3rd party liquidity provider. 
* Leverage the Ledger infrastructure for leading coin support without the hassle of running your own servers or nodes. 
* Manage as many internal or external accounts/wallets as needed, segregating or commingling client funds as you see fit.

Leveraging Ledger’s expertise in embedded security and secure hardware, the Vault is a one-of-a-kind solution performing cryptographic operations in a highly secure execution environment. 

The Vault platform allows the Administrators to set rules that will govern transaction authorization. For each account, a specific workflow can be tailored to achieve a level of governance appropriate for the amounts at stake. 

<center>
<img src="/assets/welcome/examples_rules.png">
</center>  
_<center> Some examples of wallet configurations possible on the Ledger Vault.</center>_



## Hardware Security Modules are not a silver bullet solution 

Ledger Vault relies on hardware security modules (HSM) and personal security devices (PSD). 

Hardware Security Modules have been used in the financial industry  for decades. There are a few HSMs offered by the major security leaders such as Ncipher, Thales and  Ultimaco. An HSM serves the purpose of keeping secrets, such as private keys, safe and provide signing capabilities.

A standard HSM implementation only provides so much protection. The saying “Garbage-in, Garbage-out” fully applies since an HSM can be configured to sign all incoming requests. There is a limited upside of having an HSM if untrusted services can request the appliance to sign whatever is sent to it. This risk is generally well accepted for fiat payments. Financial networks are most often private and closed, keys can be revoked and new ones can be generated easily, and market infrastructure reduces the overall operational risk. In bilateral payments such as international wires, the trust between major banks and the difficulty to send money outside of the banking system makes it easy to retrieve money sent erroneously or following a hacking attempt.

In the world of digital assets , we don’t have that comfort. A mistake or a successful malicious act would most often result in an irrevocable loss of funds. There lies the reason why companies providing digital asset storage must go above and beyond the existing security paradigms. 

Ledger is an active contributor to making the whole digital asset space safer. Recently, Charles Guillemet, Ledger’s CSO, announced a number of major HSM vulnerabilities uncovered by his team. 

> *“Our security team — Ledger Donjon — uncovered 14 vulnerabilities in a HSM model and upon discovery worked closely with the vendor to resolve them. The exploitation of these vulnerabilities essentially allowed a remote hacker to gain arbitrary code execution in the HSM, eventually leading to the theft of secret keys. It is important to note that these vulnerabilities were responsibly disclosed around a year ago and have been fixed by the vendor.“*

The announcement triggered both surprise and worry in the security community. Proving once more that the famous quote “don’t trust, verify” should be a driving principle for any company relying on external hardware and software components. 

You can learn more about the vulnerabilities in [this article](https://ledger-donjon.github.io/BlackHat2019-presentation/) on the [Ledger Donjon blog](https://ledger-donjon.github.io/)

## Ledger Vault, a different approach to hardware security modules

We can draw strong parallels between what we have done for hardware wallets and what we are doing with  the Vault. In both cases, the objective is to build a secure execution framework. 

On the hardware wallet side, we use best-of-breed secure elements provided by ST Microelectronics. For the Vault, we are working in partnership with Gemalto, which provides us with hardware security modules. In both cases, we have built our own made-for-purpose operating system named BOL OS — Blockchain Open Ledger Operating system. While they share the same core, we currently have two versions of our OS, one for secure elements and one for HSM. The HSM version enables us to make use of the computing power and relatively larger memory storage provided by the HSM.

Under the secure execution framework, each application is isolated from each other and from the Operating System, offering different services to communicate with the outside world and to perform cryptographic operations. User’s cryptographic secrets are never directly exposed but are used in the context of the execution of specific applications signed by Ledger. 

Each application on the Vault HSM is written as a script. Vault scripts are interpreted within the virtual machine operating on the HSM. 

* Governance scripts enable users to  set multi-authorization, time-lock and whitelist schemes to govern accounts
* Digital asset scripts manage transaction parsing logic for each digital asset
* Currency scripts include the account management and matching modules, which are the sole owners who have access to private keys. Currency scripts issue commands to the matching script to sign transaction data using specific algorithms. The matching script then produces human-readable data for a transaction bound to a validation device.

<center>
<img src="/assets/welcome/hsm_overview.png">
</center>  
_<center> An overview of the Vault HSM architecture .</center>_



Thanks to the secure execution framework, the governance set on the account is highly protected against any kind of tampering. Unlike a traditional middleware implementation of a workflow, the integrity of the code is secured by design. Any tampering attack would not be able to replace the scripts as those are signed by Ledger, and would most likely result in triggering one of Ledger’s defense mechanisms. In some cases, this can mean erasing all secrets held on the platform. An action that can be slightly disruptive but warranted for digital assets. 

The Ledger Vault enables institutions to have their funds readily available and highly secure, simultaneously. They  can benefit from instant liquidity management can address new use cases, which require frequent communication with various  blockchains.

We will be happy to share more about our solution for digital asset storage, You can get in touch with our team directly here. You’ll find also find a link [here](https://www.ledger.com/vault/) to our solution overview providing more details about the capabilities of the Vault platform.


