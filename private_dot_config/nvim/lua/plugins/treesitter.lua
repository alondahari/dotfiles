return {
	'nvim-treesitter/nvim-treesitter',
	dependencies = {
		'nvim-treesitter/playground',
		'nvim-treesitter/nvim-treesitter-context'
	},
	version = false,
	build = ':TSUpdate',
	config = function()
		local configs = require("nvim-treesitter.configs")

		configs.setup({
			ensure_installed = { "lua", "luadoc", "vim", "vimdoc", "query", "ruby", "markdown", "markdown_inline", "rust", "toml", "sql", "yaml", "terraform", "typescript", "javascript", "jsdoc", "json", "bash", "css", "scss", "dart", "diff", "dockerfile", "git_rebase", "gitattributes", "gitignore", "graphql", "html" },
			highlight = { enable = true },
			indent = { enable = true, disable = { "dart" } },
		})
	end
}
