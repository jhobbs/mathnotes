" Math Block Completion Plugin for Mathnotes
" Provides autocompletion for @references to math blocks

if exists('g:loaded_mathblock_complete')
    finish
endif
let g:loaded_mathblock_complete = 1

" Configuration
let g:mathblock_index_file = get(g:, 'mathblock_index_file', '.vim-mathblocks/mathblock-index.json')

" Cache for the index
let s:mathblock_cache = {}
let s:mathblock_cache_time = 0

" Function to load the index
function! s:LoadMathBlockIndex()
    " Find the index file by searching up from current file
    let l:dir = expand('%:p:h')
    let l:index_path = ''
    
    while l:dir != '/' && l:dir != ''
        let l:test_path = l:dir . '/' . g:mathblock_index_file
        if filereadable(l:test_path)
            let l:index_path = l:test_path
            break
        endif
        let l:dir = fnamemodify(l:dir, ':h')
    endwhile
    
    if empty(l:index_path)
        return []
    endif
    
    " Check if cache is still valid
    let l:mtime = getftime(l:index_path)
    if l:mtime > 0 && l:mtime == s:mathblock_cache_time && has_key(s:mathblock_cache, l:index_path)
        return s:mathblock_cache[l:index_path]
    endif
    
    " Load and parse the JSON
    try
        let l:json_content = join(readfile(l:index_path), '')
        let l:data = json_decode(l:json_content)
        let s:mathblock_cache[l:index_path] = l:data.blocks
        let s:mathblock_cache_time = l:mtime
        return l:data.blocks
    catch
        echom "Error loading math block index: " . v:exception
        return []
    endtry
endfunction

" Completion function
function! MathBlockComplete(findstart, base)
    if a:findstart
        " Find the start of the reference
        let l:line = getline('.')
        let l:start = col('.') - 1
        
        " Look backwards for @ or @type: or @/ (including slash for search)
        while l:start > 0 && l:line[l:start - 1] =~ '[a-zA-Z0-9_:@/\-]'
            let l:start -= 1
        endwhile
        
        " Check if we're in a reference context
        if l:start >= 0 && l:line[l:start] == '@'
            return l:start
        endif
        
        return -3  " Cancel completion
    else
        " Build completion list
        let l:blocks = s:LoadMathBlockIndex()
        if empty(l:blocks)
            return []
        endif
        
        let l:results = []
        
        " Parse the base to see if it includes type
        let l:has_at = a:base[0] == '@'
        let l:search_base = l:has_at ? a:base[1:] : a:base
        
        " Check if user is typing a typed reference like @theorem:
        let l:type_prefix = ''
        if match(l:search_base, ':') >= 0
            let l:parts = split(l:search_base, ':', 1)
            let l:type_prefix = l:parts[0]
            let l:search_base = len(l:parts) > 1 ? l:parts[1] : ''
        endif
        
        for l:block in l:blocks
            " Filter by type if specified
            if !empty(l:type_prefix) && l:block.type != l:type_prefix
                continue
            endif
            
            " Filter by label or content match
            if !empty(l:search_base)
                " Check if search_base starts with / for content search
                if l:search_base[0] == '/'
                    " Content search mode - search in preview and title
                    let l:search_term = l:search_base[1:]
                    if !empty(l:search_term)
                        let l:found = 0
                        " Search in label
                        if stridx(tolower(l:block.label), tolower(l:search_term)) >= 0
                            let l:found = 1
                        endif
                        " Search in title
                        if !l:found && !empty(l:block.title) && stridx(tolower(l:block.title), tolower(l:search_term)) >= 0
                            let l:found = 1
                        endif
                        " Search in preview
                        if !l:found && !empty(l:block.preview) && stridx(tolower(l:block.preview), tolower(l:search_term)) >= 0
                            let l:found = 1
                        endif
                        if !l:found
                            continue
                        endif
                    endif
                else
                    " Normal mode - match label from beginning
                    if stridx(l:block.label, l:search_base) != 0
                        continue
                    endif
                endif
            endif
            
            " Build the completion item
            let l:word = l:has_at ? '' : '@'
            if !empty(l:type_prefix)
                let l:word .= l:type_prefix . ':' . l:block.label
            else
                let l:word .= l:block.label
            endif
            
            " Build menu text
            let l:menu = '[' . l:block.type . ']'
            if !empty(l:block.title)
                let l:menu .= ' ' . l:block.title
            endif
            
            " Build preview/info
            let l:info = l:block.type . ' ' . l:block.label
            if !empty(l:block.title)
                let l:info .= "\n" . l:block.title
            endif
            if !empty(l:block.preview)
                let l:info .= "\n\n" . l:block.preview
            endif
            let l:info .= "\n\nFile: " . l:block.file
            
            call add(l:results, {
                \ 'word': l:word,
                \ 'abbr': l:block.label,
                \ 'menu': l:menu,
                \ 'info': l:info,
                \ 'kind': 'r',
                \ 'dup': 1
                \ })
        endfor
        
        return l:results
    endif
