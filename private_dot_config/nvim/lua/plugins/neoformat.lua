return {
  'sbdchd/neoformat',
  config = function()
    vim.g.neoformat_enabled_cpp = { "uncrustify" }
    vim.g.neoformat_enabled_javascript = { "prettierd", "eslint_d" }
    vim.g.neoformat_enabled_typescript = { "prettierd", "eslint_d" }

    vim.g.neoformat_run_all_formatters = 1
  end
}
