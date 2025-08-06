return {
	"ibhagwan/fzf-lua",
	dependencies = {
    "junegunn/fzf",
		"nvim-tree/nvim-web-devicons",
	},
	config = function()
		vim.keymap.set("n", "tf", "<cmd>FzfLua files<cr>", { silent = true })
		vim.keymap.set("n", "to", "<cmd>FzfLua buffers<cr>", { silent = true })
		vim.keymap.set("n", "ts", "<cmd>FzfLua live_grep<cr>", { silent = true })
		vim.keymap.set("n", "tr", "<cmd>FzfLua lsp_references<cr>", { silent = true })
		vim.keymap.set("n", "th", "<cmd>FzfLua oldfiles<cr>", { silent = true })
	end,
}

