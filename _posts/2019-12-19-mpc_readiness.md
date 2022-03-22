---
layout: post
title: Is MPC truly ready for digital asset custody?
author: Vincent Debast and Charles Guillemet
summary: Ledger's take on the current state of MPC and the way forward by C. Guillemet and V. Debast 
featured-img: mpc
categories: Vault
---

# Is MPC truly ready for digital asset custody?

Securing critical digital assets is the mission of Ledger and we have been observing the latest developments in multi-party computation (MPC) with great interest. In this post, we will give our current perspective MPC, its use to secure digital assets and how we see future development.

## The challenge of managing the key lifecycle

  

Unlike traditional financial assets, critical digital assets such as cryptocurrencies bear high operational risks. These relate to key management, irreversible transactions and the open network. Cryptocurrencies empower users giving them control over assets and thereby granting them complete responsibility over them. Because a security breach can result in an instantaneous and irrevocable loss of funds, the security of keys both at rest and in usage is paramount.
  
* Securing at rest means safeguarding the generation and storage of keys.   
* Securing the usage includes not only transaction signatures but also user management, wallet management, enforcement of governance rules and transaction verification.
    

<center>
<img src="/assets/mpc/key_mgmt_lifecycle.png" style="width:500px;">
</center>  
_<center>Key Management Life cycle</center>_
 

Securing the full key management lifecycle is not easy and MPC is the latest addition to the security toolbox that institutions and investors have to protect their digital assets.

## What is MPC?

