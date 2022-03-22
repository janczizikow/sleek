---
layout: post
title: Why Taproot Matters for Bitcoin and Ledger's Future?
author: Charles Guillemet and Salvatore Ingala
summary: Bitcoin Taproot is live and Ledger supports it already
featured-img: taproot-logo
categories: Tech
---

# Taproot Support in the Ledger Stack
Bitcoin is evolving, and Ledger’s always supported that evolution since Day 1. The Bitcoin protocol is very stable and doesn’t evolve significantly over time, which is part of the Bitcoin value proposition. Nevertheless, it doesn’t mean that the Bitcoin protocol is frozen forever. 

Since its first implementation in 2009, Bitcoin has gone through several changes, making it more efficient and scalable. 

One of the first changes was the 1MB block limit in October 2010, by Satoshi himself. After this period, Bitcoin started to get organized with the famous [Bitcoin Improvement Protocol](https://github.com/bitcoin/bips) (BIP). The BIP enabled many evolutions until the SegWit update, which was the last Bitcoin protocol update in 2017.

The SegWit protocol update brought several important innovations including smaller (thus cheaper) transactions, and fixed the [famous malleability](https://en.bitcoin.it/wiki/Transaction_malleability) issues on transaction signatures.

On Sunday, November 14, 2021, from the block 709.632, Bitcoin was updated to activate the Taproot update. 

Taproot addresses Bitcoin’s challenges in scalability, privacy, and transparency; all factors that could bolster the evolution of the Bitcoin network.
This is incredibly important, but one must remember it’s not as simple as one uniform solution to all of Bitcoin’s challenges. Rather, the Taproot upgrade is made up of several components that will all work in unison to bring the Bitcoin network to new heights, which is a huge moment for the entire blockchain community.
Let’s examine each of the critical Taproot components to get the full picture.

**Taproot update includes 3 main improvements:**
- Schnorr Signatures
- Merkleized Alternative Script Trees (MAST)
- Pay 2 Taproot

## 1. Schnorr Signatures
This evolution is quite important as it introduces a new signature scheme for Bitcoin Transactions. If you’re not familiar with these terms, let me give you a small introduction to asymmetric cryptography.
Asymmetric cryptography is a process that uses a pair of keys: public and private key.
Its most interesting application is the Digital Signature. It's a process where you can prove you know your private key without revealing the private key, while anyone with your public key can verify the proof.
See this image below:

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/sign-process.png">
    <br/><br/>
    <figcaption>Digital signature process</figcaption>
  </figure>
</center>
<br />


**Let’s go back in history for a moment.**
 Asymmetric cryptography was publicly discovered by the famous Diffie, Hellman, and then Merkle in the 1970s. Then, in the late 1970s, Rivest Shamir and Adleman (RSA) invented the famous RSA cryptosystem that is still widely used today.
In the 1980s, Elliptic Curve Cryptography (ECC) was discovered by Koblitz and Miller. 
ECC has many advantages over RSA  such as computations and data transfers that are more efficient for the same level of security.
ECC, contrary to RSA, is full of variations: basis field, curves, and signature algorithms...

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/ecc.jpeg">
    <br/><br/>
  </figure>
</center>
<br />

Now, let's focus on Signature algorithms. The Schnorr signature was invented by Claus-Peter Schnorr in the 1980s.
His signature algorithm is much simpler than any other, gives better security property and is linear. That means it’s possible to leverage this property to implement Threshold or cryptographic multisignature quite easily and in a secure manner (cf. [Musig2](https://eprint.iacr.org/2020/1261.pdf)). Unlike traditional (PSBT) multisignature wallets, where each of the parties has to add a separate signature to the same message, this will allow them to participate in an interactive protocol to jointly produce a single signature, making multisignature wallet as cheap and efficient as single-signature ones, and improving privacy at the same time.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/schnorr-musig.png">
    <br/><br/>
    <figcaption>Schnorr signature is linear</figcaption>
  </figure>
</center>
<br />




Then the unthinkable in Bitcoin happened. Schnorr did the worst thing that you can do (this, and claiming the break of RSA without any proof): He PATENTED his invention.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/patent-troll.png">
    <br/><br/>
  </figure>
</center>
<br />

Thus, Schnorr signatures weren't used and ECDSA (Elliptic Curve Digital Signature Algorithm) was specifically designed to bypass the patent. ECDSA is the standard that is currently used in Bitcoin and most of other crypto-currencies.

When you look at ECDSA equations, it truly looks like a hack around Schnorr's equation. 
In 2008, more than 20 years after the invention, the patent expired. In 2008, the mysterious Satoshi was finishing the design of #bitcoin. But because of the patent, the Schnorr signature wasn't standardized.
Thus ECDSA was chosen for #bitcoin as a standardized and widely used algorithm. 
In the meantime, EdDSA was invented, and can be seen as a variation of Schnorr Signatures, as it’s currently used in Polkadot, Cardano and Stellar over Curve25519.
30 years after the creation of this patent, the Schnorr Signature can now  be used in one of the largest scale applications: [Bitcoin](https://en.bitcoin.it/wiki/BIP_0340).
It's great news, but we lost 30 years of usage because of a silly patent.

## 2. MAST (Merklized Alternative Script Tree)  
The Taproot update integrates another improvement to scripts called: Merklized Alternative Script Trees or MASTs,  which was already proposed from as early as  2013, but never made it into the Bitcoin protocol.
Every spendable amount of Bitcoin comes with a script that specifies what conditions need to be met to be allowed to spend those coins. In the most simple case, the condition looks like: “Alice owns these coins,” which is the kind of statement that cryptographic signatures can prove. Among the most simple scripts we have the [pay-to-pubkey-hash](https://en.bitcoin.it/wiki/Script#Standard_Transaction_to_Bitcoin_address_.28pay-to-pubkey-hash.29). 
However, more complex conditions are possible, for example: “Two out of Alice, Bob and Charlie must sign,” called two of three multisignature, or “Bob signs, but 2 weeks must pass first,” called the timelock, or “a certain secret data with hash H must be revealed,” called hashlocks.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/multisig.png">
    <br/><br/>
  </figure>
</center>
<br />


More complex contracts can be composed by combining several of these simple conditions; for example, the lightning network itself uses contracts that combine two-of-two multi-signatures, timelocks and hashlocks!
The problem with using contracts with a large number of alternative spending conditions is that the size of the script keeps growing once more such conditions are added! In fact, even if only one of those conditions is used, the entirety of the script must be revealed. Such a waste! 
Drumroll please… finally here come the MASTs! By using a well known cryptographic construction called [Merkle trees](https://en.bitcoinwiki.org/wiki/Merkle_tree), it is possible to encode all of the possible spending conditions in a single short summary (a hash, typically 32 bytes long), in such a way that it is possible to reveal just one of those spending conditions.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/merkletree.png">
    <br/><br/>
  </figure>
</center>
<br />


This brings enormous savings in regards to the amount of space used by those complex contracts, which could now have tens or hundreds of spending conditions, with little additional cost! Moreover, only the parties involved in the contract will know about all the possible spending conditions and an external observer will only know about the single spending condition that was indeed used, which is a big win for privacy as well.

## 3. Pay-2-Taproot (P2TR)
Finally, the Taproot upgrade brings in a new type of transaction scripts, called Pay-2-Taproot. This allows for the  combination of the Schnorr signature and MAST in a single transaction. Previous transaction types made it easy for an external observer to distinguish if some bitcoins were locked using a single key, or via a more complex script.
By exploiting the properties of Schnorr signatures, P2TR addresses allow the combination of signatures and scripts together, by hiding the MAST of scripts inside a public key. Therefore, the same coins could be spent either with a plain signature corresponding to that public key, called Key Path Spend, or with one of the scripts in the MAST, if there are any.
Nobody will ever know that the scripts were there, if they’re not used when spending the coins!


# Bitcoin Support in Ledger stack
We have worked hard over the past several months to prepare the support of this protocol upgrade. We took this opportunity to re-factor a big part of our technical stack here at Ledger. 

When you interact with the Bitcoin protocol within Ledger Live, several components are involved.

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/ledger_explorer.svg">
    <br/><br/>
  </figure>
</center>
<br />




## Synchronizing your Bitcoin account on Ledger 
The Ledger Hardware wallet needs to have the Bitcoin App installed. This app derives your Bitcoin Private key, public key, and addresses from your seed. It shares your Bitcoin extended public key to Ledger Live. 
Ledger Live includes a native library that is in charge of deriving your addresses from the xpub, to synchronize your transactions history with the Ledger Explorer API. This API is a huge indexer of the Bitcoin blockchain and it allows you to get your Bitcoin account synchronized quickly. It’s intensively used by Ledger users with several hundreds of millions of requests a day. 

## Sending Bitcoin

When you want to send a Bitcoin to someone like Alice from our earlier example, Ledger Live makes sure you’re in sync with the blockchain, then it creates the payload containing the script of your spending. It then sends this payload to your hardware wallet through USB or Bluetooth. The Bitcoin app parses the payload, verifies that it’s correct, that the change address is yours, and then displays to the user the important information in human readable form. 
As soon as you consent, the Bitcoin app will request the signature to the Ledger Hardware wallet OS. This signature is an ECDSA signature for Segwit accounts and Schnorr signature for Taproot accounts. The signed payload is sent to the Ledger Live and the Libcore which will forward it to Ledger Explorer API in charge of putting it in the mempool. The TX is then ready to be mined.

## Complete rework of our Bitcoin support
Throughout 2021, we have reworked all these key components:

- Explorers have been upgraded to handle the ever growing load they encounter
- We reworked our implementation from a C++ stack to JavaScript to rely more on the ecosystem. You can review our [GitHub here](https://github.com/LedgerHQ/ledger-live-common/tree/master/src/families/bitcoin)
- The [Bitcoin app](https://github.com/LedgerHQ/app-bitcoin-new) has been reworked in order to support new use cases including Taproot. A dedicated blogpost will be done soon.

**Now in Ledger Live, it’s possible to:**
- Send to a Taproot address
- Create a Taproot account
- Receive on a Taproot account
- Send Bitcoin from the Taproot address

<br />
<center>
  <figure class="image">
    <img src="{{ site.baseurl }}/assets/taproot/live-support.png">
    <br/><br/>
  </figure>
</center>
<br />


To be more precise Ledger initial support allows to send to any Taproot address while account implementation is focused on single-key BIP-86 compliant accounts. More enhanced support will follow.


# In with the new at Ledger
This is an exciting time for Bitcoin and its Taproot upgrade is significant for the community and for the crypto industry as a whole.
While this update won’t allow NFTs or other types of tokens to thrive in the Bitcoin ecosystem (it wasn’t its goal in the first place), it will allow better usage of core Bitcoin value propositions: storing value and spending it.

Some early discussions on extending Bitcoin’s script capabilities are taking place and could in-turn bring more standard DeFi use cases to Bitcoin holders.
This will add to its overall appeal for thousands of developers whose mission is to pave the way towards continued innovation, top-notch security, and faster processing times. 
We’re thrilled to announce the support of Taproot at Ledger and we’ll continue to support Bitcoin and its adoption by providing the highest level of security for your hodling and using your Bitcoin.


Read our [Ledger Academy](https://www.ledger.com/academy/what-is-taproot) articles on Taproot.

