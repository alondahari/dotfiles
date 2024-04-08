return {
  'hrsh7th/nvim-cmp',
  branch = 'main',
  dependencies = {
    {
      'onsails/lspkind.nvim',
    },
    {
      'saadparwaiz1/cmp_luasnip',
      dependencies = {
        { 'L3MON4D3/LuaSnip', branch = 'master' }
      }
    },
    {
      'hrsh7th/cmp-nvim-lua',
      branch = 'main'
    },
    {
      'hrsh7th/cmp-nvim-lsp',
      branch = 'main'
    },
    {
      'hrsh7th/cmp-buffer',
      branch = 'main'
    },
    {
      'hrsh7th/cmp-path',
      branch = 'main'
    },
    {
      'hrsh7th/cmp-cmdline',
      branch = 'main'
    },
  },
  config = function()
    local cmp = require('cmp')
    local lspkind = require('lspkind')

    cmp.setup({
      mapping = {
        ['<Up>'] = cmp.mapping.select_prev_item(),
        ['<Down>'] = cmp.mapping.select_next_item(),
        ['<C-d>'] = cmp.mapping.scroll_docs(-4),
        ['<C-f>'] = cmp.mapping.scroll_docs(4),
        ['<C-Space>'] = cmp.mapping.complete(),
        ['<C-e>'] = cmp.mapping.close(),
        ['<C-i>'] = cmp.mapping.confirm({
          behavior = cmp.ConfirmBehavior.Insert,
          select = true
        }),
      },
      sources = {
        { name = 'nvim_lua', group_index = 2 },
        { name = 'nvim_lsp', group_index = 2 },
        { name = 'luasnip',  group_index = 2 },
        { name = 'path',     group_index = 2 },
        { name = 'buffer',   keyword_length = 5 },
      },
      formatting = {
        format = lspkind.cmp_format({
          with_text = true,
          menu = {
            buffer = "[buf]",
            nvim_lsp = "[LSP]",
            nvim_lua = "[api]",
            path = "[path]",
            vsnip = "[snip]",
          }
        })
      },
      snippet = {
        expand = function(args)
          require('luasnip').lsp_expand(args.body)
        end
      },
    })
  end
}
