---
layout: post
title: Ethereum Smart Contract plugins
author: jean
summary: A new frontier for the security of human interactions with smart contracts
featured-img: puzzle-eth
categories: Tech
---

# Ethereum plugins

_A new frontier for the security of human interactions with smart contracts_

## Smart Contracts?

Unlike with Bitcoin, where most transactions are simple value transfers from one address to another, Ethereum transactions often contain interactions with `Smart Contracts`, which are programs running on its blockchain. Every time someone lends coins on [`Compound`](https://compound.finance/), swaps some tokens on [`Paraswap`](https://paraswap.io/) or pets his [`Cryptokitties`](https://www.cryptokitties.co/), smart contract transactions are involved. Supporting these use cases on hardware wallets is essential to sustain the growth of the Ethereum ecosystem without making a compromise on its security.

## Previous state of smart contract support

Until now, the device could not provide users with a secure display when interacting with smart contracts. One could interact with any smart contract, but the device would just warn the user that "some data was present", and the user would have to blindly accept signing the data, without being able to double-check the validity of said data.

<center>
<figure class="image">
  <img src="/assets/eth_plugins/data_present_nano_x.png" alt="Nano X showing 'Data Present' when signing unsupported smart contract">
  <figcaption>Current Ethereum UI when signing a transaction that interacts with an unsupported smart contract</figcaption>
  <br/><br/>
</figure>
</center>

## Supporting all smart contracts used to be hard

Adding full support for any given smart contract available in the wild used to be a hard task for many reasons:

- It required too much knowledge of the Ethereum app’s codebase for third party developers to be interested.
- Even if they did, adding full support for many smart contracts would not scale, both in terms of flash space used and technical debt added to the application parsing logic.

## Introducing Ethereum plugins:

With the release of `Ethereum app v1.8.5`, we are laying the foundation to make support addition for a full smart contract on Ledger products much easier and scalable.
To do so, the Ethereum transaction parser is now hookable by a new kind of applications: plugins.
Plugins are small applications dedicated to parsing custom transaction fields and building a custom display to show on screen to the user. They are lightweight apps that can be installed on the device, just like any other app. Users only need to install the plugins for the smart contracts they plan to interact with. This makes supporting smart contracts much more scalable: where previously the ethereum app would have been bloated with all sorts of different smart contracts support, now the code logic for every smart contract is stored on different plugins, and users simply install what they need!

<center>
<figure class="image">
  <img src="/assets/eth_plugins/manager_view_nano_s.png" alt="Ledger Live Manager view, where only little space remains available to install new apps on a Nano S">
  <figcaption>Memory is a scarce resource, especially on Nano S where just a few apps can be installed before reaching its limits</figcaption>
  <br/><br/>
</figure>
</center>

There are only a few plugins available at the time of this writing ([`Paraswap`](https://github.com/LedgerHQ/app-plugin-paraswap)), but we hope to have plugins available for every major Ethereum smart contract in the near future: this depends on Ledger, but also on Ledger's community. By lowering the entry bar to adding smart contract support, we hope to get traction from smart contract programmers so they too, embrace the security of hardware wallets.

## Case overview: the Compound plugin

Compound is a well known set of DeFi smart contracts allowing people to lend and borrow cryptocurrencies in a trustless fashion on the Ethereum blockchain. We recently added support for Compound lending operation and we’re going to present a schematized overview of the flow of a lending transaction process assisted by a plugin.

![compound plugin interactions schema](../assets/eth_plugins/compound-plugin-interactions-schema.png "Overview of a lending transaction processng using a plugin")

This schema might seem a little bit complex at first sight, but there's actually only very little code written to implement it. Every interaction between the Ethereum app and the Compound plugin are pre-defined hooks that a programmer just has to fill with his custom processing logic. This processing logic is often very simple:

- Copying some values to format them later
- Making basic security checks
- Preparing some buffers to display an approval UI to the user
- etc.

Hence, a plugin is often really easy to write!

## 🦄 Build your own Ethereum plugin

To implement a plugin for your smart contract, you can start by forking [plugin-boilerplate](https://github.com/LedgerHQ/app-plugin-boilerplate). A documentation of all the hooks and their role is available [there](https://github.com/LedgerHQ/app-ethereum/blob/master/doc/ethapp_plugins.asc), and you can also get inspiration from the [ParaSwap plugin](https://github.com/LedgerHQ/app-plugin-paraswap).

Quick code iteration can be done via our device emulator, [speculos](https://github.com/LedgerHQ/speculos/)!
If you're new to the Ledger development community, you can also find the basics of the BOLOS platform on [readthedocs](https://developers.ledger.com/). You can also reach to us on our developper Slack by requesting access to it [here](https://support.ledger.com/hc/en-us/requests/new)

## Conclusion

Ethereum plugins are a new and powerful yet simple way to improve the security and usability of smart contracts using Ledger hardware wallets, and we hope you'll enjoy them, and eventually that some of you will even try to build their own.
We are committed to improving and maintaining a fertile ground for plugins, so Ethereum DApps can continue to securely grow and thrive.

