---
layout: post
title: Why multisig won't let you scale your digital asset business
author: Vincent Debast
summary: How Multisig affects the scalability and efficiency of firms that manage digital assets, and why Ledger Vault is a superior alternative.
featured-img: multisig
categories: Vault
---

# Why multisig won't let you scale your digital asset business

Businesses that store digital assets and process regular transactions are often faced with the dilemma of sacrificing speed for increased security, or vice-versa. To overcome this, a large number of firms have begun adopting on-chain multisig to help avoid the need for slow, inflexible cold wallets, to keep assets securely connected and accessible---albeit with a large number of caveats.

In this article we will look into how Multisig affects the scalability and efficiency of firms that manage digital assets, and propose Ledger Vault as a superior alternative.

This comparison is specific to on-chain Multisig which should not be confused with MPC and other multisignature mechanisms available. On-chain Multisig is also known as P2SH Multisig or PSBT on the Bitcoin blockchain. Similar implementations exist across the different blockchains, this article leverages the specific case of Bitcoin and Ethereum to highlight the pitfalls of managing wallet governance directly on chain. 

### Cumbersome operations

For growing institutions, the capacity to process a large number of transactions concurrently can be critical to the success of the business. Digital asset custody and exchange users are increasingly looking for near-instant access to their funds, which necessitates the need for a transaction creation and approval setup that can scale.

Multisig, not unlike threshold signatures (TSS), requires that multiple parties involved in the transaction process must review the actual raw transaction. Since the raw transaction requires the actual inputs or the nonce of the prior transactions to be valid, this can lead to situations where transactions are strictly sequential.

For instance, if 3 parties (Alice, Bob, Carol) are required to authorize two transactions, the sequence would look something like this:

-   Alice creates the first transaction and signs it (1 of 3)

-   Bob reviews and signs (2 of 3)

-   Carol reviews, signs (3 of 3) and broadcasts the transaction. 

-   Once the previous transaction is completed, they can start again

-   Alice creates the second transaction and signs it (1 of 3)

-   Bob reviews and signs (2 of 3)

-   Carol reviews, signs (3 of 3) and broadcasts the transaction.

In the example above, full sequential transaction processing is described. This would typically be the case for account-based blockchains. For UTXO-based blockchain, assuming UTXOs are properly managed, some parallelism is possible but the final approval must follow the creation order...still a major inconvenience.

<center><img src="/assets/multisig/sequential-txs.png" style="width:800px;"></center>

This situation does not adapt itself well to operators being split across multiple companies as they'll need to coordinate the creation and broadcast of all the transactions. In practice, to perform multiple operations it is best for all parties to be connected simultaneously to the platform to avoid dragging the transaction creation and approval process over many hours or days.

### Interoperability issues and disparate security solutions 

As of Q4 2020, just a small minority of prominent blockchains support on-chain Multisig transactions. These include Bitcoin, Litecoin, Bitcoin Cash, Bitcoin SV, and a variety of actively developed smart-contract capable blockchains, like Ethereum, Polkadot, and Tron.\
However, the vast majority of blockchains do not currently support Multisignature functions, while those that do often vary considerably in their implementation. This prevents firms from employing a single holistic solution for securely processing transactions, driving up costs, increasing training requirements and increasing the risk of potential vulnerabilities, while limiting the number of assets that they can support.  

### Governance is limited to rigid quorums and key refresh impacts business continuity

Multisig governance is extremely inflexible and enables only basic governance models based on approval quorums. Most services relying on Multisig (and TSS) maintain a fair amount of obscurity around the management of approval thresholds, whitelists and other rules as those are implemented in a software layer completely independent from the core security of the platform---which may be targeted to undermine the overall security of the system. 

The quorums are not amenable to adjustment since key holders cannot be revoked or added without generating a new Multisignature address and moving assets from the original address to the new one.

Needing to move the entire balance to a new Multisig address each time an operator is added or removed is an unnecessary hassle and leads to additional transaction fees that could be avoided with a more flexible governance system. 

### Fees and mining delays

For most Multisignature capable blockchains, creating a Multisig transaction is usually significantly more expensive than a standard transaction with a similar output value. This is because transactions with multiple signatures are inherently larger (in terms of bytes) than those with a single signature, and the resulting transaction requires a larger fee to ensure it is confirmed quickly.

