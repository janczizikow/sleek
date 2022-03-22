---
layout: post
title: Ledger Live X DeFi
author: Pierre Pollastri
summary: When security meets Decentralized Finance.
featured-img: paraswap-logo
categories: Tech
---

# When security meets Decentralized Finance

Are there parts of the legacy finance industry which are ripe for disruption by secure and efficient technologies?  
If you answered YES, you’re a believer in Decentralized Finance (DeFi).

The growth of Decentralized Finance (DeFi) is opening a new world. DeFi leverages smart contracts to bring sophisticated financial instruments to market, instruments that are decentralized and running in blockchain code.

We at Ledger truly believe in DeFi, and we want to give developers worldwide the opportunity to create Decentralized Applications (DApps) that use our platform and integrate them into the Ledger ecosystem. 

We just made developing for Ledger easier. 

In this article, we explain how developing for the Ledger ecosystem works. To illustrate with an example, we show you "ParaSwap", a DApp that allows you to swap coins within Ledger Live.

Ledger Live is already able to securely manage ETH and ERC20 tokens on the Ethereum network. However, adding support for DApps built on top of Ethereum has remained difficult for developers. That changes today with the release of Ledger Live 2.29.

<br/>
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/paraswap_in_ledger_live.png">
    <br/><br/>
    <figcaption>A screenshot of ParaSwap in Ledger Live.</figcaption>
  </figure>
</center>  
<br/>

# Ledger Live becomes the most secure DeFi enabled wallet

## DApp Sandboxing & Blockchain access

A DApp is usually the first place where a user builds a transaction. It is a simple page “protected” by the browser sandbox model that ideally guarantees isolation between different tabs. This isolation is important to protect the user from any untrusted environment interference.

DApps access the Ethereum blockchain and wallets through a specific Web3 provider that needs to be made available on the page. To achieve this, most software wallets  need a browser extension to work. Unfortunately, for extensions to work they require full rights to inject any JavaSscript code inside the page. This means users have to fully trust the extension when browsing normal websites or DApps.

Our solution is to integrate DApps inside an iframe to leverage the integrated browser sandbox model. In addition, we make the Web3 provider available through an “iframe Web3 provider”. This “iframe Web3 provider” is an [open source project](https://github.com/LedgerHQ/iframe-provider) that enables the routing of Web3 calls to the parent iframe container using postMessage. In turn, this postMessage call is routed either to a standard Ethereum node or to Ledger Live when it requires interaction with the Nano S/X or user accounts.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/dapps_browser_architecture.png">
    <br/><br/>
    <figcaption>DApps Browser Architecture.</figcaption>
  </figure>
</center>
<br />

With this implementation, Ledger cannot modify any code inside the iframe without the DApp provider’s consent and the hardware wallet is fully isolated from the DApp code.

As an added benefit, Ledger Live users can easily instantly change the active account used by the DApp without leaving the DApp. 

## Don't trust, Verify: the blind signing problem

### At last, a hardware wallet that can understand DApps

Ledger upgrades DeFi user security by adding native DApps support to Nano S and Nano X users in Ledger Live. No more extensions, no more browser connection issues, no more blind signing. Usability and security in a single package.

Most DeFi applications are running on top of Ethereum blockchain and use Ethereum smart contracts to perform complex operations. Users send transactions to smart contracts with all the required information to execute specific functions with a specific set of parameters. Smart contract transactions carry an additional data field containing relevant parameters for the smart contract.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/smart_contracts_parameters.png">
    <br/><br/>
    <figcaption>Smart contract parameters</figcaption>
  </figure>
</center>
<br />

Both Ledger Nano S and Nano X are already able to verify standard fields in Ethereum transactions (from, to, value, gas limit, gas price, nonce). However, when it comes to the input data, it was previously impossible to display the smart contract functionality activated by the transaction because the Nano S/X had no knowledge of the contract and its purpose.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/random_contract_call.gif">
    <br/><br/>
    <figcaption>A random contract call, it is impossible to verify what side effects it will have</figcaption>
  </figure>
</center>
<br />

With the introduction of the DApp browser in Ledger Live, we give the Nano S/X the ability to display and verify the data included in a smart contract transaction without any additional changes to the DApp. This verification results in a huge boost in security of the Ethereum ecosystem. We will describe this “plugin” mechanism in an upcoming blog post.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/paraswap_contract_call.gif">
    <br/><br/>
    <figcaption>A ParaSwap contract call, we can easily verify swap details</figcaption>
  </figure>
</center>
<br />

# Adding you DApp to Ledger Live

To function properly, decentralized applications first need to be connected to a wallet. The wallet will provide fresh information straight from the blockchain (like user balances or smart contract state) and offer secure transaction signing on request. Since many wallets are compatible with DApps, the community came up with a standard for a common interface. This standard is called [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193). To briefly explain this standard, every wallet has to implement a provider, respecting the interface defined by the standard. The DApp then prompts the user to select one of the available providers, allowing him to select his wallet.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/paraswap/list_dapp_providers.png">
    <br/><br/>
    <figcaption>A list of available providers on a DApp</figcaption>
  </figure>
</center>
<br />

## Installing the iframe-provider

To make your DApp compatible with Ledger Live, you first need to add the iframe-provider library to your project. This package is currently hosted on npm as [@ledgerhq/iframe-provider](https://www.npmjs.com/package/@ledgerhq/iframe-provider). Note that this new feature, which allows you to integrate a DApp to Ledger Live, does not change the existing features on Nano S/X. 

A lot of popular wallet implementations use JavaScript injection to dynamically inject their provider. This approach is effective, but could allow  the injector to modify the page, presenting a security risk. We avoid this security issue by sandboxing DApps running in Ledger Live. The only way to communicate between Ledger Live and the DApp is to use the [PostMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) bidirectional API, allowing secure cross-origin communication.

## Allowing your DApp to be embedded

For a browser to allow a page to embed another page’s content when they are hosted on different origins, you need the specific approval of the hosted page’s server. This approval is expressed in the form of response headers.

To allow Ledger Live to embed your DApp, you might need to edit your server’s configuration and edit the Content-Security-Policy header:

- To allow any websites to embed your page:
`Content-Security-Policy: frame-ancestors '*';`

- To allow only Ledger DApp browser to embed your page:
`Content-Security-Policy: frame-ancestors `
`https://platform-apps.ledger.com`

## Adding the “what you see is what you sign” property

As of today, most smart contract interactions on hardware wallets are quite difficult to understand for users:
- When the smart contract is not supported well, users have no way to verify what they are about to sign. In that case, the hardware wallet secures their seed against malware, but not really their ethereum funds from this threat. 
- When the hardware wallet displays the payload that users are about to sign with minimal parsing, it makes it difficult to actually verify what they are about to consent to. 

To solve this issue, we’ve developed a simple Ethereum plugin mechanism minimizing the burden for developers to support the smart contract interaction while providing maximum security to users thanks to the secure display. This mechanism will be explained in detail in a further blogpost.

# Conclusion

With the 2.29 release of Ledger Live, we intend to provide an environment to easily integrate a DApp, with minimal—and standard—modifications. 

We are very excited by this release and the possibilities it creates to easily integrate the world of DeFi and DApps into Ledger Live. We hope to add many more DApps in the near future. This is only the beginning of our journey to make Ledger Live more open and easily extensible.

Stay tuned as we strive to smoothly gather all crypto services onto  the same platform without any compromise in security!

