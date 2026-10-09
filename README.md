# Simple untitled autolang

VSCodium/VSCode extension to set the language of untitled buffers by looking at what you typed or pasted.

Whole thing is a [single JS file](./extension.js) without any dependencies.

## Install

```sh
git clone https://github.com/brkn/simple-untitled-autolang.git
ln -s "$PWD/simple-untitled-autolang" ~/.vscode-oss/extensions/local.simple-untitled-autolang-0.1.0
```

Then reload the window.
VS Code keeps its extensions in `~/.vscode/extensions/` instead.

## Detection

400ms after you stop typing, an untitled plaintext buffer with at least 20 characters is checked for:

- A shebang line: shell, ruby, python, node, elixir.
- Markdown: a heading, a code fence, or at least two list, quote or numbered lines.

Anything else stays plaintext, and the built-in detector still runs.
Once a buffer has a language, it is left alone.

## Motivation

> Why? Shouldn't vscode autodetect itself?

It should, and it does try.
VSCode has a local ML model for untitled buffers (`workbench.editor.languageDetection`, on by default).

But it doesn't pick the language when I paste markdown.
So I kept running `cmd + shift + p` -> Change language mode -> markdown by hand.

This extension covers that gap with a few plain checks and leaves everything else to the built-in detector.

## AI disclaimer

Yes, it's LLM assisted. No, it's not vibed.
