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
			},
		})

		local nvim_lsp = require("lspconfig")

		-- Use an on_attach function to only map the following keys
		-- after the language server attaches to the current buffer
		local on_attach = function(client, bufnr)
			local function buf_set_keymap(...)
				vim.api.nvim_buf_set_keymap(bufnr, ...)
			end

			local function buf_set_option(...)
				vim.api.nvim_buf_set_option(bufnr, ...)
			end

			-- Enable completion triggered by <c-x><c-o>
			buf_set_option("omnifunc", "v:lua.vim.lsp.omnifunc")

			-- Mappings.
			local opts = { noremap = true, silent = true }

			-- See `:help vim.lsp.*` for documentation on any of the below functions
			buf_set_keymap("n", "<space>e", '<cmd>lua vim.diagnostic.open_float({scope="line"})<CR>', opts)
			buf_set_keymap("n", "<space>q", "<cmd>lua vim.diagnostic.setqflist()<CR>", opts)
			buf_set_keymap("n", "<space>a", "<cmd>lua vim.lsp.buf.code_action()<CR>", opts)
			buf_set_keymap("x", "<space>a", "<cmd>lua vim.lsp.buf.code_action()<CR>", opts)
			buf_set_keymap("n", "gd", "<cmd>lua vim.lsp.buf.definition()<CR>", opts)
			buf_set_keymap("n", "gD", "<cmd>lua vim.lsp.buf.declaration()<CR>", opts)
			buf_set_keymap("n", "gr", "<cmd>lua vim.lsp.buf.references()<CR>", opts)
			buf_set_keymap("n", "K", "<cmd>lua vim.lsp.buf.hover()<CR>", opts)
			buf_set_keymap("n", "gi", "<cmd>lua vim.lsp.buf.implementation()<CR>", opts)
			buf_set_keymap("n", "<C-k>", "<cmd>lua vim.lsp.buf.signature_help()<CR>", opts)
			buf_set_keymap("n", "<C-;>", "<cmd>lua vim.diagnostic.goto_prev({ float = false })<CR>", opts)
			buf_set_keymap("n", "<C-o>", "<cmd>lua vim.diagnostic.goto_next({ float = false })<CR>", opts)
			buf_set_keymap("n", "<space>f", "<cmd>lua vim.lsp.buf.format({ async = true })<CR>", opts)

			buf_set_keymap("n", "<space>wa", "<cmd>lua vim.lsp.buf.add_workspace_folder()<CR>", opts)
			buf_set_keymap("n", "<space>wr", "<cmd>lua vim.lsp.buf.remove_workspace_folder()<CR>", opts)
			buf_set_keymap(
				"n",
				"<space>wl",
				"<cmd>lua print(vim.inspect(vim.lsp.buf.list_workspace_folders()))<CR>",
				opts
			)
			buf_set_keymap("n", "<space>D", "<cmd>lua vim.lsp.buf.type_definition()<CR>", opts)
			buf_set_keymap("n", "<space>rn", "<cmd>lua vim.lsp.buf.rename()<CR>", opts)

			-- nnoremap <silent> gd    <cmd>lua vim.lsp.buf.definition()<CR>
			-- nnoremap <silent> gi    <cmd>lua vim.lsp.buf.implementation()<CR>
			-- nnoremap <silent> gD    <cmd>lua vim.lsp.buf.declaration()<CR>
			-- nnoremap <silent> gT    <cmd>lua vim.lsp.buf.type_definition()<CR>
			-- nnoremap <silent> gr    <cmd>lua vim.lsp.buf.references()<CR>
			-- nnoremap <silent> gs    <cmd>lua vim.lsp.buf.document_symbol()<CR>
			-- nnoremap <silent> gS    <cmd>lua vim.lsp.buf.workspace_symbol()<CR>
			-- nnoremap <silent> K     <cmd>lua vim.lsp.buf.hover()<CR>
			-- nnoremap <silent> <c-k> <cmd>lua vim.lsp.buf.signature_help()<CR>
		end

		-- Use a loop to conveniently call 'setup' on multiple servers and
		-- map buffer local keybindings when the language server attaches
		local servers = { "graphql", "ruby_ls", "gopls", "tsserver" }
		for _, lsp in ipairs(servers) do
			nvim_lsp[lsp].setup({
				on_attach = on_attach,
				flags = {
					debounce_text_changes = 150,
				},
				capabilities = require("cmp_nvim_lsp").default_capabilities(
					vim.lsp.protocol.make_client_capabilities()
				),
			})
		end

		local rust_opts = {
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
				on_attach = on_attach,
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
		}

		require("rust-tools").setup(rust_opts)
		-- go lsp
		require("lspconfig").lua_ls.setup({
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
			on_attach = on_attach,
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
