---
layout: post
title: "Discovering SMPC through CTF Challenges"
summary: "Ledger Donjon CTF 2020 - Creating challenges from vulnerabilities in SMPC implementation"
description: "Write-up of creating a CTF challenge about a vulnerable Secure Multiparty Computation implementation."
featured-img: ctf-renvm
author: The Donjon
categories: [Donjon]
---

# Discovering SMPC through CTF Challenges

## Introduction

At Ledger, we often hear about blockchains that take advantages of new breakthroughs in cryptography or computer science in general.
For example, [Ethereum 2.0](https://ethereum.org/en/) uses [BLS signature algorithm](https://en.wikipedia.org/wiki/BLS_digital_signature) instead of traditional ECDSA, [Monero](https://www.getmonero.org/) uses uncommon operations on the Ed25519 elliptic curve to provide strong privacy guarantees to users, etc.
When a piece of software implements complex algorithms, some vulnerabilities could happen.

Analyzing blockchains with a security mindset led to the creation of several challenges for the [Ledger Donjon CTF](https://donjon-ctf.io/) that took place a few weeks ago.
This blog post describes how one of the challenges of the CTF was designed.

## SMPC Signature in RenVM Blockchain

Traditional public-key signature algorithms rely on someone holding a private key which may be used to sign data.
A public key is associated with this private key and enables other people to verify that the signature of the data was really created by the one knowing the private key.
In the blockchain world, a private key is associated with an account and most operations between accounts are signed with the key of the sender.

Some people want to share the responsibility of holding the private key, using governance rules such as "to spend crypto-assets from the shared account, 3 people in a group of 10 must agree".
Such rules can be implemented using Threshold Signature Schemes, a research subject in cryptography which has been studied for decades.
This subject is part of a more general "Secure Multi-Party Computation" (SMPC) domain, which aims at defining algorithms to ensure security properties in a group of participants who could not fully be trusted.

In the blockchain world, [RenVM](https://mainnet.renproject.io/) is an interesting case where a set of machines (called "darknodes") runs an SMPC algorithm to compute ECDSA signatures.
A few months ago, a coworker became fan of RenVM because of its SMPC algorithm, and because it was not clear how the parts of the private keys were distributed among the people participating in running the SMPC.
If enough participants want to compromise the confidentiality of the private key, an attack is possible, because the Threshold Signature Scheme relies on a threshold of the number of malicious parties.
This is a common threat which is usually mitigated by imposing rules on the way participants are chosen.
For RenVM, what mechanisms prevent a group of attackers from entering the blockchain and stealing the private keys protecting several thousands of Bitcoins?
A few months ago, this question seemed very stimulating so this bootstrapped some research work.
But before answering the question, let's dig a little bit at what RenVM is and how it works.

## What is RenVM?

According to [their web site](https://renproject.io/), RenVM is a project aiming at "providing access to inter-blockchain liquidity".
This is achieved by creating tokens that represent other cryptocurrencies such as Bitcoin (BTC), Bitcoin Cash (BCH) or Ethereum (ETH) in the RenVM ecosystem.
As of December 2020, more than $1,300,000,000 USD worth of digital assets were tokenized in RenVM (source: <https://mainnet.renproject.io/>).

This mechanism works thanks to gateways that perform the conversions between the currencies.
For example, one of the gateways can convert Bitcoin to its token, named RenBTC, and can also convert RenBTC back to Bitcoin.
This gateway is a kind of "tunnel with two ends": one in the Bitcoin world and the other one in the RenVM world which provides liquidity.
The security of these gateways relies for a large part on a custom SMPC signature scheme.

In order to understand the link between SMPC and RenVM, let's see how gateways work.

## RenVM's Gateways

RenVM's gateways are implemented using several components:

* Several Ethereum smart contracts [documented by Ren Project](https://renproject.github.io/ren-client-docs/contracts/deployments) and [open source](https://github.com/renproject/darknode-sol/tree/v1.0.1/contracts).
* A Bitcoin address to receive Bitcoins and emit transactions, [19iqYbeATe4RxghQZJnYVFU4mjUUu76EA6](https://www.blockchain.com/en/btc/address/19iqYbeATe4RxghQZJnYVFU4mjUUu76EA6).
  In July 2020 this account held a bit more than 1000 BTC.
  In December 2020 this account held more than 16000 BTC.
  This was a large number of assets.

The public key associated with the Bitcoin address is `03a02e93cf8c47b250075b0af61f96ebd10376c0aaa7635148e889cb2b51c96927` (which is the point `(x=0xa02e93cf8c47b250075b0af61f96ebd10376c0aaa7635148e889cb2b51c96927, y=0xa8fa65f4d200384b1aba0a51ac9dc1eeb22e761ff680828ae19a8f9340baa83d)` of the elliptic curve secp256k1).

The program which has access to the private key associated to this public key can spend all the Bitcoins which were sent to this address.
And the Bitcoin gateway needs to sign transactions in order for users to convert RenBTC back to Bitcoin, so it needs to be able to use the private key.

Now, the question is: how can the gateway use the private key without ever knowing it?
And the answer is simple: by relying on a Threshold Signature Schemes between parties that ensures that an equivalent amount of RenBTC tokens are being "burnt" when Bitcoins are withdrawn (and a couple of other properties that are required to ensure security).

More precisely, RenVM was designed specifically to protect this highly sensitive private key.
To do so, RenVM's designers introduced the "Greycore"

## RenVM's Greycore

In [RenVM's documentation](https://github.com/renproject/ren/wiki/Greycore), the "Greycore" is defined as:

> The Greycore is a special community governed shard that backs all gateway shards and the coordination shard. The Greycore has two core purposes:
>
> * Guaranteeing the safety of assets under management by acting as a second signature on all minting and releasing (see [Gateways](https://github.com/renproject/ren/wiki/Gateways)), and
> * Guaranteeing the uniform randomness of shard selection by generating secure random numbers (see [Sharding](https://github.com/renproject/ren/wiki/Sharding)).
>
> In RenVM SubZero, members of the Greycore will be selected by the Ren team.

RenVM's blockchain includes nodes (called "darknodes") that are partitioned into groups (called "shards").
Each shard holds a private key and is able to compute an ECDSA signature using its private key, without any darknode knowing it entirely.

The gateways use a private key held by a specific shard called "the Greycore".
This key is fundamental to the trust in RenVM.
Indeed this key not only protects the Bitcoin equivalents of RenBTC tokens, but is also used as a "mint authority" in the Ethereum smart contracts used by RenVM (there are transactions such as <https://etherscan.io/tx/0xf1e568a16c933d855ebec01abffc23f4d59c132eece880f34c8a936eebbfc93c> that defined the "mint authority" of the Bitcoin gateway the entity associated with Ethereum address `0x7f64e4E4b2D7589Eb0ac8439C0e639856aeCEEe7`, which matches the key).

Now, how is this very sensitive private key protected between the darknodes of the Greycore?

RenVM does not provide the source code of the program powering darknodes.
People who want to operate a darknode need to download and run a 20 MB program from <https://github.com/renproject/darknode-release/releases>.
This program is written in Go, which makes reverse engineering very time-consuming.
Thankfully the SMPC algorithm used by RenVM is also documented in a paper, on <https://github.com/renproject/rzl-mpc-specification/tree/33a60237eb5eb3ec617d125f533368683cfca628>.
Even though this paper does not specify implementation details such as how messages are encrypted between darknodes, it provides a useful overview of how this algorithm works.

## RenVM's SMPC algorithm

RenVM's algorithm involves parties (the darknodes of a shard) which are willing to compute the ECDSA signature of a message.
Each party holds a fragment of the private key and can exchange messages with the other parties.
Then, the paper builds primitives in order to perform operations on fragmented secrets while only the final result is revealed and combined together to craft the signature.

While reading this paper, the way the modular inverse was computed seemed quite magic.
In order to compute the inverse of a fragmented secret number $a$ shared among the parties, modulo the order of the subgroup used in secp256k1, named $p$ (it is a prime number):

* A random fragmented secret $r$ is generated among the parties.
* Each party computes $t = a \times r \mod p$, using its share. This is a new fragmented secret.
* The value of this product $t$ is revealed (in a way called "Share Hiding Open" which does not reveal the fragments).
* If $t$ is zero, the algorithm fails (and could start again with a new $r$).
* Each party computes the inverse of $t$ modulo $p$ (this is a simple operation) and computes fragments of a new secret $b = t^{-1} \times r \mod p$ from its fragments of $r$.
* The fragmented secret $b$ is the modular inverse of $a$, because $b = t^{-1} \times r = (a \times r)^{-1} \times r = a^{-1} \times r^{-1} \times r = a^{-1}$.

This algorithm is well-known in the cryptography literature, for example as "Beaver's tricks for inversion" in the figure 1 of a recent paper, [A Survey of ECDSA Threshold Signing](https://eprint.iacr.org/2020/1390).

However the first time someone with an attacker mindset discover this algorithm, they might think:

> What happens if the random generator used by darknodes is biased? Would it be possible to factor $t$ to recover $a$ and $r$?

This is important because when darknodes sign something, $a$ happens to be the random ECDSA nonce of the signature: if this nonce is known, it is possible to recover the private key from the signature, and if two different signatures share the same nonce, it is also possible to recover the private key.

In practice the question about factoring does not make sense, mathematically speaking: as $p$ is prime, for any non-zero $t$, all numbers $a$ between $1$ and $p - 1$ is a possible factor, because $t = a \times r$ with $r = a^{-1} \times t$.
But if there is a bias in the random number generator used by the darknodes, could this bias be observed in the product?

RenVM's paper specifies an "Unbiased Random Number Generator" to generate the values of $a$ and $r$, but the word "unbiased" is related to multiparty computation considerations: this way, if enough parties are honest, the generated random number is supposed not to be controlled by a possible attacker.
However, what happens if the random number generation is biased for all parties, for example if they all use the same obscure program that they cannot reasonably analyze because it is written in Go and the source code is not available?
Such a situation would lead to a cryptography vulnerability which could enable an attacker to recover the private key.

At this point of the analysis, it seemed to be an idea which was solid enough to create a challenge for the Ledger Donjon CTF about such vulnerability.
And this was how a CTF challenge was born!

## From a blockchain to a CTF challenge

In Ledger Donjon CTF, there was a challenge named "SMPC Signature" in which the participants were given a Python script that implemented RenVM's algorithm to compute ECDSA signatures but with only 64-bit random numbers instead of 256-bit ones.
The communications between the parties were implemented using Python's `asyncio` module and the [Noise Protocol Framework](http://www.noiseprotocol.org/) for encryption.
The participants also had a recording of messages which were exchanged when generating some signatures.
Most messages were encrypted but the ones that were considered "public information" in RenVM's paper.
This meant that the messages containing $a \times r$ were not encrypted, and contained numbers which were much smaller than usual (approximately 130 bits instead of 256 bits, because of the vulnerability which was introduced).
These messages enabled the participants of the CTF to recover the ECDSA nonce of some signatures that were recorded, which led to the private key.

This vulnerability introduced another way to solve the challenge: as the ECDSA nonce was very small, an attack using [LLL algorithm](https://en.wikipedia.org/wiki/Lenstra%E2%80%93Lenstra%E2%80%93Lov%C3%A1sz_lattice_basis_reduction_algorithm) was able to directly recover the private key from two signatures.
As thinking of performing this attack mostly relied on understanding the issue with the implementation, this was considered as an acceptable solution and the challenge was not modified because of this.
Some participants found this weakness and exploited it.
This is for example detailed in <https://blog.bordes.me/ledger-donjon-ctf-2020-smpc-signature.html>

In the end, only 4 participants solved the challenge "SMPC Signature".

The source code of this challenge is now available on <https://github.com/Ledger-Donjon/ledger-donjon-ctf-2020/tree/master/smpc_signature>.

## Conclusion

Blockchains are very innovative in the way they use recent technologies.
Sometimes these usages introduce vulnerabilities that incur large loss of assets.
This is why it seems important to study these blockchains to find weaknesses that could lead to vulnerabilities, before they are exploited by attackers.
One of the objectives of the Ledger Donjon CTF was to make members of the infosec community aware of the technologies used by blockchains, and this seems to have been fulfilled :)
