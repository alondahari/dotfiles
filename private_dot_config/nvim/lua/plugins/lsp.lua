return {
	"neovim/nvim-lspconfig",
	event = { "BufReadPre", "BufNewFile" },
	dependencies = {
		"williamboman/mason.nvim",
		"williamboman/mason-lspconfig.nvim",
		{
			"hrsh7th/cmp-nvim-lsp",
			branch = "main",
			dependencies = {
				{ "hrsh7th/nvim-cmp", branch = "main" },
			},
		},
	},
	config = function()
		require("mason").setup()
		require("mason-lspconfig").setup({
			ensure_installed = {
				"tsserver",
				"eslint",
				"ltex",
				"lua_ls",
				"cssls",
			},
		})

		local nvim_lsp = require("lspconfig")
		local lsp_configs = require("alondahari/lsp")

		-- Use a loop to conveniently call 'setup' on multiple servers and
		-- map buffer local keybindings when the language server attaches
		local servers = { "tsserver", "rubocop", "sorbet", "eslint", "cssls" }
		for _, lsp in ipairs(servers) do
			nvim_lsp[lsp].setup({
				on_attach = lsp_configs.on_attach,
				flags = {
					debounce_text_changes = 150,
				},
				capabilities = require("cmp_nvim_lsp").default_capabilities(
					vim.lsp.protocol.make_client_capabilities()
				),
			})
		end

		require("rust-tools").setup({
			tools = { -- rust-tools options
				autoSetHints = true,
				-- hover_with_actions = true,
				inlay_hints = {
					show_parameter_hints = false,
					parameter_hints_prefix = "",
					other_hints_prefix = "",
				},
			},
			-- all the opts to send to nvim-lspconfig
			-- these override the defaults set by rust-tools.nvim
			-- see https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#rust_analyzer
			server = {
				-- on_attach is a callback called when the language server attachs to the buffer
				on_attach = lsp_configs.on_attach,
				settings = {
					-- to enable rust-analyzer settings visit:
					-- https://github.com/rust-analyzer/rust-analyzer/blob/master/docs/user/generated_config.adoc
					["rust-analyzer"] = {
						-- enable clippy on save
						checkOnSave = {
							command = "clippy",
						},
					},
				},
			},
		})

		-- go lsp
		nvim_lsp.lua_ls.setup({
			settings = {
				Lua = {
					diagnostics = {
						globals = { "vim" },
					},
				},
			},
		})

		-- ===========================================
		--  Add user dictionary for ltex-ls
		--  * en.utf-8.add must be created using `zg` when set spell is on
		-- ===========================================
		nvim_lsp.ltex.setup({
			on_attach = lsp_configs.on_attach,
			settings = {
				ltex = {
					language = "en-GB",
					dictionary = { ["en-GB"] = {} },
					additionalRules = {
						languageModel = "~/ngrams/",
					},
				},
			},
		})
	end,
}
