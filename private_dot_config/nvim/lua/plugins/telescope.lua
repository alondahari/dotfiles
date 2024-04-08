return {
  'nvim-telescope/telescope.nvim',
  dependencies = {
    'nvim-lua/plenary.nvim',
    'nvim-tree/nvim-web-devicons',
    'nvim-telescope/telescope-fzy-native.nvim',
    'brookhong/telescope-pathogen.nvim',
    'doctorfree/cheatsheet.nvim',
  },
  config = function()
    require('telescope').load_extension('fzy_native')
    require("telescope").load_extension('pathogen')

    -- https://github.com/nvim-telescope/telescope.nvim/wiki/Configuration-Recipes#mapping-esc-to-quit-in-insert-mode

    local actions = require("telescope.actions")
    require("telescope").setup {
      defaults = {
        mappings = {
          i = {
            ["<esc>"] = actions.close,
            ["<C-u>"] = false,                                       -- clear the prompt on C-u
            ["<c-d>"] = actions.delete_buffer + actions.move_to_top, -- remove the buffer from telescope
          },
        },
      }
    }

    vim.keymap.set('n', 'tf', "<cmd>lua require(\'local-plugins/telescope-project-files\').project_files()<cr>",
      { silent = true })
    vim.keymap.set('n', 'tw', '<cmd>lua require(\'telescope.builtin\').find_files({ hidden = true })<cr>')
    vim.keymap.set('n', 'to', '<cmd>lua require(\'telescope.builtin\').buffers()<cr>')
    vim.keymap.set('n', 'ts', '<cmd>lua require(\'telescope.builtin\').live_grep()<cr>', { silent = true })
    vim.keymap.set('n', 'th', '<cmd>lua require(\'telescope.builtin\').help_tags()<cr>')
    vim.keymap.set('n', 'tl', '<cmd>lua require(\'telescope.builtin\').git_commits()<cr>')
    vim.keymap.set('n', 'tr',
      '<cmd>lua require(\'telescope.builtin\').lsp_references({ fname_width = 100, jump_type = "tab", file_ignore_patterns = { ".*spec.*" } })<cr>')
    vim.keymap.set('n', 'tR',
      '<cmd>lua require(\'telescope.builtin\').lsp_references({ fname_width = 100, jump_type = "tab" })<cr>')
    vim.keymap.set('n', 'ty', '<cmd>Cheatsheet<cr>')
  end
}
