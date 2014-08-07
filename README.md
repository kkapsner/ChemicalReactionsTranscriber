ChemicalReactionsTranscriber
============================

Parses chemical reactions and outputs various derivated strings (DGL/LaTeX/MATLAB)

Purpose
=======

Chemical reactions are easy to write down if the syntax is simple. To get the derivated differential equations can be annoying and error prone. Also the formating in LaTeX can be a mess.
This tool provides a simple way to specify chemical reactions and to get various useful outputs.

Example
=======

```A + B -> C <[k_on]=[k_off]> D + E
C + E <[k_1]- F```

DGL output:
```dA =  - 1 * A * B
dB =  - 1 * A * B
dC =  + 1 * A * B - k_off * C + k_on * D * E + k_1 * F
dD =  + k_off * C - k_on * D * E
dE =  + k_off * C - k_on * D * E + k_1 * F
dF =  - k_1 * F```

Chemical formula syntax
=======================

chemical = [^0-9<>+][^<>+]*
chemical_instance = [0-9]* chemical
chemical_list = chemical_instance ("+" chemical_instance)*

rate = "[" [^]]* "]"

reaction_arrow = "<" rate? "-" | "-" rate? ">" | "<" rate? "=" rate? ">"

reation = chemical_list (reaction_arrow chemical_list)+

Requirements
============

* For the JS to work my kkjs-framework has to be loaded in the HTML.
* The produced LaTeX needs the chemformula-package and the following macros defined (which can be adjusted):
	** \newcommand{\conc}[1]{\left[\ch{#1}\right]}
	** \newcommand{\rate}[1]{\ch{$k$_{#1}}}
