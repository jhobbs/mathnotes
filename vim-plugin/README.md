# Math Block Completion for Vim

Autocomplete references to theorems, definitions, and other math blocks in your mathnotes.

## Features

- Tab completion for `@references` in markdown files
- Shows block type, title, and preview
- Supports typed references like `@theorem:ftc`
- Automatic triggering when you type `@`
- Cached index for fast completion

## Installation

### 1. Build the Index

First, generate the math block index:

```bash
cd /path/to/mathnotes
python3 scripts/build-mathblock-index.py
```

This creates `.mathblock-index.json` in your project root.

### 2. Install the Vim Plugin

Add to your `.vimrc`:

```vim
" Source the math block completion plugin
source ~/mathnotes/vim-plugin/mathblock-complete.vim
```

Or if using vim-plug:

```vim
Plug '~/mathnotes/vim-plugin', { 'rtp': '.', 'for': 'markdown' }
```

## Usage

### Basic Completion

1. Type `@` in a markdown file
2. Press `<C-x><C-u>` to trigger completion (Ctrl+X followed by Ctrl+U)

### Search Modes

- **Label search (default)**: `@cauchy` - matches labels starting with "cauchy"
- **Content search**: `@/compact` - searches in labels, titles, and preview text for "compact"
- **Typed search**: `@theorem:` - shows only theorems
- **Combined**: `@theorem:/metric` - searches for "metric" in theorem content

### Commands

- `:MathBlockRebuildIndex` - Rebuild the index from within Vim
- `:MathBlockInfo` - Show info about reference under cursor

### Key Mappings

Navigate the completion menu with:
- `<C-n>` / `<C-p>` - Next/previous item
- `<C-y>` - Accept completion
- `<C-e>` - Cancel completion

## Updating the Index

Run the build script whenever you add new math blocks:

```bash
python3 scripts/build-mathblock-index.py
```

Or from within Vim:
```vim
:MathBlockRebuildIndex
```

## Configuration

```vim
" Change index file location (default: .vim-mathblocks/mathblock-index.json)
let g:mathblock_index_file = '.vim-mathblocks/mathblock-index.json'
```

## Troubleshooting

1. **No completions appearing**: Check that the index file exists:
   ```bash
   ls -la .vim-mathblocks/mathblock-index.json
   ```

2. **Completions not updating**: Rebuild the index:
   ```vim
   :MathBlockRebuildIndex
   ```

3. **Check current reference**: Place cursor on a reference and run:
   ```vim
   :MathBlockInfo
   ```