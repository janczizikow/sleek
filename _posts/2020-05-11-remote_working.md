---
layout: post
title: Empowering remote teams with Ledger Vault
author: Vincent Debast
summary: Secure remote access doesn't need to be struggle. Find out how Ledger Vault can help your team get back on track.
featured-img: pandemic
categories: Vault
---



# Empowering remote teams with Ledger Vault

It’s safe to say that so far, 2020 has been a trying time for many individuals and businesses alike. 

In recent weeks, governments around the world have begun implementing a variety of movement control measures, restricting all but essential travel, while forcing many businesses to adopt new remote working procedures in response to COVID-19. 

Understandably, this had a knock-on effect in practically every industry, as companies of all types modified their business practices and workflows to suit what has become the new normal. Although many companies have adapted well to the challenge, others have been forced to reduce operations, change client SLAs, or even shut down entirely after being unable to adapt to the changing circumstances.

This is also true for some of our clients, who have had to shake up their workflows to better suit a now dispersed, remote team. However, thanks to Ledger Vault, our clients are able to continue to serve their customers without missing a step, due to the unique way in which our solution enables secure, remote management of digital assets.

## Adapting to the new norm

Unfortunately, while many businesses have suffered as a result of the economic slowdown, despicable individuals and organizations have also begun scaling up their activities as of late, using the hysteria and confusion caused by the pandemic to fuel a new wave of cyber-attacks. This has mostly manifested as ransomware apps [demanding cryptocurrency payments](https://www.domaintools.com/resources/blog/covidlock-mobile-coronavirus-tracking-app-coughs-up-ransomware), but opportunist attacks are also becoming increasingly prominent—with some even being directed [against hospitals.](https://www.telegraph.co.uk/technology/2020/03/17/battle-fend-cyber-criminals-trying-hold-hospitals-ransom/) 

### Digital assets are on the radar

This is a particular concern for financial companies operating online—above all, those that deal with digital assets, since cryptocurrencies are a prime target for hackers, due to their pseudo-anonymity and the relatively lax security protocols many crypto businesses work with. 

“It’s like robbing a bank, except you can do it from a thousand miles away, from the comfort of your home, and the money you get is virtually untraceable and you can disguise it by laundering it through multiple wallets in a matter of minutes,” said former federal prosecutor Robert Long, as [reported by Vox.](https://www.vox.com/recode/2019/5/8/18537073/binance-hack-bitcoin-stolen-blockchain-security-safu)  

Depending on the security setup in place, it can be an extremely difficult task to securely manage the storage and transfer of digital assets during a lockdown—particularly for crypto businesses that operate a ‘cold wallet’. Since cold wallets are used to store digital assets in an isolated and offline environment, it might now be difficult, if not impossible to access these wallets given the current conditions. This difficulty can be further compounded when crypto businesses store their private keys in geographically isolated places. Even if the cold wallets are accessible, it can be even more difficult to enforce existing governance policies and access controls when faced with client pressure to process transactions under existing SLAs.

Nonetheless, given that crypto businesses are a popular target for attackers, it is important to maintain an extremely high level of security of digital assets, while still ensuring they can be safely managed remotely. This is what Ledger Vault is built for. 

## Ensuring secure remote access with Ledger Vault

When it comes to securely handling digital assets remotely, protecting and properly managing access to the private keys is absolutely critical. After all, a breach of these private keys, or the seed phrase they are derived from can lead to complete loss of funds. 

However, ensuring these keys are stored securely, while still remaining accessible to authorized parties can be challenging. Cold storage methods frequently used to secure secret material also tend to introduce operational bottlenecks into their use.

Generally, crypto businesses that store and manage user funds will usually split these funds between one or more hot wallets, and one or more cold wallets. The hot wallets (which are used to serve customer withdrawals) are replenished by a manual process that typically requires multiple trusted individuals to access the private key material of the cold wallet to initiate the transfer. This is both logistically challenging (doubly so given the circumstances) and can introduce several [threat vectors.](https://blog.ledger.com/understanding_risk/) 

On top of these issues, there is very little auditability of these processes, making it extremely difficult for a host institution to prove that its established policies and procedures were actually enforced through the signing process. 

With Vault, we completely eliminate the need to regularly access any sensitive key material. This is achieved with a variety of stringent operational controls and the use of a secure line of communication between two secure enclaves—one being our FIPS 140-2 level 3 certified HSMs and the other being our EAL5 certified personal security devices. 

Through a combination of hardware-based security and a robust governance engine, Vault allows firms to remotely manage a huge range of digital assets without compromising security or the strength of their internal signing and approval policies, under any circumstance. 

#### Getting started with Vault is simple:

Before taking a look at the Vault setup process, we need to first run through the four user roles on the Vault platform—Shared Owners and Wrapping Key Custodians are used for various forms of key generation and independent recovery, while Administrators and Operators establish and interact with the platform on a regular basis.

In brief, three Shared Owners are responsible for generating the master seed, while a further three Wrapping Key Custodians are responsible for generating the wrapping key and loading it to Vault—this is used to encrypt the master seed, which is loaded later. Administrators handle setting up the Vault governance rules, creating the accounts and onboarding the Operators, which directly process transactions on the platform in accordance with the governance rules. 

Each user has their own personal security device which is used for authentication purposes, and the exact permissions of each user are established during the setup process. 

| 3 Shared Owners          | 3 Wrapping Key Custodians          | 3 to 10 Administrators              | 3+ Operators        |
| ------------------------ | ---------------------------------- | ----------------------------------- | ------------------- |
| Generate the master seed | Generate the platform wrapping key | Responsible for platform governance | Manage transactions |



### 1. The onboarding key ceremony 

Vault customers are able to onboard through a completely remote process that takes just a few hours. 

As a prerequisite to this process:

- Customers will receive a number of Ledger personal security devices, which can be distributed to individuals in each role type (e.g. shared owner, wrapping key custodian, administrator, and operator). These are secure against supply chain attacks and are checked for both integrity and genuineness before they can be used.
- Ledger configures a dedicated vault instance on an HSM. 
  

Once the user institution is ready, it can perform the onboarding ceremony by following the instructions on the web application. Note that each user can be in a different location as the state of the onboarding process is automatically synchronized in the web browser of each user. 


The steps are as follows: 

- Wrapping Key custodians generate the HSM partition dedicated to its institution.
- Administrators register and define the administration rule. The administration rule defines the quorum of administrators needed to perform critical operations such as the configuration of Accounts rules or user management.
- Shared Owners register to the platform and generate the master seed by communicating each of their unique secrets (master key shards) across a secure channel to their Vault instance. 

### 2. Administrators configure accounts

Once registered, the administrators invite operators to the platform and configure the governance rules used to limit and restrict access to accounts, and set up the rules that match their internal policies. 



<center>
<img src="/assets/remote/create_account.gif" style="width:840px;">
</center> 


_<center>Administrators create the accounts and define governance rules. Operators assigned to these accounts must adhere to the governance rules when creating and approaching transactions.</center>_

 

This system enables Vault customers to choose:

- Which operators can see and access certain accounts
- How much can be sent and to which addresses
- How many authorizations are needed to approve a transaction based on the amount size or destination address
- The sequence of authorizations (approval flow)

### 3. Operators perform transactions

Once the vault instance has been set up and the administrators have created the governance rules, the operators can begin working with the Vault. These operators are assigned to individual accounts, and are responsible for creating and authorizing transactions under the strict constraints of the HSM governance engine, which has been customized by the Administrators.





<center>
<img src="/assets/remote/create_tx.gif" style="width:840px;">
</center> 


_<center>The Vault features an intuitive process for creating transactions, helping minimize operator error.</center>_

 

<center>
<img src="/assets/remote/approve_tx.gif" style="width:840px;">
</center> 


_<center>Once a transaction has been created, it needs to be approved by the requisite number of operators before it is broadcast. </center>_

Thanks to the [trusted display](https://hackernoon.com/the-importance-of-the-trusted-display-and-secure-execution-1l7e3249) of each operator’s PSD, in combination with the approval flows, it is possible to securely manage digital assets remotely, while still benefiting from institutional-grade security. This setup also minimizes the possibility of human error, which could otherwise be particularly problematic for businesses switching to a remote workflow. 

### That’s it!

Whether you represent a custodian, a hedge fund, cryptocurrency exchange, wallet service, or any organization with significant exposure to digital assets, you will be able to create and access your secure, scalable Vault instance at all times, regardless of your location. Vault customers never directly interact with sensitive key material as part of their daily Vault operations and can guarantee their transaction governance rules are always enforced and auditable, remotely by the Vault HSM.



## Making security accessible

As crypto firms begin adapting to the challenges of working remotely, they will inevitably seek out solutions that ensure the safety of their digital assets in these uncertain times. Nonetheless, with the Ledger Vault, this safety doesn’t need to come at the cost of accessibility—as is often the case with many digital asset management solutions. 

At Ledger, we believe that digital currencies are best managed with a three-pronged approach that combines best-in-class hardware-based security, a secure communication channel, and a powerful governance system to maximize the security of digital assets, while still providing the flexibility and accessibility needed to support a firm’s operations at scale. 

This approach lends itself perfectly to remote organizations, since firms can benefit from security that rivals offline storage, but without the bottlenecks and risks introduced by physically handling the key material on a regular basis. In fact, Vault customers never need to reconstruct their private keys or master seed as part of their standard operations—practically eliminating the odds of these ever being compromised.

### Final word

Although the current pandemic has brought major issues with older digital asset management solutions to the spotlight, these problems have existed for as long as firms have needed to remotely manage their digital assets in a controlled way. 

Vault is Ledger’s answer to the growing demand for a superior alternative to antiquated cold storage solutions, allowing firms to get up and running with their own custody infrastructure in just a week.

 
