-- ----------------------------------------------
-- AutoCommands
-- ----------------------------------------------
local file_type_group = vim.api.nvim_create_augroup('file_type_cmds', { clear = true })
vim.api.nvim_create_autocmd('FileType', {
  pattern = 'markdown',
  group = file_type_group,
  command = 'setlocal wrap linebreak nolist noexpandtab tabstop=4 shiftwidth=4 softtabstop=0 nosmarttab'
})
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'tf', 'ts', 'html', 'rust', 'nroff', 'typescriptreact', 'dart', 'zsh' },
  group = file_type_group,
  command = 'setlocal expandtab tabstop=4 shiftwidth=2 softtabstop=0 smarttab'
})
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'javascript', 'htmldjango' },
  group = file_type_group,
  command = 'setlocal expandtab tabstop=4 shiftwidth=4 softtabstop=0 smarttab'
})
vim.api.nvim_create_autocmd('BufWritePre', {
  pattern = '*',
  command = 'Neoformat'
})
vim.api.nvim_create_autocmd('filetype', {
  pattern = 'netrw',
  desc = 'Better mappings for netrw',
  callback = function()
    local bind = function(lhs, rhs)
      vim.keymap.set('n', lhs, rhs, { remap = true, buffer = true })
    end

    -- edit new file
    bind('n', '%:w<CR>')

    -- avoid clashing of our telescope commands with opening netrw in new tab
    bind('t', '')

    -- rename file
    bind('r', 'R')
  end
})

-- -- change theme when nvim gains or loses focus
-- -- This is kinda nice but a bit too slow
-- vim.api.nvim_create_autocmd('FocusLost', {
--   callback = function ()
--     vim.cmd('colorscheme tokyonight-night')
--   end
-- })
-- vim.api.nvim_create_autocmd('FocusGained', {
--   callback = function ()
--     vim.cmd('colorscheme tokyonight-moon')
--   end
-- })
