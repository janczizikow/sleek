---
layout: post
title: "Ghostbuster: Spectre exploitation in real life"
summary: "Ledger Donjon CTF 2020 - Ghostbuster write-up"
description: "Write-up for the unsolved Ghostbuster challenge."
featured-img: ghostbuster
author: The Donjon
categories: [Donjon]
---

# Ghostbuster: Spectre exploitation in real life

## Introduction

After doing some research on [Transient execution CPU vulnerabilities](https://en.wikipedia.org/wiki/Transient_execution_CPU_vulnerability) against Intel SGX enclaves, we wondered if these vulnerabilities were practical in real life, with fully patched operating systems and default mitigations. We took this opportunity to design a challenge ingeniously called *Ghostbuster* for the [Ledger Donjon CTF](https://donjon-ctf.io/), which targets the [Spectre vulnerability](https://en.wikipedia.org/wiki/Spectre_(security_vulnerability)) in a cross-process scenario.

In order to make it more handy, the source code and the whole architecture are given to the participants, allowing them to deploy the very same version of the challenge locally.



## Challenge description

### Environment discovery

The challenge is accessible remotely through SSH:

![ssh](/assets/ghostbuster/ghostbuster-ssh.png)

The OpenSSH server is configured to execute the script `ssh-isolation.py`, which gives a shell with a different uid for each connection in order to prevent different users from messing with each other. As mentioned in the challenge description, the target program runs inside another container on the same machine. This is confirmed by `./challenge.sh` which makes a TCP connection to the host `ghostbuster`. The `CMD` instruction from the `Dockerfile` shows that the target program `ghostbuster`:

- is launched by `socat` which listens on TCP port 8888
- is bound to the CPU \#1 with `taskset`
- runs with [ASLR](https://en.wikipedia.org/wiki/Address_space_layout_randomization) disabled

Moreover, the `docker-compose.yml` file shows that containers:

- are launched with `--security-opt seccomp=unconfined` which turns off `seccomp` confinement
- share the same network
- share the same image

### Target program analysis

The target program receives a string and compares it against a secret unknown to the attacker. It is small enough to guarantee that there is no vulnerability such as memory corruptions. The function `check_secret` responsible of the secret verification is the following one:

```c
#define SECRET_SIZE	32

__attribute__((aligned(4096))) uint8_t (*_xor)(uint8_t, uint8_t);
__attribute__((aligned(4096))) uint8_t (*_or)(uint8_t, uint8_t);

bool check_secret(uint8_t *p, size_t size)
{
  uint8_t secret[SECRET_SIZE+1];
  size_t indexes[SECRET_SIZE];

  if (size != SECRET_SIZE) {
    return false;
  }

  /* randomize access to secret to prevent template attacks */
  for (size_t i = 0; i < size; i++) {
    indexes[i] = i;
  }
  shuffle(indexes, size);

  read_secret(secret, size+1);

  uint8_t ret = 0;
  for (size_t i = 0; i < size; i++) {
    size_t index = indexes[i];
    uint8_t tmp;

    tmp = _xor(secret[index], p[index]);
    ret = _or(ret, tmp);
  }

  return ret == 0;
}
```

While the comparison isn't vulnerable to timing attacks, it should be noted that the `_xor` and `_or` function pointers are provided by the binary `ghostbuster` linked to this library `libcheck.so`.

### What makes this configuration vulnerable

The `docker-compose.yml` file and `docker images` command show that both containers run inside the same image:

```
$ docker images | grep 'ghostbuster\|IMAGE'
REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
ghostbuster_ghostbuster       latest              954164749ca2        6 days ago          405MB
ghostbuster_ghostbuster_ssh   latest              954164749ca2        6 days ago          405MB
```

While the mount namespaces of these 2 containers are different, the root filesystem of these 2 containers is shared thanks to the overlay filesystem configuration.  This can be confirmed by looking at the inode of the libc file mapped in processes from each containers:

```
root@localhost:/# lsof -p $(pidof socat) -p $(pidof sshd) 2>/dev/null | grep 'libc-\|COMMAND'
COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF     NODE NAME
socat   7899     1000  mem    REG    9,3           5768257 /lib/x86_64-linux-gnu/libc-2.27.so (path inode=22546439)
sshd    7918     root  mem    REG    9,3           5768257 /lib/x86_64-linux-gnu/libc-2.27.so (path inode=22546439)
```

Files from the docker images are thus shared across containers and opened *copy-on-write* by the kernel. Since `seccomp` is explicitly disabled in `docker-compose.yml`, Linux Kernel [mitigations](https://www.kernel.org/doc/html/latest/admin-guide/hw-vuln/spectre.html#a-user-process-attacking-another-user-process) against Spectre vulnerabilities aren't enabled.

All these conditions make the target program vulnerable to Spectre v2 attacks.



## Spectre v2 (aka Spectre-BTB) attack

The [transient.fail](https://transient.fail/) website is a must read to understand the differences between Meltdown and Spectre vulnerabilities. It also classifies and gives a detailed description of public variants. Here is an excerpt of Spectre-BTB:

> the attacker poisons the Branch Target Buffer (BTB) to steer the transient execution to a mispredicted branch target. [...] For indirect branches, CPUs use different mechanisms, which may take into account global branching history accumulated in the BHB when indexing the BTB. We refer to both types as Spectre-BTB.
> Spectre-BTB enables redirection of transient control flow to an arbitrary destination. Adopting established techniques from return-oriented programming (ROP) attacks, but abusing BTB poisoning instead of application-level vulnerabilities, selected code “gadgets” found in the victim address space may be chained together to construct arbitrary transient instruction sequences. [...] ROP-style gadget abuse in Spectre-BTB enables more direct construction of covert channels that expose secrets from the transient domain.

It's worth mentioning that this attack can be exploited cross-address-space:

> an attacker can mirror the virtual address space layout of the victim on a hyperthread (same physical core) and mistrain at the exact same virtual address as the victim branch. [...] Cross-address-space attacks are possible because the BTB is shared between hyperthreads on the same logical core.

Additionally, the presentation [Two methods for exploiting speculative control flow hijacks](https://www.usenix.org/conference/woot19/presentation/mambretti) from Andrea Mambretti demonstrates through PoCs how to achieve successful attacks against Spectre v2 vulnerabilities. This methodology can be applied to this challenge as well.

Back to the challenge, here is the disassembly of the 2 calls to `_xor` and `_or` in `libcheck.so`:

```
$ objdump -M intel -D ghostbuster/libcheck.so | grep '41 ff' -B 3
 a8f:	41 0f b6 34 04       	movzx  esi,BYTE PTR [r12+rax*1]
 a94:	0f b6 bc 04 00 01 00 	movzx  edi,BYTE PTR [rsp+rax*1+0x100]
 a9b:	00
 a9c:	41 ff 16             	call   QWORD PTR [r14]                 ; uint8_t tmp = _xor(secret[index], p[index]);
 a9f:	40 0f b6 fd          	movzx  edi,bpl
 aa3:	0f b6 f0             	movzx  esi,al
 aa6:	41 ff 55 00          	call   QWORD PTR [r13+0x0]             ; ret = _or(ret, tmp);
```

The goal is to:

1. Find a gadget allowing to leak the return value of the `_xor` call (or the first parameter, `secret[index]`) thanks to a side channel.
2. Successfully train the BTB to make the victim process call speculatively this gadget.

There are several important details here:

- Since ASLR is disabled, everything is reproducible and no address needed to be guessed.
- The `_xor` and `_or` function addresses might be evinced from the cache by the attacker before the first loop iteration since `libcheck.so` can be opened in another process.
- The index might look random because `shuffle()` randomizes access to the `secret` array. However, the seed is the target process `pid`, which is known by the attacker.

Gadgets can be searched in any shared library used by the target program such as the  `libc`, which is mapped at a fixed address because there is no ASLR. Gadgets leaking a secret byte thanks to a side channel look like: `x = data[c * offset]` where:

- `c` is the secret byte
- `data` is in the `libc`
- `data` isn't cached
- `offset` is large enough (at least 512 bytes) to prevent surrounding data to be read as well.



## Finding a gadget

While the author of this challenge found a gadget manually, the CTF participant [Adrien Guinet](https://twitter.com/adriengnt) developed a tool to search for gadgets automatically. In his own words, here is how it applies for Ghostbuster and how it can be reused in other contexts.

Data can be fetched from a controlled pointer in memory in multiple
ways:

* a classical memory load through the `mov` instruction
* an x86 operation that takes memory operands (e.g. `add rax, [rbx]`)
* an indirect jump or call (e.g. `jmp rax`)

As said previously, we need `offset` to be large enough so that distinguishing using
cache timings can be efficient. There are two indirect calls we can attack, and
the registers we control are different in each case:

* for the `_xor` call, `rdi` contains the secret
* for the `_or` call, `rsi` and `rax` contains the return value of `_xor`

Moreover, `libc` being compiled as a Position Independent Executable (PIE),
lots of data referenced within its code is through a relative offset to the
`RIP` register.  So we need to find a gadget that dereferences memory regarding
one of these registers.

One perfect gadget would be, for instance, `lea rax, rip + OFFSET ; shl rdi, 9;
movzx rax, byte ptr [rax+rdi]`. In C, that would look like `uint8_t v =
static_data[x*512]`, with `static_data` a global array of bytes (for instance).
Unfortunately, this is a piece of code that has been very hard to find in the
`libc`.

Let's look at indirect jumps and calls. They can be present for instance in
jump tables. Code usually looks like this:

```
lea     r9, [rip+JPT_OFFSET]
mov     ecx, eax
movsxd  rcx, DWORD PTR [r9+rcx*4]
add     rcx, r9
jmp     rcx
```

In this assembly snippet, the jump table destination depends on the value of
`eax`. Each entry at `JPT_OFFSET` is 4 bytes wide. What we can look for is
this pattern, where the table at `JPT_OFFSET` has properties that suit us,
that is values that have between them a difference larger than e.g. 512 for the
whole printable ASCII set.

Here is the algorithm we used to automatically find such gadget:

* disassemble the whole `libc`, and save the position of every indirect call and jump
* move back to `N` instructions before, and symbolically execute these instructions, taking into account the registers we control. `N` can be *bruteforced* between e.g. 3 and 10.
* verify that the destination of the call/jmp is based on our controlled input,
  and that this input is used through a lookup table
* extract that lookup table and verifies that it has the properties we aim at

This has been implemented in the scripts [here](https://github.com/aguinet/donjonctf_ghostbuster_gadget). Disassembling the `libc` is
done thanks to [LIEF](https://lief.quarkslab.com/) and [LLVM's disassembler C
API](https://llvm.org/doxygen/group__LLVMCDisassembler.html) (called using
[DragonFFI](https://github.com/aguinet/dragonffi)). This choice has been done
to get reasonable disassembling performances for the whole `libc`. At this
stage, we look naïvely for `call` and `jmp` x86 instructions done on registers.
Symbolic execution is then performed using
[Miasm](https://github.com/cea-sec/miasm/)'s symbolic execution engine. For
every indirect call/jmp that we are interested in, it then allows us to extract
the lookup table and check if that's a valid gadget.

For `N=5`, the overall script takes ~20s on a Core(TM) i7-7700HQ (12s being
used to disassemble [^1]), and returns this:

```
[x] Disassembling...
[x] Found 968 indirect calls/jmps. Looking for valid gadgets...
[+] Gadget at 0x313a2, table with 1 elts, table address = 0x001A96EC, element size = 4, valid characters: ' '
[+] Gadget at 0x6b5c1, table with 3 elts, table address = 0x001AE19C, element size = 4, valid characters: 'be}'
[+] Gadget at 0x6bab4, table with 1 elts, table address = 0x001AE3A8, element size = 4, valid characters: 'J'
[+] Gadget at 0x7383b, table with 2 elts, table address = 0x001AE5A8, element size = 4, valid characters: 'em'
[+] Gadget at 0x73af5, table with 5 elts, table address = 0x001AE664, element size = 4, valid characters: '>Tdil'
[+] Gadget at 0x73d94, table with 3 elts, table address = 0x001AE7B4, element size = 4, valid characters: 'J_b'
[+] Gadget at 0x7c76f, table with 2 elts, table address = 0x001AE9C0, element size = 4, valid characters: 'A{'
[+] Gadget at 0x7d604, table with 2 elts, table address = 0x001AF1DC, element size = 4, valid characters: 'ks'
[+] Gadget at 0x9ac5d, table with 62 elts, table address = 0x001AF340, element size = 4, valid characters: '9:;<=>?@ABCDEFIJKLMNOPQRSTUVYZ[\]^_`abcdefijklmnopqrstuxyz{|}~'
[+] Gadget at 0xa84c4, table with 88 elts, table address = 0x001AF3B4, element size = 4, valid characters: ' !"#$%&'()*,-./0123456789<=>?@ABCDEFGHILMNOPQRSTUVWXY[\]^_`abcdefghijklmnopqrstuvwxz{|}~'
[+] Gadget at 0xa8669, table with 90 elts, table address = 0x001AF3FC, element size = 4, valid characters: ' !"#$%&'(*+,-./01234567:;<=>?@ABCDEFGIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}'
[+] Gadget at 0xbba70, table with 3 elts, table address = 0x001AFB80, element size = 4, valid characters: '=OU'
[+] Gadget at 0xd7892, table with 2 elts, table address = 0x001B0120, element size = 4, valid characters: 'no'
[+] Gadget at 0xd7d42, table with 5 elts, table address = 0x001B0200, element size = 4, valid characters: ' 56y~'
[+] Gadget at 0xdc509, table with 3 elts, table address = 0x001B06B4, element size = 4, valid characters: 'PZs'
[+] Gadget at 0xe6f01, table with 1 elts, table address = 0x001B0CD0, element size = 4, valid characters: 'q'
[+] Gadget at 0xe9c36, table with 1 elts, table address = 0x001B0D24, element size = 4, valid characters: '\'
[+] Gadget at 0xea237, table with 1 elts, table address = 0x001B0DA4, element size = 4, valid characters: '<'
[+] Gadget at 0x1560ed, table with 1 elts, table address = 0x001B3944, element size = 4, valid characters: ' '
[+] Gadget at 0x196d42, table with 14 elts, table address = 0x001BDF20, element size = 4, valid characters: '-.79;AC^dvxz|~'
```

Both gadgets at `0xa84c4` and `0xa8669` seems promising, as they cover a large
subset on the ASCII printable set. Let's start with `0xa84c4`, as it covers all
the digits, which have chances to be present in the final flag. The code of this gadget is:

```
lea     r9,[rip+0x106ee9]
mov     ecx,eax	      
movsxd  rcx,DWORD PTR [r9+rcx*4]
add     rcx,r9
jmp     rcx
```

The "input" is the `eax` register, so we need to target the `_or` call.

As a final note, if in the end we still miss some characters of the flag (for
instance `Z`), we can do another round with another gadget (e.g. `0xa8669`).

One last interesting thing to note is that this script can adapt to any `libc`
binary. Running on the `libc` Debian version 2.31-4, it returns (for `N=5`):

```
[x] Disassembling...
[x] Found 938 indirect calls/jmps. Looking for valid gadgets...
[+] Gadget at 0x5849d, table with 1 elts, table address = 0x00183180, element size = 4, valid characters: 'X'
[+] Gadget at 0x58571, table with 2 elts, table address = 0x001831E8, element size = 4, valid characters: '>g'
[+] Gadget at 0x58f43, table with 6 elts, table address = 0x001836F4, element size = 4, valid characters: '/]bez}'
[+] Gadget at 0x592c6, table with 4 elts, table address = 0x00183900, element size = 4, valid characters: ',Jbz'
[+] Gadget at 0x60ba3, table with 2 elts, table address = 0x00183D0C, element size = 4, valid characters: 'Jb'
[+] Gadget at 0x60f1d, table with 5 elts, table address = 0x00183DBC, element size = 4, valid characters: '.6wz{'
[+] Gadget at 0x6a9c4, table with 3 elts, table address = 0x00184140, element size = 4, valid characters: 'Gcj'
[+] Gadget at 0x6ab09, table with 2 elts, table address = 0x001841C0, element size = 4, valid characters: 'CJ'
[+] Gadget at 0x70cbb, table with 4 elts, table address = 0x001845C0, element size = 4, valid characters: '59CJ'
[+] Gadget at 0x70eeb, table with 2 elts, table address = 0x00184540, element size = 4, valid characters: 'cj'
[+] Gadget at 0x71e2d, table with 4 elts, table address = 0x00184640, element size = 4, valid characters: '#&*5'
[+] Gadget at 0x8b8b5, table with 77 elts, table address = 0x00184C9C, element size = 4, valid characters: '*+,-./01234567:;<=>?@ABCDEFGJKLMNOPQRSTUVWZ[\]^_`abcdefgijklmnopqrstuvwxyz{|}'
[+] Gadget at 0x945c9, table with 88 elts, table address = 0x00184CD4, element size = 4, valid characters: ' !"#$%&'()*,-./0123456789<=>?@ABCDEFGHILMNOPQRSTUVWXY[\]^_`abcdefghijklmnopqrstuvwxz{|}~'
[+] Gadget at 0x94749, table with 90 elts, table address = 0x00184D1C, element size = 4, valid characters: ' !"#$%&'(*+,-./01234567:;<=>?@ABCDEFGIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}'
[+] Gadget at 0xa7b82, table with 4 elts, table address = 0x001854A0, element size = 4, valid characters: ']cou'
[+] Gadget at 0xbdf99, table with 2 elts, table address = 0x00185964, element size = 4, valid characters: '<k'
[+] Gadget at 0xbf04a, table with 6 elts, table address = 0x00185B9C, element size = 4, valid characters: ' !chr|'
[+] Gadget at 0xcd3c1, table with 1 elts, table address = 0x001869F0, element size = 4, valid characters: '>'
[+] Gadget at 0xd003e, table with 1 elts, table address = 0x00186A44, element size = 4, valid characters: ')'
[+] Gadget at 0xd0519, table with 1 elts, table address = 0x00186AC4, element size = 4, valid characters: 'e'
[+] Gadget at 0xd1ba7, table with 1 elts, table address = 0x00186BB4, element size = 4, valid characters: ')'
[+] Gadget at 0xe3a21, table with 5 elts, table address = 0x001875B8, element size = 4, valid characters: '0>BZ['
[+] Gadget at 0x12a74c, table with 1 elts, table address = 0x001899A4, element size = 4, valid characters: ' '
[+] Gadget at 0x16bfc0, table with 5 elts, table address = 0x00193EB0, element size = 4, valid characters: '+-/IK'
```

It seems to find again good enough gadgets! :)

## Final attack

Here are the steps of the final attack:

1. Connect to the target process through the network and read the line `[{pid}] please enter your secret: ` to by synchronized. `check_secret()` is called just after the return of `read()`.
2. Evict from the cache (with `clflush`) all the functions of the jump table referenced by the gadget.
3. Train the BTB in a background loop on one of the hyperthread of the CPU \#1.
4. Send a string to the target process through the network. If the BTB is trained correctly, one of the functions of the jump table is executed speculatively. Since `ghostbuster` is bound to the CPU \#1, the train function from the attacker and the `check_secret` function are executed in parallel.
5. Measure timing access to the jump table functions tells the value of one byte of the secret.

While the exploit described here uses an almost perfect gadget, the xor operation allows less specific gadgets to be used. Indeed, the attacker can bruteforce bytes of the secret one by one.

<p>Here is a recording of the exploit, which shows that the secret can be recovered in a few seconds:</p>
<script src="https://asciinema.org/a/naE4igs1qZ7gWUCGaXfPMCRQT.js" id="asciicast-naE4igs1qZ7gWUCGaXfPMCRQT" async></script>

The source code of the exploit can also be found [here](https://github.com/Ledger-Donjon/ledger-donjon-ctf-2020/tree/master/ghostbuster).



## Conclusion

Unfortunately, the challenge wasn't solved by the end of the CTF. Transient execution CPU vulnerabilities being quite new and the lack of reproducible and working PoCs made it definitely hard. Exploit development against these vulnerabilities is tedious and time consuming because there is no way to debug the CPU, and some details remain mysterious. For instance, the BTB is theoretically shared between hyperthreads on the same logical core but the attack only succeeds when the training function is executed on the same logical core as the target process.

Disabling ASLR and pinning the target program to the CPU makes the vulnerability a bit easier to exploit. However, containers are fully protected against Spectre v2 thanks to the Linux kernel mitigations, because `seccomp` is enabled by default by Docker.

Finally, careful participants noticed that the server was vulnerable to RIDL. The challenge may have been solved using an attack against RIDL (especially because TSX can't be disabled on Intel Xeon E3-1270 v6) but we haven't looked if it was possible practically.

[^1]: chances are that, with some work, this disassembling time can be divided by ~20, as it only takes `llvm-objdump` ~500ms to disassemble the whole `libc`, on the same CPU.
