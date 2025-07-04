return {
  "sindrets/diffview.nvim",
	config = function ()
    vim.keymap.set("n", '<leader>dm', ':DiffviewOpen origin/master', {silent = true})
	end
}

