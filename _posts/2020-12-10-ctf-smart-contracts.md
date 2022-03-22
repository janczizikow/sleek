---
layout: post
title: "Exploiting Smart Contracts in CTF Challenges"
summary: "Ledger Donjon CTF 2020 - Creating smart contract challenges"
description: "Write-up of creating challenges which involved exploiting vulnerabilities in smart contracts."
featured-img: ctf-eosio
author: The Donjon
categories: [Donjon]
---

# Exploiting Smart Contracts in CTF Challenges

## Introduction

At Ledger, we often hear about blockchains which enable their users to create programs that run "on the blockchain", in a decentralized way.
A very famous example of such a blockchain is Ethereum, which runs programs called "smart contracts" written in the [Solidity programming language](https://en.wikipedia.org/wiki/Solidity) and executed by the Ethereum Virtual Machine.
Other blockchains include [EOSIO](https://eos.io/), [Tezos](https://tezos.com/), [TRON](https://tron.network/), etc.
The smart contracts are the basis of a concept called "Decentralized Applications" (Dapps), which is an essential part of ["Decentralized finance" (DeFi)](https://en.wikipedia.org/wiki/Decentralized_finance).

In practice, a smart contract is a piece of software that is executed by the nodes that craft the blocks of a blockchain.
This raises security concerns, as running untrusted code on systems which directly power a blockchain network is quite hazardous.
This is why the actions that smart contracts can do are very restricted.
For example, Ethereum smart contracts can interact with the blockchain, store data in some kind of decentralized memory, receive input data, receive and send Ethereum assets, etc.
Even with such restricted features, vulnerabilities exist and have been exploited several times in the past.

These vulnerabilities led to the creation of two challenges for the [Ledger Donjon CTF](https://donjon-ctf.io/) that took place a few weeks ago.

## EOSIO Smart Contracts

In the literature, much work focused on Ethereum because it is one of the most used blockchain.
The Ledger Donjon CTF was the opportunity to cast some light on another blockchain which uses more classical technologies than Ethereum.
The EOSIO blockchain was quite appealing for several reasons:

* It uses smart contracts written in C++ instead of a custom language (such as Solidity).
* It runs smart contracts in a WebAssembly Virtual Machine (which is also non-specific).
* It was in a good position of the [ranking of cryptocurrencies by market capitalization](https://coinmarketcap.com/), showing that it was being used.

Moreover instead of paying the execution of the smart contract in "gas" like Ethereum, there exists several tokens named "CPU", "NET" and "RAM", which are used to define quotas on execution time, network usage and memory consumption.
A 4th token named "SYS" is used as a currency to exchange the other tokens.

Last but not least, EOSIO pushed the analogy with a computer enough to be able to define a [BIOS Boot Sequence](https://developers.eos.io/welcome/v2.0/tutorials/bios-boot-sequence) of the blockchain, defining how to bootstrap the tokens using several smart contracts.
If a smart contract is able to create tokens such as CPU, NET and RAM ex-nihilo, how can the resource usage be correctly paid?
In practice, the blockchain never runs in "Boot mode" for long because in the process of booting, some features are enabled to enforce token limits and to forbid the creation of new tokens.
This is similar to a real BIOS, which enables "Flash write lock" in the boot sequence of a computer before the user can do anything.

And of course, like usual computers, there are `root` accounts in EOSIO!
These accounts are called "privileged accounts" and are in limited numbers.
The [documentation of the smart contracts](https://github.com/EOSIO/eosio.contracts/tree/v1.9.1#version--191) lists them.
Among them is `eosio.wrap` which is the equivalent of the `sudo` command in Linux.
Its [documentation](https://developers.eos.io/manuals/eosio.contracts/v1.9/action-reference/eosio.wrap/index) states:

> The eosio.wrap system contract allows block producers to bypass authorization checks or run privileged actions with 15/21 producer approval and thus simplifies block producers superuser actions. It also makes these actions easier to audit.

But `eosio.wrap` is a smart contract that runs on a WebAssembly virtual machine, like other contracts.
If there is a vulnerability in the virtual machine, an attacker could use it to take over the network completely.
For this blockchain, everything is open-source, including this virtual machine.

## Direct memory access in a smart contract virtual machine

A WebAssembly program can mainly perform some operations on its own memory and call external function that behave like "system calls".
For EOSIO, the external functions which can be called are implemented in C++, in <https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/wasm_interface.cpp>.
This file is quite large and contains so much templates that its compilation takes 3 GB of RAM and lasts a bit less than a minute on a quite recent laptop.
This is a good indicator of its complexity.

In this file, some functions are related to computing hash functions, other are the "privileged one" that can only be called by privileged contracts (in `class privileged_api`)... and there are some very surprising functions:

```c++
class memory_api : public context_aware_api {
   public:
      memory_api( apply_context& ctx )
      :context_aware_api(ctx,true){}

      char* memcpy( array_ptr<char> dest, array_ptr<const char> src, uint32_t length) {
         EOS_ASSERT((size_t)(std::abs((ptrdiff_t)dest.value - (ptrdiff_t)src.value)) >= length,
               overlapping_memory_error, "memcpy can only accept non-aliasing pointers");
         return (char *)::memcpy(dest, src, length);
      }

      char* memmove( array_ptr<char> dest, array_ptr<const char> src, uint32_t length) {
         return (char *)::memmove(dest, src, length);
      }

      int memcmp( array_ptr<const char> dest, array_ptr<const char> src, uint32_t length) {
         int ret = ::memcmp(dest, src, length);
         if(ret < 0)
            return -1;
         if(ret > 0)
            return 1;
         return 0;
      }

      char* memset( array_ptr<char> dest, int value, uint32_t length ) {
         return (char *)::memset( dest, value, length );
      }
};
```

This looks very dangerous: these functions seem to allow direct access to the memory of the node executing the smart contract, outside of the memory dedicated to the WebAssembly virtual machine.
And they are not behind the "privileged flag".
If these function can really be used, it means that anyone can modify what they want in the memory of the nodes powering the EOSIO blockchain.
This usually means obtaining remote code execution on these systems, which is widely considered as a very serious vulnerability.

But when trying to trigger the vulnerability (on a local EOSIO node) by directly accessing memory out of the bounds of the WebAssembly virtual machine, this does not work. The node throws an error:

```text
Error 3070002: Runtime Error Processing WASM
Error Details:
access violation
```

This means that some mechanisms are implemented to ensure the isolation of the virtual machine.
Where are they implemented?
In C++ templates!
More precisely some wrappers are written in <https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/webassembly/eos-vm.hpp#L61-L77> such as:

```c++
      // memcpy/memmove
      auto from_wasm(void* ptr, eosio::chain::array_ptr<const char> /*src*/, uint32_t size) {
         validate_ptr<char>(ptr, size);
         return eosio::chain::array_ptr<char>((char*)ptr);
      }
      // memset
      auto from_wasm(void* ptr, int /*val*/, uint32_t size) {
         validate_ptr<char>(ptr, size);
         return eosio::chain::array_ptr<char>((char*)ptr);
      }
```

These wrappers dynamically match (at compile time) the parameters of function calls with the prototypes of `memcpy`, `memmove`, `memset`... in order to implement bound checks.
More precisely:

* At the end of [`wasm_interface.cpp`](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/wasm_interface.cpp#L2011-L2016) there is an invocation of a macro named `REGISTER_INTRINSICS`, which provides the functions `memcpy`, `memmove`, `memcmp` and `memset` to WebAssembly smart contracts.
* This macro is defined in [`wasm_interface_private.hpp`](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/wasm_interface_private.hpp#L259) as:

```c++
#define REGISTER_INTRINSICS(CLS, MEMBERS) \
    BOOST_PP_SEQ_FOR_EACH(_REGISTER_INTRINSIC, CLS, _WRAPPED_SEQ(MEMBERS))
```

* This involves many other complex macros such as [`_REGISTER_EOS_VM_INTRINSIC`](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/webassembly/eos-vm.hpp#L143) and [`_REGISTER_WABT_INTRINSIC`](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/webassembly/wabt.hpp#L739) which transform the code into C++ template invocations.
* The C++ templates use functions defined as [`wasm_type_converter<type>::from_wasm`](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/webassembly/eos-vm.hpp#L15-L110) to convert integer values into pointers and sizes, checking the bounds while doing so.

This is very complex, and this explanation only covers a small part of the interface between WebAssembly and the native environment.
For example, it does not explain why the parameter `src` is commented in [the function matching the `memcpy` and `memmove` pattern](https://github.com/EOSIO/eos/blob/v2.0.6/libraries/chain/include/eosio/chain/webassembly/eos-vm.hpp#L68).
Finding why the implementation is still secure while apparently not explicitly checking the `src` parameter is left as an exercise for readers.

## From fragile constructions to a CTF challenge

So the code that seemed vulnerable in EOSIO's virtual machine implementation is not vulnerable, after all.

But this construction is fragile: what happens if a function gets added to the API, which dereferences some memory but get their order of parameters in such a way that the C++ templates fail to correctly validate the bounds?
This sounded like a good candidate to build a challenge for the Ledger Donjon CTF, so this is precisely what was done: such a function was added to the WebAssembly interface.

```c++
      // Implement the same CRC as binascii.crc32 in Python
      uint32_t crc32(array_ptr<char> data, uint32_t value, uint32_t datalen) {
         value = ~value;
         for (int i = 0; i < datalen; i++) {
            value ^= data[i];
            for (unsigned int bitpos = 0; bitpos < 8; bitpos ++) {
               value = (value >> 1) ^ (0xEDB88320 & -(value & 1));
            }
         }
         return ~value;
      }
```

During the build process, the C++ templates produce code that ensures that `[data, data+value]` fits into the memory allocated to the WebAssembly virtual machine, instead of `[data, data+datalen]`.
So this function introduces a vulnerability which could be used to read memory past the end of a buffer.
What lies beyond the memory of a smart contract?
The answer is quite surprising.
Usually it is one of two options:

* either the memory is dynamically allocated and this vulnerability enables reading parts of the heap of the program,
* or the memory is statically allocated and this vulnerability enables reading parts of the `.data` or `.bss` segments.

But with EOSIO there is a third option: the memory is dynamically allocated when the first smart contract is launched, and then the memory is resized but kept for other smart contracts.
This is due to the addition of the keyword `static` in a [change documented as "Make wabt's linear memory shared across all instances"](https://github.com/EOSIO/wabt/commit/0b8958a6f3c7d3740f608427b35c874f492326df). This is actually the first change between the [upstream WebAssembly Binary Toolkit project](https://github.com/WebAssembly/wabt) and EOSIO's fork, as shown by [the Git history right after the fork](https://github.com/EOSIO/wabt/commits/67381cbe17e0ef87d40f3376e99aea7fff0fa0b1).

Therefore the vulnerability which was added to EOSIO's virtual machine interface in order to create a CTF challenge enabled attackers to read some memory which was previously used by another smart contract (and then some memory from the heap).
But usually the content of the memory of a smart contract is not secret: anybody can run any smart contract and observe its memory, and leaking the content of the heap is not enough to make a successful CTF challenge.
Here, some design decisions were made in order to choose what the challenge would actually consist in.
In the end, another function was added, which wrote some secret string (the flag that the participants had to find) in memory:

```c++
      uint32_t get_secret_flag( array_ptr<char> dest, uint32_t length ) {
         const char *flag = getenv("FLAG");
         if (!flag) {
            flag = "No flag provided";
         }
         if ((size_t)length >= strlen(flag)) {
            length = (uint32_t)strlen(flag);
         }
         ::memcpy(dest, flag, length);
         return length;
      }
```

By putting this function in the privileged API, no contract was able to call it but privileged ones.
The challenge included a privileged contract which copied the secret string right after the WebAssembly page boundary, in order to go easy with the participants, with this C++ code:

```c++
      // Expand the allocated memory to be able to put the secret at 0x10000
      check(__builtin_wasm_grow_memory(1) == 1, "Unexpected memory size");

      char *flag = (char *)0x10000;
      size_t flag_size = get_secret_flag(flag, 0x10000);
      auto computed_hash = eosio::sha256(flag, flag_size).extract_as_byte_array();
      // ...
```

## Conclusion

When testing the challenge, it appeared that interacting with an EOSIO node was harder than expected, and finding the privileged smart contract was not intuitive at all.
So another "easy" challenge was added to the CTF in order to make the participants find this contract and reverse it.
This was achieved by putting another flag more or less directly in the WebAssembly code of the smart contract.

The objectives of this challenge were completely met: 13 participants solved "Easy Modern Cryptocomputer" and only 3 solved "Hard Modern Cryptocomputer", including CryptoHackers who wrote a nice write-up: <https://blog.cryptohack.org/hacking-eos-ledger-donjon-ctf-writeup>.

The source code of this challenge is available on <https://github.com/Ledger-Donjon/ledger-donjon-ctf-2020/tree/master/modern_cryptocomputer>.
