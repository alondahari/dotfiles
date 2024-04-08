-- switch between vim and tmux
return {
  'christoomey/vim-tmux-navigator',
  config = function()
    vim.g.tmux_navigator_no_mappings = '1'

    vim.keymap.set("n", "<C-n>", "<cmd>TmuxNavigateLeft<cr>")
    vim.keymap.set("n", "<C-e>", "<cmd>TmuxNavigateDown<cr>")
    vim.keymap.set("n", "<C-u>", "<cmd>TmuxNavigateUp<cr>")
    vim.keymap.set("n", "<C-i>", "<cmd>TmuxNavigateRight<cr>")
    vim.keymap.set("n", "<C-/>", "<cmd>TmuxNavigatePrevious<cr>")
  end
}

