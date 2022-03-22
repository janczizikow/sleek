---
layout: post
title: Funds are SSSAFU - Stealing the funds of all HTC EXODUS 1 users
summary: How a bad implementation of Shamir Secret Sharing allows to steal all the cryptocurrencies stored on a HTC EXODUS 1 phone.
description: How a bad implementation of Shamir Secret Sharing allows to steal all the cryptocurrencies stored on a HTC EXODUS 1 phone.
featured-img: htc-ssafu
author: Jean-Baptiste Bédrune
categories: [Donjon]
---

_TL;DR_: HTC EXODUS 1 phones come with an integrated hardware wallet. This wallet allows to backup its [master seed](https://bitcoin.org/en/glossary/hd-wallet-seed) by splitting it and sending it to "trusted contacts".
Three trusted contacts are normally required to reconstruct the whole seed. We show that any trusted contact, or an attacker who compromised the phone of a trusted contact, can recover the whole seed and steal all the funds
of the EXODUS 1 owner. We strongly recommend HTC EXODUS 1 users to move their funds to another seed if they used the Social Key Recovery function before April 2019.


# Intro

In 2018 HTC launched [EXODUS 1](https://www.htcexodus.com/), its first blockchain-oriented smartphone. Compared to other smartphones, it comes with a Hardware Wallet functionality where the [master seed](https://bitcoin.org/en/glossary/hd-wallet-seed) is stored within a secure enclave.
This ensures an attacker, even with root privileges, does not have access to the master seed - it’s encrypted within the enclave.

<p align="center">
<img src="/assets/htc-exodus/exodus1.jpg?cache=new">
<br/>
Fig. 1: HTC EXODUS 1 device
</p>

We were especially interested in this (hardware) wallet since it offers a nice feature: [Social Key Recovery](https://www.htcexodus.com/uk/support/exodus-one/faq/what-is-social-key-recovery-and-why-use-it.html). In this blog post, we will focus on this EXODUS 1 specific feature.

It consists in an original mechanism allowing to enforce the backup of the seed. The seed is split into five shares and each share is sent to a trusted contact. Should the user lose their phone, they will be able to reconstruct the seed by asking three of its five trusted contacts to communicate their shares. The number of shares (5) and the threshold (3) are fixed.

We will start by providing more details on the implementation of the Social Key Recovery. Then, we will present two methods of attack:
- The first one demonstrates how to lower the threshold from three trusted contacts to two.
- The second demonstrates how to lower the threshold from three trusted contacts to one, meaning that any of your trusted contact could retrieve the master seed and access your funds.


## Social Key Recovery

The master seed backup is a common problem for Hardware Wallet users.
From this seed only, every user secrets are generated. This seed must be backed up, to ensure that the loss of your wallet does not imply the loss of your secrets: they can be restored on a new wallet from the backed up seed.

**How can you backup a seed?** 
Most Hardware Wallets propose a paper recovery sheet (Fig. 3), on which the user has to write down its BIP39 mnemonics (the mnemonics are a way to represent your seed into human readable words).
But keeping this paper sheet safe is not an easy task, and some dedicated devices have been designed for this purpose (Fig. 2). For instance, a cryptosteel might be used, to prevent your mnemonic seed from deterioration.


<p align="center">
<img src="/assets/htc-exodus/cryptosteel.png?cache=new">
<br/>
Fig. 2: Cryptosteel - device to backup a seed
</p>

An alternative solution could be to own a backup Hardware Wallet, initialized with the same seed.
However, there is no perfect solution that would address all the problems.

<p align="center">
<img src="/assets/htc-exodus/ledger-recovery-sheet.png?cache=new">
<br/>
Fig. 3: Ledger Recovery Sheet
</p>



<p align="center">
<img src="/assets/htc-exodus/gridplus.png?cache=new">
<br/>
Fig. 4: The recovery sheet storage in practice
</p>

HTC EXODUS 1 comes with its own backup mechanism: Social Key Recovery. The user’s seed is split into **shares** which are sent to trusted contacts. The knowledge of 1 or 2 **shares** does not bring any information about the seed. The sole knowledge of 3 **shares** allows to reconstruct the complete seed. Within the scheme the master seed is never fully backed up in a single location.

HTC Hardware Wallet takes the form of an Android application named Zion, along with a trustlet (a secured application which is executed within the smartphone _secure OS_) which stores the seed and performs sensitive operations (Fig. 5). The secret sharing is also computed within the trustlet: in the following, the studied mechanism is implemented in the _secure OS_.

<p align="center">
<img src="/assets/htc-exodus/architecture.svg?cache=new">
<br/>
Fig. 5: Zion - Architecture overview 
</p>

## Shamir's Secret Sharing

Social Key Recovery is based on Shamir's Secret Sharing (SSS). This elegant [scheme](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing) allows to splitting a secret into $n$ shares, and to define a threshold $k$ as a minimal number of necessary shares to reconstruct the initial secret. An attacker able to retrieve $k-1$ shares obtains no information about the secret.

**Let’s briefly introduce the SSS principles in order to understand the security flaw.**

The main mathematical concept used behind SSS is the following:

- $2$ points uniquely define a line (polynomial of degree $1$),
- $3$ points uniquely define a parabola (polynomial of degree $2$),
- ...
- $k$ points uniquely define a polynomial of degree $k-1$,

But:

- $1$ point could belong to a large number of polynomials of degree $1$,
- $2$ points could belong to a large number of polynomials of degree $2$,
- ...
- $k-1$ points could belong to a large number of polynomials of degree $k-1$,

When sharing a secret $S$ using SSS, reconstructible with $k$ shares among $n$, the knowledge of $k$ shares is sufficient to reconstruct $S$, but the knowledge of $k-1$ shares brings no information about $S$


Here is how the splitting of $S$ into $n$ shares can be done by SSS, with a threshold $k$:

- Generate $k-1$ random coefficients $a_1, ..., a_{k-1}$ in a finite field $F$, and we set $a_0=S$
- Define the polynomial $P(x) = a_0 + a_1x + ... + a_{k-1}x^{k-1}$ (of degree $k-1$).
- Choose $n$ distinct points from $P(X)$: for instance for $i=1, ..., n$, we choose $(i, P(i))$. Each participant is given a point $(i, P(i))$.

Any subset of $k$ participants is hence able to reconstruct $P(x)$, and then compute $P(0)$, which is the secret $S$.

One important thing to mention is that all the coefficients $a_1, ..., a_{k-1}$ during the splitting must remain secret. Once the splitting is done, these coefficients are no longer available. 

![Shamir Secret Sharing](/assets/htc-exodus/sss.png)

This problem can be solved by:

- either securely storing the polynomial coefficients, so that they can be restored later to generate other shares,
- or only keeping the PRNG state before the splitting.


The SSS implementation used by HTC is inspired by an open source project, and is available [here](https://github.com/dsprenkels/sss/).
This open source implementation generates the shares all at once. One cannot request for a single share. In order to allow trusted contact to be added at will, HTC modified the implementation, at the expense of security.

HTC chose to keep the PRNG seed. But the implementation also uses a DRBG: This ensures the output is predictable and the generated coefficients will always be the same. The seed used by DRBG (ie the PRNG state) is stored inside an encrypted partition, only available for the _secure OS_.

## Random Number Generator:

The RNG from the original implementation (which was non-deterministic) has been replaced by the following function:


```c
#define RANDOM_POOL_SIZE 128

static uint8_t random_pool[RANDOM_POOL_SIZE];

size_t sss_rand(uint8_t *data, size_t len) {
  if (len == 0) {
    return 0;
  }

  while (len > RANDOM_POOL_SIZE) {
    memcpy(data, random_pool, RANDOM_POOL_SIZE);
    data += RANDOM_POOL_SIZE;
    len -= RANDOM_POOL_SIZE;
  }
  memcpy(data, random_pool, len);
  return len;
}
```
The PRNG simply returns the content of a random buffer. This 128 bytes buffer is manually updated by the function `sss_update_secure_random_buffer`: 

```c
void sss_update_secure_random_buffer(const uint8_t *entropy, size_t size) {
  SHA256_CTX ctx;
  uint8_t digest[SHA256_DIGEST_LENGTH];
  uint8_t *p = random_pool;

  sha256_Init(&ctx);
  sha256_Update(&ctx, entropy, size);
  sha256_Final(digest, &ctx);

  for (int i = 0; i < 4; i++) {
    memcpy(p, digest, SHA256_DIGEST_LENGTH);

    sha256_Init(&ctx);
    sha256_Update(&ctx, p, SHA256_DIGEST_LENGTH);
    sha256_Final(digest, &ctx);
    p += SHA256_DIGEST_LENGTH;
  }
}
```

We can see that the entropy passed as an input parameter to this function fully determines the internal state of the PRNG, and hence its outputs. As we explained earlier, this behavior was intended by HTC. This entropy arises from the smartphone TRNG, which value is returned by `qsee_prng_getdata`. 128 bits of entropy are used and stored in the encrypted partition.

Knowing the output of the PRNG is enough to completely determine the whole random output sequence. For instance, if we know the first 32 returned bytes, we know the following bytes will correspond to the SHA-256 of these bytes, then the SHA-256 of this value, and so on... Moreover, the PRNG has an extremely short period of 128 bytes.

However the lack of robustness of the PRNG won't be useful for our attacks: what will be used is the fact that the state of the PRNG is fixed between calls. Two successive calls of `sss_rand` will always return the same values if `sss_update_secure_random_buffer` is not called in between.


## HTC Social Key Recovery Shares computation

The shared secret is the seed of the wallet, used to derive all the keys for every cryptocurrency. But the implementation adds an encryption layer to protect the secret. The cipher chosen is an authenticated stream cipher based on Salsa20 and Poly1305 (same as [TweetNaCl](https://tweetnacl.cr.yp.to/))


### Initialization

1. If the PRNG seed  $Entropy$ is not initialized, a strong generator must be used to get a 128 bits seed. 
2. Store this seed in a safe place (in our case, the encrypted partition only visible by the _Secure OS_).

### Secret generation

1. Initialize the PRNG: call `sss_update_secure_random_buffer` with $Entropy$ as an argument. Hence successive calls to the DRBG will return identical values for several instances.
2. Prepare the message to be encrypted: fill a buffer $m$ with 64 random bytes using `sss_rand`. Copy the seed at the beginning of $m$.
3. Generate a 256 bits random encryption key $S$ using `sss_rand`.
4. Encrypt $m$ with $S$: $c=Salsa20-Poly1305_S(m)$.
5. Return $(c, S)$.

### Share computation:

$S$ is the secret to protect. 
Here is how to generate $s_j, 0 \le i < n$ allowing to reconstruct $S$ from $k$ shares amongst $n$.

1. $S$ is interpreted as 32 $a_{0,j}, 0 \le j < 32$ in $\textrm{GF}(2^8)$. Initialize 32 polynomials $P_j, 0 \le j < 32$ of degree $k-1$ with these value.
2. Using `sss_rand`, generate the $k-1$ remaining coefficients for each one of the 32 polynomial $P_j(x)=a_{k-1,j}x^{k-1}+\ldots+a_{1,j}x+a_{0,j}$ 
3. Convert the share index to compute into an element $y$ in $GF(2^8)$. ($1$ for 1, $x$ for 2, $x+1$ for 3, $x^2$ for 4 and $x^2+1$ for 5). 
4. Return $s_j=(j, P(y))$, where  $P(y)$ is the concatenation of the $P_j(y), 0\le j < 32$.

During the first step, the $S$ interpretation into 32 elements in $\textrm{GF}(2^8)$ is performed by the `bitslice` function (Fig. 6), which can be considered as a transposition of a 32x8 matrix of elements in $\textrm{GF}(2)$. The first bits of each secret byte correspond to the first 32 bits of the bitsliced value, and so on.

<p align="center">
<img src="/assets/htc-exodus/bitslice.png?cache=new">
<br/>
Fig. 6: The bitslice function
</p>

## Breaking the governance threshold

The previously described algorithms show that the secret $S$ and the $P_j$ polynomial coefficients are all generated by the `sss_rand` function.

The $P_j$ polynomials are of degree 2:

$P_j(x) = a_{j,2}x^2+a_{j,1}x+a_{j,0}$, with $a_{j,0}$ from $S$.

Here is an extract of the code used to generate the shares:

```c
/*
 * Create `n` shares with theshold `k` and write them to `out`
 */
void sss_create_shares(sss_Share *out, const unsigned char *data,
                       uint8_t n, uint8_t k)
{
  unsigned char key[32];
  unsigned char m[crypto_secretbox_ZEROBYTES + sss_MLEN] = { 0 };
  unsigned long long mlen = sizeof(m); /* length includes zero-bytes */
  unsigned char c[mlen];
  int tmp;
  sss_Keyshare keyshares[n];
  size_t idx;

  /* Generate a random encryption key */
  sss_rand(key, sizeof(key));
...

  /* Generate KeyShares */
  sss_create_keyshares(keyshares, key, n, k);
...
```

Here is the  `sss_create_keyshares` code :

```c
/*
 * Create `k` key shares of the key given in `key`. The caller has to ensure
 * that the array `out` has enough space to hold at least `n` sss_Keyshare
 * structs.
 */
void
sss_create_keyshares(sss_Keyshare *out,
                     const uint8_t key[32],
                     uint8_t n,
                     uint8_t k)
{
...

  uint8_t share_idx, coeff_idx, unbitsliced_x;
  uint32_t poly0[8], poly[k-1][8], x[8], y[8], xpow[8], tmp[8];

  /* Put the secret in the bottom part of the polynomial */
  bitslice(poly0, key);

  /* Generate the other terms of the polynomial */
  sss_rand((void *)poly, sizeof(poly));
...
```

The `key` variable is filled by `sss_rand`, just like `poly`. `key` is then used to initialize all the 32 $a_{j,0}$: this is done during the `bitslice` call, which fills `poly0` for this purpose. The `poly` buffers is used to store the polynomial coefficients of degree $1$ and $2$.

But as mentioned before, two successive calls of `sss_rand` will output identical values. Hence `key` and the first 32 bytes of `poly` are equal.
Since `poly0` is a permutation of `key`, we then get that the set of the polynomial coefficients of degree 1 is in reality a permutation of the polynomial coefficients of degree 0.

Does the knowledge of only two shares allow to reconstruct the secret?
Let's write down the equations of the *shares* $(1, P(1)), (x, P(x)), (x+1, P(x+1)), (x^2, P(x^2)), (x^2+1, P(x^2+1))$ to address this question.


The first two *shares*  $P(1)$ and $P(x)$ are:

\begin{eqnarray}
P(1) &=& a_{0,2} + a_{0,1} + a_{0,0} || a_{1,2} + a_{1,1} + a_{1,0} || \ldots || a_{31,2} + a_{31,1} + a_{31,0}
\end{eqnarray}
\begin{eqnarray}
P(x) &=& a_{0,2}x^2 + a_{0,1}x + a_{0,0} || a_{1,2}x^2 + a_{1,1}x + a_{1,0} || \ldots || a_{31,2}x^2 + a_{31,1}x + a_{31,0}
\end{eqnarray}

All these equations are linear. The values of $P(1)$ and $P(x)$ can be expressed as a linear combination of the $P_i$ coefficients.
But since the polynomial coefficients of degree 0 are a linear combination of the coefficients of degree 2, we can express $P(1)$ et $P(x)$ as a linear combination of the polynomial coefficients of degree 1 and 2 only.

The linear application we use can be represented as a 512x512 matrix of elements in $\textrm{GF}(2)$. Its rank is 506 and whatever $P(1)$ and $P(x)$ are, the system will always have 64 solutions. Solving is immediate.

It can be shown that, no matter which shares are retrieved, the system will always have between 2 and 256 solutions.
In order to test the returned solutions, we use a previously mentioned property of the used DRBG: the byte representation of the polynomial coefficients of degree 1 must be equal to the SHA-256 of the coefficients of degree 2.


This attack has been implemented using Sage. Given two *shares*, solving the system and testing all solutions takes less than a second. The secret is systematically retrieved from two shares.

```shell
sage: load("rebuild_secret.py")
0102030405060708090a0b0c0d0e0f100102030405060708090a0b0c0d0e0f100a2b7065ad61a3ca403d62f61b21fabbab4de9811b3d2ce55c847488f231bf4e
Recovered 1 secret in 0.111693s
```

We have just shown how to lower to $2$ the number of necessary shares to reconstruct a secret (instead of $3$). Beyond the fact that the 3-out-of-5 threshold is no longer valid, we still consider the security threat as non-negligible. Ideally, a user should split their seed between $5$ trusted contacts who do not know each other. In practice, it seems more realistic to use $5$ trusted contacts even if some of them know each other.


With this attack, a malicious contact just has to convince (or compromise) only one other trusted contact to fully recover the seed, and to access the funds.


## Breaking the mechanism


The firmware impacted by the previous attack are the following (European IDs are used):

- Firmware 1.47.2401.2, which appears to be the initial firmware ;
- Firmware 1.53.2401.2, on 2019-12-18 .

On 2019-02-19, a third firmware has been issued.

By studying this one, we were very surprised to notice that `sss_update_secure_random_buffer`, the PRNG initialization function, is never called. The PRNG always returns the same value: its entropy buffer, initialized with a fixed value (probably to pass test vectors validation). We believe that the trustlet has been compiled with a test option that should never have been used in production. As a consequence, the key used to encrypt the seed is fixed. Since this key is sent to each contact, any of them can decrypt the seed and access to the funds.


```python
secret_key = b"\x0e\x74\xcd\x69..."
box = nacl.secret.SecretBox(secret_key)
nonce = b"\x00" * 24
encrypted_seed = share1[1 + 32:]
seed = box.decrypt(nonce + encrypted_seed)[:16]
print(mnemonic.Mnemonic('english').to_mnemonic(seed))
```

# Conclusion

## Responsible disclosure

**On 2019.02.15**, we disclosed to HTC Exodus all the above-mentioned flaws.

**Two months later**, other vulnerabilities (memory corruption inside the touchscreen driver, inside the trusted UI and in the ETH/BTC transaction parsing)  were also disclosed. They all had already been found and fixed by HTC Security Team.

**On 2019-03-05**, HTC Exodus team was in Paris and took this opportunity to visit us. They even got the chance to enter the Donjon.

**On 2019.03.25**, HTC issued a new firmware (1.62.2401.7) addressing all these issues. The SSS patch consists in using a robust PRNG and save every generated share inside the secure storage. These shares are used whenever a new trusted contact is added.

**On 2019.04.05**, HTC Exodus started a bounty program for Zion Hardware Wallet.

After these discussions HTC indicated us, this vulnerabilities disclosure triggered the creation of their own bounty program. As we reported the bugs before the creation of the bounty program, we did not receive any bounty, but we got Exodus shirts and stickers when they visited us. :) Thanks a lot!

## Takeaway

We studied the hardware wallet of the HTC Exodus 1 phone, and discovered two critical vulnerabilities on the Social Key Recovery mechanism.
In a scenario where an attacker is able to execute code (Android vulnerability, regular Android app) on the Android phone of any Zion trusted contact, he could steal the funds of the corresponding EXODUS 1 owner.
Alternatively, trusted contacts have a direct access to the seed.
These vulnerabilities have been correctly patched. 

**Nevertheless, we strongly encourage all EXODUS 1 users who have used the Social Key Recovery to change their seed (and migrate their funds). Indeed, their seed could have been compromised earlier or could still be compromised via a trusted contact who wouldn’t update Zion.**
