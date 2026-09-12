" Highlight mathnotes .tex parse errors on save.
"
" Symlinked into place from the repo:
"     ln -s ~/mathnotes/vim/plugin/mathnotes-check.vim ~/.vim/plugin/mathnotes-check.vim
"
" On :w this runs scripts/check_tex.py inside the already-running builder
" container (asynchronously, so the save returns immediately). Errors land in
" quickfix and get a sign plus a highlighted line; a clean save clears both.
"
" Lives in plugin/ rather than after/ftplugin/ deliberately: plugin scripts are
" sourced at startup regardless of ':filetype plugin on', which is off in this
" setup. The content/ guard in s:Check keeps it inert for every .tex file
" outside the repo.
"
" Commands: :MathnotesCheck re-runs it, :MathnotesCheckClear drops the markers.
" Set g:mathnotes_check_disable to turn it off entirely.

if exists('g:loaded_mathnotes_check') || exists('g:mathnotes_check_disable')
  finish
endif
let g:loaded_mathnotes_check = 1

if !has('job') || !has('signs') || !has('quickfix')
  finish
endif

" Resolve the symlink to find the repo this script actually lives in, rather
" than hardcoding a path. vim/plugin/mathnotes-check.vim -> three levels up.
let s:repo_root = fnamemodify(resolve(expand('<sfile>:p')), ':h:h:h')
let s:content_root = s:repo_root . '/content/'
let s:container = get(g:, 'mathnotes_check_container', 'mathnotes-static-builder')
let s:qf_title = 'mathnotes'

" Muted red rather than ErrorMsg, which paints the whole line at full intensity.
" `default` so a colorscheme or your vimrc can override either group.
function! s:DefineHighlights() abort
  if &background ==# 'dark'
    highlight default MathnotesErrLine guibg=#3d2226 ctermbg=52
  else
    highlight default MathnotesErrLine guibg=#ffdde0 ctermbg=224
  endif
  highlight default MathnotesErrSign guifg=#e05561 ctermfg=203
endfunction

call s:DefineHighlights()

augroup mathnotes_check_colors
  autocmd!
  autocmd ColorScheme * call s:DefineHighlights()
augroup END

if empty(sign_getdefined('MathnotesErr'))
  call sign_define('MathnotesErr', {
        \ 'text': '>>',
        \ 'texthl': 'MathnotesErrSign',
        \ 'linehl': 'MathnotesErrLine',
        \ })
endif

" Clear our signs, and close quickfix only if the list is still ours.
function! s:Clear(bufnr) abort
  if bufexists(a:bufnr)
    call sign_unplace('mathnotes', {'buffer': a:bufnr})
  endif
  if get(getqflist({'title': 1}), 'title', '') ==# s:qf_title
    call setqflist([], 'r', {'title': s:qf_title, 'items': []})
    cclose
  endif
endfunction

function! s:OnExit(bufnr, outfile, job, status) abort
  let l:lines = filereadable(a:outfile) ? readfile(a:outfile) : []
  call delete(a:outfile)

  if !bufexists(a:bufnr)
    return
  endif

  " Parse file:line: message. Anything not matching this shape is a docker or
  " environment failure (container down, docker missing), not a LaTeX error,
  " so stay silent rather than dumping noise into quickfix.
  let l:items = []
  for l:line in l:lines
    let l:m = matchlist(l:line, '^\(.\{-}\):\(\d\+\): \(.*\)$')
    if !empty(l:m)
      call add(l:items, {
            \ 'bufnr': a:bufnr,
            \ 'lnum': str2nr(l:m[2]),
            \ 'text': l:m[3],
            \ 'type': 'E',
            \ })
    endif
  endfor

  if a:status == 0 || empty(l:items)
    call s:Clear(a:bufnr)
    return
  endif

  call sign_unplace('mathnotes', {'buffer': a:bufnr})
  for l:item in l:items
    call sign_place(0, 'mathnotes', 'MathnotesErr', a:bufnr,
          \ {'lnum': l:item.lnum, 'priority': 20})
  endfor

  call setqflist([], 'r', {'title': s:qf_title, 'items': l:items})
  let l:cur = win_getid()
  copen
  " Highlight in place, don't jump: hand focus back to the buffer being edited.
  call win_gotoid(l:cur)
  redraw
endfunction

function! s:Check(bufnr) abort
  let l:path = fnamemodify(bufname(a:bufnr), ':p')
  if stridx(l:path, s:content_root) != 0 || l:path !~# '\.tex$'
    return
  endif
  if !executable('docker')
    return
  endif

  " Path relative to the repo root; content/ is bind-mounted at /app/content.
  let l:rel = l:path[len(s:repo_root) + 1:]
  let l:outfile = tempname()

  call job_start(
        \ ['docker', 'exec', '-w', '/app', s:container,
        \  'python3', '/app/scripts/check_tex.py', l:rel],
        \ {
        \   'out_io': 'file', 'out_name': l:outfile,
        \   'err_io': 'out',
        \   'exit_cb': function('s:OnExit', [a:bufnr, l:outfile]),
        \ })
endfunction

augroup mathnotes_check
  autocmd!
  autocmd BufWritePost *.tex call s:Check(str2nr(expand('<abuf>')))
augroup END

command! MathnotesCheck call s:Check(bufnr('%'))
command! MathnotesCheckClear call s:Clear(bufnr('%'))