endfunction

" Set up completion
augroup MathBlockComplete
    autocmd!
    autocmd FileType markdown setlocal completefunc=MathBlockComplete
    " Also set omnifunc as a backup
    autocmd FileType markdown setlocal omnifunc=MathBlockComplete
augroup END


" Command to manually rebuild index
command! MathBlockRebuildIndex call s:RebuildIndex()

" Command to test the plugin
command! MathBlockTest call s:TestPlugin()

function! s:TestPlugin()
    echo "Testing MathBlock plugin..."
    echo "Current file: " . expand('%:p')
    echo "Search path: " . g:mathblock_index_file
    
    let l:blocks = s:LoadMathBlockIndex()
    if empty(l:blocks)
        echo "ERROR: No blocks loaded!"
    else
        echo "SUCCESS: Loaded " . len(l:blocks) . " blocks"
        echo "First block: " . string(l:blocks[0])
        
        " Test completion function
        echo ""
        echo "Testing completion with '@':"
        let l:results = MathBlockComplete(0, '@')
        echo "  Found " . len(l:results) . " completions"
        if len(l:results) > 0
            echo "  First completion: " . string(l:results[0])
        endif
        
        echo ""
        echo "Testing completion with '@theorem:':"
        let l:results = MathBlockComplete(0, '@theorem:')
        echo "  Found " . len(l:results) . " theorem completions"
        
        echo ""
        echo "Testing content search with '@/compact':"
        let l:results = MathBlockComplete(0, '@/compact')
        echo "  Found " . len(l:results) . " results containing 'compact'"
        if len(l:results) > 0
            echo "  First result: " . l:results[0].abbr . " - " . l:results[0].menu
        endif
    endif
endfunction

function! s:RebuildIndex()
    " Find project root
    let l:dir = expand('%:p:h')
    let l:root = ''
    
    while l:dir != '/' && l:dir != ''
        if isdirectory(l:dir . '/.git') || filereadable(l:dir . '/CLAUDE.md')
            let l:root = l:dir
            break
        endif
        let l:dir = fnamemodify(l:dir, ':h')
    endwhile
    
    if empty(l:root)
        echom "Could not find project root"
        return
    endif
    
    " Run the build script
    let l:script = l:root . '/scripts/build-mathblock-index.py'
    if !filereadable(l:script)
        echom "Index build script not found: " . l:script
        return
    endif
    
    echom "Rebuilding math block index..."
    let l:output = system('cd ' . shellescape(l:root) . ' && python3 ' . shellescape(l:script))
    if v:shell_error
        echom "Error rebuilding index: " . l:output
    else
        " Clear cache to force reload
        let s:mathblock_cache = {}
        let s:mathblock_cache_time = 0
        echom "Math block index rebuilt successfully"
    endif
endfunction

" Provide a way to get block info at cursor
command! MathBlockInfo call s:ShowBlockInfo()

function! s:ShowBlockInfo()
    let l:word = expand('<cWORD>')
    
    " Strip surrounding characters to get the reference
    let l:ref = substitute(l:word, '[^@a-zA-Z0-9:_-]', '', 'g')
    
    if l:ref !~ '^@'
        echom "Not on a math block reference"
        return
    endif
    
    let l:ref = l:ref[1:]  " Remove @
    let l:blocks = s:LoadMathBlockIndex()
    
    for l:block in l:blocks
        if l:block.label == l:ref || (l:block.type . ':' . l:block.label) == l:ref
            echo "Math Block: " . l:block.type . " " . l:block.label
            if !empty(l:block.title)
                echo "Title: " . l:block.title
            endif
            echo "File: " . l:block.file
            if !empty(l:block.preview)
                echo "Preview: " . l:block.preview
            endif
            return
        endif
    endfor
    
    echom "Math block not found: @" . l:ref
endfunction