return {
	{
		"neovim/nvim-lspconfig",
		ft = {
			"lua",
			"ruby",
			"typescript",
			"typescriptreact",
		},
		dependencies = {
			"williamboman/mason.nvim",
		},
		lazy = true,
		config = function()
			require("alondahari.lsp.configs")
		end,
	},

	{
		"williamboman/mason.nvim",
		lazy = true,
		dependencies = { "williamboman/mason-lspconfig.nvim" },
		config = function()
			local features = require("alondahari.lsp.features")
			require("mason").setup({
				ui = { border = "rounded" },
			})

			local ensure = {}

			if features.ruby then
				table.insert(ensure, "ruby_ls")
			end

			if features.typescript then
				table.insert(ensure, "eslint")
				table.insert(ensure, "tsserver")
			end

			if features.tailwind then
				table.insert(ensure, "tailwindcss")
			end

			if features.rust then
				table.insert(ensure, "rust_analyzer")
			end

			require("mason-lspconfig").setup({ ensure_installed = ensure })
		end,
	},
}
