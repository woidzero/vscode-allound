<div align="center">

<img src="https://raw.githubusercontent.com/woidzero/vscode-allound/master/images/logo.png?token=GHSAT0AAAAAACCEJNZKL4GB72R47C75ZDZAZD2A5SQ">

<h1>Allound</h1>

[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/woidzero.vscode-allound.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=woidzero.vscode-allound)
[![GitHub last commit](https://img.shields.io/github/last-commit/woidzero/vscode-allound.svg?style=flat-square&)](https://github.com/woidzero/vscode-allound)
[![License](https://img.shields.io/github/license/woidzero/vscode-allound.svg?style=flat-square)](https://github.com/woidzero/vscode-allound)


A powerful extension for wrapping blocks of code in instructions or statements.

This extensions based on [Surround by Mehmet Yatkı](https://github.com/yatki/vscode-surround) and rewritten for Python (other languages support soon).

</div>

## Features

- Supports **multi** selections
- **Custom** wrapper snippets
- Sorts recently used snippets on top
- Assign **shortcuts** for _each_<br>
  wrapper snippets separately


## How To Use

After selecting the code block, you can

- **right click** on selected code
- OR press (ctrl+shift+T) or (cmd+shift+T)

to get list of commands and pick one of them.

> Hint
>
> Each wrapper has a **separate command** so you can define keybindings for your favorite wrappers by searching `allound.with.commandName` in the 'Keyboard Shortcuts' section.

### List of commands

| Command                                            | Snippet                                                         |
| -------------------------------------------------- | --------------------------------------------------------------- |
| `allound.with` (ctrl+shift+T)                      | List of all the enabled commands below                          |
| `allound.with.if`                                  | if $condition: ...                                              |
| `allound.with.ifElse`                              | if $condition: ... else: $else                                  |
| `allound.with.tryExcept`                           | try: ... except Exception: $exceptBlock                         |
| `allound.with.tryFinally`                          | try: ... finally: $finalBlock                                   |
| `allound.with.tryExceptFinally`                    | try: ... except Exception: $exceptBlock finally: $finalBlock    |
| `allound.with.forIn`                               | for $1 in $2: ...                                               |
| `allound.with.while`                               | while $condition: ...                                           |
| `allound.with.functionDefinition`                  | def $name($params): ..                                          |
| `allound.with.asyncFunctionDefinition`             | async def $name($params): ...                                   |
| `allound.with.blockComment` (doc-string)           | """..."""                                                       |
| `allound.with.comment`                             | # ...                                                           |
| `allound.with.doubleQuotes`                        | "..."                                                           |
| `allound.with.singleQuotes`                        | '...'                                                           |

## Options

- `showOnlyUserDefinedSnippets` (boolean): Disables default snippets that comes with the extension and shows only used defined snippets.
- `showRecentlyUsedFirst` (boolean): Recently used snippets will be displayed on top.

## Configuration

Each wrapper snippet config object is defined as `IAlloundItem` like below:

```ts
interface IAlloundItem {
  label: string; // must be unique
  description?: string;
  detail?: string;
  snippet: string; // must be valid SnippetString
  disabled?: boolean; // default: false
  languageIds?: string[];
}
```

### Editing/Disabling existing wrapper functions

Go to "Settings" and search for "surround.with._commandName_".

Example `surround.with.if`:

```json
{
  "label": "if",
  "description": "if ($condition) { ... }",
  "disabled": false,
  "snippet": "if(${1:condition}) {\n\t$TM_SELECTED_TEXT\n}$0"
}
```

### Adding new custom wrapper functions

Go to "Settings" and search for `allound.custom` and edit it like below.

```js
{
  "allound.custom": {
    // command name must be unique
    "yourCommandName": {
      // label must be unique
      "label": "Your Snippet Label",
      "description": "Your Snippet Description",
      "snippet": "Something { $TM_SELECTED_TEXT$0 }", // <-- snippet goes here.
      "languageIds": ["html", "javascript", "typescript", "markdown"]
    },
    // You can add more ...
  }
}
```

### Defining language-specific snippets

With version [`1.0.0`](https://github.com/woidzero/vscode-allound/releases), you can define snippets based on the document type by using `languageIds` option.

Visit VSCode docs the full list of [language identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers).

#### 1. Enabling a snippet for ALL languages

If you want to allow a snippet to work for all document types, simply **REMOVE** `languageIds` option.

**OR** set it to `["*"]` as below:

```jsonc
{
  "label": "if",
  "description": "if ($condition) { ... }",
  "disabled": false,
  "snippet": "if(${1:condition}) {\n\t$TM_SELECTED_TEXT\n}$0",
  "languageIds": ["*"] // Wildcard allows snippet to work with all languages
}
```

#### 2. Enabling a snippet for ONLY specified languages

If you want to allow a snippet to work with `html`, `typescript` and `javascript` documents, you can use the example below.

```jsonc
{
  "label": "if",
  "description": "if ($condition) { ... }",
  "disabled": false,
  "snippet": "if(${1:condition}) {\n\t$TM_SELECTED_TEXT\n}$0",
  "languageIds": ["html", "typescript", "javascript"]
}
```

#### 3. Disabling a snippet for ONLY specified languages

If you want to allow a snippet to work with **all** document types **EXCEPT** `html`, `typescript` and `javascript` documents,
you can add `-` (MINUS) sign as a prefix to the language identifiers (_without_ a whitespace).

```jsonc
{
  "label": "if",
  "description": "if ($condition) { ... }",
  "disabled": false,
  "snippet": "if(${1:condition}) {\n\t$TM_SELECTED_TEXT\n}$0",
  "languageIds": ["*", "-html", "-typescript", "-javascript"]
}
```

### IMPORTANT NOTES:

1.  All **command names** and **labels** must be unique. If you do not provide a **unique** command name or label, your custom wrapper functions will override existing ones.
1.  You can redefine all snippets as long as you provide a valid `SnippetString`. [Read More](https://code.visualstudio.com/docs/extensionAPI/vscode-api#SnippetString)

## Contribution

As always, I'm open to any contribution and would like to hear your feedback.

PS: [Guide for running @vscode/test-web on WSL 2](https://medium.com/javarevisited/using-wsl-2-with-x-server-linux-on-windows-a372263533c3)

### Just an important reminder:

If you are planning to contribute to **any** open source project,
before starting development, please **always open an issue** and **make a proposal first**.
This will save you from working on features that are eventually going to be rejected for some reason.

## LICENCE

MIT License (c) 2023 woidzero

**Enjoy!**
