---
layout: post
title: The Ledger Vault API is out
author: Yacine Badiss and Sylve Chevet
summary: Discover the API capabilities and sign up for the trial period
featured-img: ledgerapi
categories: Vault
---

# The Ledger Vault API is out: Trial Testing and Current Capabilities

We believe that wider adoption of cryptocurrency requires better tooling for financial institutions to efficiently run their business operations. This is addressed by Ledger Vault, a secure and scalable wallet platform that provides the highest levels of asset protection while enabling straightforward processing of transactions.

With the introduction of the Ledger Vault API, users can now integrate the Vault directly with their back-ends. This API allows users to automate operations, query the balance of their accounts, and initiate transactions programmatically without compromising on the security or confidentiality of their transfers.

The API integration is relevant for all custodians, exchanges, and hedge funds that value efficiency and execution speed. They are well suited for small and medium enterprises aiming to streamline their processes across different areas.

## Grow your platform using Ledger Vault APIs 

Manual reporting is a repetitive and time-consuming activity that requires constant attention from the operational staff. This recurring task can be drastically simplified with a direct integration with back-office applications. Reporting and Notification APIs make a compelling case for faster, more accurate, and generally better reporting and monitoring. Inbound and outbound transaction notifications from the API allows firms to quickly identify unexpected liquidity events or suspicious transactions.

Indeed, the accounting team needs to be able to effectively review operations to prepare tax documents. Operation teams and treasurers, on the other hand, need timely access to data to support decision making, and the compliance team needs to keep an independent view on operations.

<br/>
<center><img src="/assets/vault_api_release/multi_teams.png" style="width:650px;"></center>
<br/>

By leveraging the secure governance of the Ledger Vault, the Transaction APIs allow firms to automatically initiate and approve transactions. More advanced integrations give you the tools to manage even the most complex operational flows, combining the ease of use of the APIs while enforcing manual reviews where necessary.

<br/>
<center><img src="/assets/vault_api_release/governance.png" style="width:650px;"></center>
_<center>Example of a governance setup with both human and automated reviews</center>_
<br/>

Thanks to the broad governance capabilities of the Vault, you can also create different tiers of wallets&mdash;each of which is subject to a different set of governance rules. For example, the majority of assets could be held in a main wallet that is restricted to only transacting with a treasury wallet. The treasury wallet then enforces the governance rules described in the previous example. This layered setup increases the security and oversight of the overall transaction process, making sure the proper checks and balances are enforced.

## Under the hood of Ledger Vault API framework 

One of the core ideas of the Vault is that our users have complete control over their seed and keys&mdash;both at rest and during usage. The Ledger Blue, with its [secure display](https://blog.ledger.com/trusted-display/), provides this strong guarantee when "manually" interacting with the Vault thanks to a secure authentication challenge only genuine Ledger PSDs can pass. By design, users are the only ones who can spend their funds, since they are automatically authenticated by using their unique Ledger Blue personal security device (PSD).

[This philosophy](https://blog.ledger.com/understanding_risk/) means that Ledger has zero access to the keys used to sign messages sent to the Vault. Any access to the Vault or the funds it secures must be initiated by the client, thereby ensuring the highest level of ownership and security.

Maintaining this guarantee was one of our key concerns while building the Ledger Vault APIs, which led us to design an architecture based on a client-side agent. We call this agent the Ledger Authentication Module, or LAM for short.

<br/>
<center><img src="/assets/vault_api_release/lam_architecture.png" style="width:650px;"></center>
_<center>LAM is your gateway to securely interact with the Vault</center>_
<br/>

By residing on your infrastructure rather than Ledger's, the LAM is able to securely isolate the secrets that will be used to authenticate and communicate with your Vault. It does this without sharing them with any third party (including Ledger), thus ensuring their integrity is never compromised. You, and only you, can operate your Vault.

The initial authentication between the LAM and the Vault is handled through standard user tokens. Further communication with the Vault HSM relies on an [ECDH channel](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman), that is secured by the client-generated key stored on the LAM. This ensures that critical messages between the LAM and the HSM are encrypted and are immune to man-in-the-middle attacks. All authentications and cryptographic mechanisms are automatically handled by the LAM.

<br/>
<center><img src="/assets/vault_api_release/lam_request.png" style="width:650px;"></center>
<br/>

With a single LAM instance, you will be able to create and control as many API Operators as you need to automate your reporting and transaction flows. Just like any Vault Operator, they will need to be [invited to the platform by Vault Administrators](https://help.vault.ledger.com/Content/overview/getstarted.html), following the same registration process. Access to your funds is similarly restricted and will depend on the [transaction rules you set on each one of your accounts](https://help.vault.ledger.com/Content/accounts/acc_create.html). Using strong whitelists and transfer limits will allow you to take full advantage of the APIs automation power while keeping your funds secure.

In short, API access is still very much in the hands of those you trust to administer your Vault. The security paradigm remains identical with the addition of the Vault APIs to your toolset.

## Open API specification 

Besides holding onto user secrets, the LAM also fulfills the essential role of hiding the complexity of the system. It allows exposing an interface that is both coherent and easy to use, without compromising the Vault's state-of-the-art security measures.

This interface is described in our [standard Open API specification](https://vaultplatform.ledger.com/api-doc) that provides details on all the endpoints and objects that callers will interact with. We also expose examples covering the most common use cases in different languages, which will help get you started when integrating the Vault APIs in your internal workflows.

## What's next?

The first version of the APIs support:

-   Reporting calls (fetch accounts, query their balances, etc.)

-   Creating and approving transactions programmatically

-   Notifications through webhooks for many different events, including receiving and sending funds

-   Address generation, and more.

As new features and cryptocurrencies are added to the Vault, they will also be available through the API.

## How can I try the API?

The closed trial started today, which means a select group of Ledger Vault clients have access to the API in a sandbox and production environment. Our aim is to open this API to all Ledger business clients as soon as possible.

If you are interested in discovering the APIs, please fill in [this form](https://share.hsforms.com/1wJ_kP4hkTeCssFvLk9_2fg3kwh5) and book a platform demo with our team.

We are convinced that both financial institutions and the digital asset industry as a whole will benefit from tighter integration with our Vault and third-party services, made possible through the Ledger API. We are looking forward to working with our partners to deliver more value to the ecosystem and open secure digital asset management to an even wider audience.

#### Resources:

-   [API documentation](https://enterprise.ledger.com/products/vault/api-doc/)

-   [Help Center and onboarding documentation](https://help.vault.ledger.com/Content/api/api_overview.html)

