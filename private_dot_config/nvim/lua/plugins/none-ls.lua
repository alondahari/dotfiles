return {
	"nvimtools/none-ls.nvim",
	lazy = true,
	ft = {
		"go",
		"javascript",
		"json",
		"lua",
		"ruby",
		"rust",
		"typescript",
		"yaml",
	},
	dependencies = {
		"gbprod/none-ls-luacheck.nvim",
	},
	config = function()
		local features = require("alondahari.lsp.features")
		local null_ls = require("null-ls")

		if features.lua then
			null_ls.register(require("none-ls-luacheck.diagnostics.luacheck"))
		end

		local actions = null_ls.builtins.code_actions
		local diagnostics = null_ls.builtins.diagnostics
		local Config = require("alondahari.lsp.config")
		local formatting = null_ls.builtins.formatting
		local mason = require("alondahari.mason")

		local ensure = {}

		if features.typescript then
			table.insert(ensure, { name = "prettier" })
		end

		if features.lua then
			table.insert(ensure, { name = "stylua" })
			table.insert(ensure, { name = "luacheck" })
		end

		mason.ensure_tools(ensure)

		local sources = {
			actions.gitsigns,
		}

		if features.typescript then
			table.insert(sources, formatting.prettier)
		end

		if features.lua then
			table.insert(sources, formatting.stylua)
			table.insert(sources, diagnostics.luacheck)
		end

		if features.rubocop then
			table.insert(sources, diagnostics.rubocop.with({ timeout = 5000, prefer_local = "bin" }))
			table.insert(sources, formatting.rubocop.with({ timeout = 5000, prefer_local = "bin" }))
		end

		local cfg = Config:new({ sources = sources })
		null_ls.setup(cfg:to_lspconfig())
	end,
}