Multi-party computation refers to specific cryptography algorithms enabling multiple parties to jointly compute a function over their inputs while keeping those inputs private. For example, it is possible to compute the average employee salary without individual employees knowing the salary of others (cf. [Inpher Intro (1)](#1)).

  
Applying this property to secure digital assets, MPC can be used to create signatures split over several users, where the signature process does not require signers to disclose their key to others. The benefits are straightforward: without the possibility to compromise a single endpoint, an attacker would need to target several instances, coordinating many attacks together. Because instances have different security setup, this significantly increases the difficulty of the potential attack.


When applying MPC, the first step is the wallet creation. Each user generates a part of the key with which transactions are signed from a wallet. At no stage is the key generated in full. This is done by implementing an MPC-version of the key derivation algorithms for cryptocurrencies (BIP-32).

  

Once the wallet is created, MPC is applied to transaction signatures. One category of MPC algorithms is called [Threshold Signature Schemes (2)](#2) (TSS). It allows a group of n signers to define a set of m required approvals. The transaction signature process does not require - nor allow - any single approver to assemble or have the full key at any stage. Most MPC-based solutions currently available on the market implement TSS.

<center>
<img src="/assets/mpc/approval_flows.png" style="width:500px;">
</center>  
_<center>Transaction approval flow</center>_

In the above example, the transaction is not complete until all the approvers have computed their part of the transaction. It is noted that some MPC schemes do not require approvals to be sequential. With those schemes, Alice, Bob and Charlie can sign the data in any order. The three approvers can also use different devices, such as a smartphone, a laptop or a regular computer.


## What are the drawbacks of MPC?

#### MPC still is a very recent technology and has very little security testing

Current MPC schemes are quite new and therefore are still not battle-tested. Seminal papers on the topic date back to the 80s but the first paper outlining a usable case was only published in 2016. Security setups based on MPC have yet to pass extensive penetration testing and security certifications such as Common Criteria, FIPS or CSPN certifications. Also, [standardisation initiatives (3)](#3) are giving security researchers a common ground to assess solutions using MPC but are still not widely accepted.

At the 2019 IACR Crypto conference, Jonathan Katz presented a keynote talk where he outlined the [vulnerabilities in MPC implementation of fixed-key AES (4)](#4). While vulnerability does not mean that MPC is insecure per se, it does raise the question of the security of implementation. As Trail of Bits stated in the talk: “This attack highlights the recklessness of rushing to deploy cutting-edge cryptography. These protocols are often extremely slow and complex, and few people understand the subtle details of the security proof. More work must be done to quantify the concrete security of these protocols as they are actually instantiated, not just asymptotically using idealized functionalities.” (cf. [Trail of bits blogpost (5)](#5))

Because the security issue of digital assets is “get  one error, lose it all,'' introducing new technologies must be done carefully. Implementing unready technology as the backbone of the security infrastructure can have catastrophic consequences as shown by the recently, when [Zcash deployed custom zk-SNARK setups (6)](#6). The gap between theoretical implementation and actual production requires the highest caution. Even though security proofs provide better guarantees, they can initially pass through peer review where further research will later find they are false, as [highlighted recently by Koblitz and Menezes (7)](#7).

  

We believe that the security of MPC-only systems are not mature enough to be deployed in production.

#### Implementing complex governance schemes remains out of reach for solutions relying solely on MPC

  

The main technical limitation of MPC lies in the exponential complexity of existing algorithms. The more complex the calculation, the longer it will take to compute. Even a simple “m of n” quorum becomes practically impossible to implement as the number of signers increases. More so if computation is already intensive without MPC. Recent papers on the topic have improved performance but research is still very recent and has yet to be tested thoroughly. [Improvements applied to transaction signature (8)](#8) started around 2016.

  

This limitation means that some operations are very hard to implement using only MPC or may be unusable due to high computational requirements, namely:

* Key derivation algorithms to create public/private key pairs: Implementing an MPC version of BIP-32 becomes unworkable with more than 2 signers because of the computational complexity.
    
* TSS-based approval quorums with many approvers.
    

  

Although these limitations may be overcome using more powerful hardware, attacks on the system running MPC computation must withstand extensive software and hardware-based attacks.

  

It is important to point out that the security of digital assets goes beyond defining approval quorums. A good solution must allow for governance rules over the signature process such as specific approval flows defined by amount thresholds and address whitelisting. These schemes are currently out of reach for MPC-based solutions.

  

To address the issue, governance rules can be implemented in another environment. Those can be hardened servers, HSMs, or secure enclaves. While this approach is pragmatic it can significantly undermine the security of MPC setups if the governance of the environment is not highly secured.

  

The lack of a secure execution environment for key lifecycle activities that are not in the MPC schemes can hinder the management of wallets on larger scales and in fast growing institutions. Indeed, besides the limitation of governance schemes, other essential processes cannot be performed using MPC alone. For instance, there are methods to update a quorum and revoke keys using MPC protocols, but the dissemination of new keys must still be performed outside of the scope of MPC. These processes must be enforced via regular business processes.

  

Another point of concern is the trusted display. MPC does not inherently allow signers to securely review what they are signing. Should an attacker push a rogue transaction to the MPC quorum by targeting one of the endpoints, the other signers will have no way to securely verify what is being signed. Signers rely on regular hardware running the MPC software which means they can be targeted to display inaccurate information maliciously.

  

## The way forward?

  

MPC schemes open up new possibilities to secure parts of the key management lifecycle but current schemes are not satisfactory in terms of performance, flexibility and security. As such, we believe MPC-only solutions are not ready for production. MPC should be used cautiously until it has passed the test of time and not as the unique security infrastructure.

  

Solutions can be imagined where the drawbacks of MPC are addressed through additional implementation of a secure execution environment, and also secure hardware (with tamper protection) and a trusted display.

  

At Ledger, we are convinced that the key generation process must always be performed on secure hardware otherwise the entropy of the keys will be too low and therefore subject to attacks. To ensure keys are securely generated, certified secure hardware using true random number generators is still the best solution. Keys must also be stored on secure hardware: the interest of MPC lies in distributing the keys over several endpoints which distributes risks. However attacking several unsecured endpoints synchronously is possible, as [recent hacks have proved (9)](#9).

  

Furthermore, a secure execution framework within secure hardware (as we currently offer within our solutions) would enable much-needed governance schemes and user management frameworks to be protected. MPC would then be a solution to reduce the operational risk related to the concentration of keys on a single technical platform.

  

The implementation of MPC on secure hardware is still lacking, in order to address the limitations of the technology. We therefore clearly state that careful consideration must be given to the limited functional scope for governance schemes and the incomplete key lifecycle management capabilities of current MPC-based systems, as institutions implementing MPC in its current form will remain exposed to significant operational risks.

  

MPC will be a valuable addition to the arsenal of security solutions with secure hardware and Ledger will continue to investigate integrating MPC to our existing portfolio of security solutions to create a more robust end-to-end security solution to protect critical digital assets.


#### References

1. <a name="1"></a> [What is secure Multi-party computation - Inpher](https://www.inpher.io/technology/what-is-secure-multiparty-computation)
2. <a name="2"></a> [Threshold Signatures Explained - Binance](https://www.binance.vision/security/threshold-signatures-explained)
3. <a name="3"></a> [Threshold Cryptography - CSRC NIST](https://csrc.nist.gov/Projects/Threshold-Cryptography)
4. <a name="4"></a> [Efficient and Secure Mulltiparty Computation from Fixed-Key Block Ciphers - Guo et al.](https://eprint.iacr.org/2019/074.pdf)
5. <a name="5"></a> [Crypto 2019 Takeaways - Trail of Bits](https://blog.trailofbits.com/2019/09/11/crypto-2019-takeaways/)
6. <a name="6"></a> [ZCash Counterfeiting Vulnerability Successfully Remediated - Ellectriccoin](https://electriccoin.co/blog/zcash-counterfeiting-vulnerability-successfully-remediated/#counterfeiting-vulnerability-details)
7. <a name="7"></a> [Critical Perspectives on Provable Security: Fifteen Years of "Another Look" Papers - Koblitz and Menezes](https://eprint.iacr.org/2019/1336)
8. <a name="8"></a> [Threshold-optimal DSA/ECDSA signatures and an application to Bitcoin wallet security - Gennaro et al.](https://eprint.iacr.org/2016/013)
9. <a name="9"></a> [Mysterious iOS Attack changes Everything - Wired](https://www.wired.com/story/ios-attack-watering-hole-project-zero/)