Depending on the number of signatures required, Multisig transactions can range from slightly to significantly more expensive than standard transactions. With 2-of-3 Multisig transactions being [63% larger](https://static1.squarespace.com/static/586cf12903596e5605548ae1/t/5c6475ed7817f7bfb75d873d/1550087663616/Threshold+Signatures+-+Elevating+Crypto+Security.pdf) than single signature legacy transactions and 23% larger than single signature PSH-wrapped SegWit transactions, firms can see a significant transaction cost reduction by avoiding Multisignature transactions.

Other Multisig capable blockchains suffer from similar fee hikes when more signatures are added into the equation. Ethereum, for example, makes use of Multisignature smart contracts to enforce an M-of-N-like transaction signing scheme. However, invoking smart contracts is significantly more expensive than a standard transaction.

Last but not least, creating single signature accounts is free on most blockchains, leveraging smarts contract to create a shared wallet will incur a network fee for each of them---an unnecessary cost avoided in alternative solutions. On a side note, we also noticed that some exchange infrastructures do not support internal transactions generated from a smart contract and they would fail to properly reflect the balance.

### A false sense of security 

While Multisig has inherent pitfalls, some of the flaws lay in the implementations available. Current Multisig implementation in hardware overlooks security best practices as they would make the UX completely infuriating. At Ledger, we have noticed that too little emphasis is put on validation of the information displayed during the setup and signature phase to validate other parties involved. Worse, validation of a receive address requires collaboration of the quorum, an annoying constraint for day-to-day activities. Solution providers are making some progress in the right direction to further secure the process but the necessary UX constraints will remain and make such solutions inappropriate for frequent transactions.

Ledger Vault's answer
---------------------

Institutions that handle digital assets often look to Multisig as a way to secure their funds, while still retaining flexibility and control over how frequently transactions can be processed.

Though Multisig can arguably scale better than [cold storage](https://blog.ledger.com/hot_cold/), it isn't enough for firms that are growing rapidly or need to process many thousands of transactions per day. These firms need a flexible, blockchain agnostic scaling solution that offers Multisig-like security, without the governance and speed bottlenecks that come with it. This is what Ledger Vault offers. 

### Simple day-to-day operations

The Ledger Vault decouples the transaction approval process from the transaction construction step and its signature. In practice, operators can create multiple transaction requests without having to think about when they will be approved or if they will be approved at all.

The change in paradigm from [construction > approval > signature > broadcasting] to [request creation > request approval > transaction creation and signature > broadcasting] enables much more flexibility in daily operations. Dependencies between operations are managed by the platform and no longer by humans. Worldwide, asynchronous, time-efficient operations are made possible.

<center><img src="/assets/multisig/independent-txs.png" style="width:500px;"></center>

### A unified and blockchain agnostic security model

With Ledger Vault, firms have access to a completely blockchain agnostic security solution that borrows some of the principles of Multisignature, without any of the compromises. Rather than requiring a potentially different signing protocol for each different asset under management, Ledger offers a single multi-authorization model that can be applied to all accounts, irrespective of whether the asset supports Multisig or not.

Having a unified security model enables Ledger to pursue certifications of its offering and therefore submit its solutions for evaluation to specialized security labs. A desired requirement for working in an institutional and increasingly regulated context.

Furthermore, being blockchain agnostic enables users to have a unified user experience with the same features available across all blockchains. 

### A flexible governance framework 

This is achieved by the unique governance framework offered by Vault, which allows designated users to create transactions, which must then be signed by a quorum of operators before they are broadcast. The process is both intuitive and highly flexible, requiring minimal training to get to grips with since the process is the same for all assets---though the exact quorum requirements can vary by account, as set by the Vault administrators.

Unlike Multisig wallets, the governance framework of Ledger Vault accounts can be easily updated by a quorum of administrators. This means new operators can be added, paused, or removed from accounts quickly, without the need to regenerate the private keys for any associated funds they control.

This means new employees can be onboarded as operators and inserted into the current governance framework with ease. Likewise, the administrators can also act to change the governance requirements for the accounts they administrate, ensuring operations can continue if too many operators are absent or adjustments need to be made to the transaction rules for specific accounts. As with all sensitive actions on the Vault, changes must be approved by a quorum, while the final approval can be left to a specific individual in the firm, such as the CFO or CEO.

The governance framework also cuts down on administrative efforts with its conditional transaction restrictions, as transactions are automatically checked for a variety of parameters, which can include the amount (high/low) and destination address (whitelisted/non-whitelisted) to determine the number and order of authorizations required before it is broadcast.

Unlike alternative solutions, the Ledger Vault goes beyond securing approval quorums. The whole governance framework including the whitelist and conditional thresholds are encompassed in the [secure execution perimeter](https://blog.ledger.com/welcome-tradeoffs/). 

### Efficient fees and privacy 

Ledger Vault transactions are single signature transactions from the network point of view.

As highlighted above, this will result in lower transaction fees across the different blockchains. On the Ledger Vault platform, Operators decide on a maximum amount of fees allowed for a given transaction. This system is extremely efficient as Vault users can calculate the transaction fees before transactions are signed and broadcast.

Because this calculation is made close to when transactions are broadcast, it is thereby more accurate. Multisig solutions, on the other hand, likely lead to an overestimation of the fees to avoid the hassle of rebuilding a new transaction or having to do other operations to bump the fees later on.

A full comparison of the Ledger Vault solution with Multisig is shown below:

|                                 | Multisig                                                     | Ledger Vault                                                 |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Compatibility**               | Different implementation on different blockchains. Requires auditing multiple mechanisms and adapting business processes. | Protocol agnostic  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
| **Flexibility**                 | Low support for complex Multisignature schemes. Most used schemes are 2 of 3. | No limitations to approval scheme quorums                    |
| **Change**                      | Complicated: change address                                  | Easy & convenient                                            |
| **Governance**                  | Only m-of-n                                                  | All the governance is secure: m-of-n and thresholds and whitelists |
| **Network fees**                | Higher                                                       | Lower                                                        |
| **Transaction signature speed** | required to be sequential for full transaction lifecycle     | Multiple transactions can be processed in parallel           |
| **Privacy**                     | Low - visibility of the governance on chain                  | High - single signature on chain                             |
| **Key refresh**                 | Yes with a transaction fee                                   | Does not apply                                               |
| **Maturity**                    | Medium                                                       | High                                                         |



Conclusion
==========

Though on the surface, Multisig seems like an obvious solution for the governance issues inherent to institutional digital asset management, it brings with it a number of issues relating to scalability, speed, and compatibility.

As the industry continues to gain momentum and digital assets become increasingly woven into everyday life for both users and investors, the institutions that manage these assets will see a growing need for scalability, which Multisig solutions do not tackle.

To address this issue, Ledger Vault runs on proven HSM technology and offers speed, granular internal transaction control, and support for a wide range of digital assets---while keeping transaction fee spends down to a bare minimum.

With Ledger Vault, firms can confidently manage their or their clients' assets without bottlenecks, ensuring they are well-equipped to scale with the market, and meet the demands of their users without fail.


