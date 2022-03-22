---
layout: post
title: Raising the bar for security with Ledger Swap 
author: Charles Guillemet
summary: Enhancing the state of the art security for swap operations with Ledger hardware wallet.
featured-img: swap
categories: Tech
---

# Raising the bar for security with Ledger Swap

With Ledger Swap you can exchange coins in Ledger Live, easily and securely. Swapping coins is as easy as sending a transaction. It requires no address verification while enhancing the state of the art security.

Ledger swap showcases the power of end-to-end security built right into Ledger Live and your Ledger hardware wallet.

<br/>
<center>
<img src="/blog_swap/1.png" style="width:500px;">
</center>  
<br/>

## What is swap?
Swap allows users to quickly exchange one crypto asset for another. It doesn’t require you to move your funds to an exchange first and then trade your asset with a supported pair.

Instead, with a swap you send the crypto asset you wish to exchange in one transaction after which you receive back another. This all happens by sending a single swap transaction directly from your wallet.

<br/>
<center>
<img src="/blog_swap/2.png" style="width:500px;">
</center>  
<br/>


## How do swaps work?
The general principle is quite simple. There are third parties like Changelly that offer swaps as a service. If a user wants to swap BTC for ETH , the third party offers a rate for that exchange, including a commission. For example, they may offer to swap 0.05 BTC for 0.14 ETH.

<br/>
<center>
<img src="/blog_swap/3.png" style="width:500px;">
</center>  
<br/>

To accept the offer, the user has to provide the address where to receive the ETH and send 0.05 BTC to the address provided by the swap provider.

<br/>
<center>
<img src="/blog_swap/4.png" style="width:500px;">
</center>  
<br/>

## Security analysis
From a user’s perspective, a swap consists of: 
1. Signing an outgoing transaction (send BTC)
2. Providing a receive address (receive ETH)

Most hardware wallet users know that these two operations are sensitive. They require basic checks to ensure an optimal level of security:
* The swap provider address must be verified on the device before validating the swap transaction. Indeed, the information displayed on the wallet interface (computer, smartphone) should not be trusted.
* The user’s address, to which the provider will send the swapped coins, should be verified on the device before sharing it.

The main issue when swapping BTC against ETH is that the addresses are fetched by the wallet interface (e.g. Ledger Live). So if this wallet is compromised, an attacker could replace one of the addresses by his own.

<br/>
<center>
<img src="/blog_swap/5.png" style="width:500px;">
</center>  
<br/>
_<center>Attack scenario where an attacker replaces the ETH address</center>_

<br/>
<center>
<img src="/blog_swap/6.png" style="width:500px;">
</center>  
<br/>
_<center>Attack scenario where an attacker replaces the BTC address</center>_

As the user’s address is automatically sent to the swap provider by Ledger Live, the user has no means of verifying the address on the hardware wallet. Without countermeasures, the user would have no way of protecting against a malicious address replacement.

This issue is common to all wallets, whether they are hardware or not. How can addresses be exchanged securely and in a user-friendly way?

**To solve this problem, we developed the world’s first swap integration with end-to-end security.**

## Swap with end-to-end security

The overall mechanism is quite simple and described in the following steps.

<br/>
<center>
<img src="/blog_swap/7.jpg" style="width:500px;">
</center>  
<br/>

1- The swap operation is initiated by Ledger Live, which communicates with the swap provider API to get the exchange rates. “How much ETH for 0.005 BTC?”

<br/>
<center>
<img src="/blog_swap/8.png" style="width:500px;">
</center>  
<br/>


2- The swap provider answers with a swap offer: “0.14 ETH for your 0.005 BTC”. The user can then accept the offer and continue to confirm the swap.

<br/>
<center>
<img src="/blog_swap/9.png" style="width:500px;">
</center>  
<br/>


3- The Exchange app must now be opened on the device. This is where the secure part of the transaction happens: the Secure Element generates a transaction ID and sends it to the swap provider along with the necessary information for performing the swap request information: 
* `outgoing currency`, `outgoing amount`, `provider address`
* `receiving currency`, `receiving address`
This information is sent to Ledger Live which forwards it to the swap provider.

4- The provider answers with a swap offer. It constructs a payload containing the final information for the swap: 
* `Outgoing crypto`, `outgoing amount`, `provider address` (BTC)
* `receiving crypto`, `receiving amount`, `user address` (ETH) 
* `Transaction ID`
* `Signature` of this payload

The provider sends back this `signed payload` to Ledger Live which in turn forwards it to the hardware wallet.

<br/>
<center>
<img src="/blog_swap/10.jpg" style="width:500px;">
</center>  
<br/>

5- After receiving the `signed payload`, the Exchange app running inside the Secure Element verifies the `signature` of the payload using the provider’s `public key` and the `transaction ID`. This `public key` is certified by Ledger and the public key to verify this certificate is stored in the Exchange app.
* The signature ensures the payload has actually been sent by the provider (non-repudiation principle).
* The `transaction ID` avoids a replay attack


6- The Exchange app displays the amounts of the swap transaction so the user can validate them. In the background, the application automatically verifies that the user’s Ethereum and Bitcoin addresses are indeed managed by the device, so the user does not have to verify them manually. The provider’s addresses are trusted thanks to the provider’s cryptographic signature.

<br/>
<center>
<img src="/blog_swap/11.gif" style="width:500px;">
</center>  
<br/>

7- Finally, the swap operation can now be executed. The Exchange app calls the Bitcoin app to compute the transaction’s signature, which it returns.

8- Once the swap provider has received the BTC, it will send back the ETH, and all the operation details are then displayed in Ledger Live.

<br/>
<center>
<img src="/blog_swap/12.png" style="width:500px;">
</center>  
<br/>

 And voilà, you just performed a swap **securely**!
 

## Conclusion
We’ve shown how to implement end-to-end security on a Swap operation in Ledger Live while also improving user experience.

* We’ve collaborated with Changelly to secure their centralized swap service. 
* Huge improvements are made in security and user experience, since the user doesn’t have to verify any addresses!
* In today’s setup, users can only swap crypto if both the sending and receiving accounts are backed up by the same recovery phrase.
* Now that we’ve achieved this goal, we’ll look into securing decentralized swaps in the future.
* We hope we can inspire other wallets with our work and together raise the standards for security and ease of use.
