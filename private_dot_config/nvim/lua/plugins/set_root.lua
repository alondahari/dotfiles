return {
	dir = "alondahari/set_root",
	name = "set_root",
	dev = true,
	config = function()
		local p = require("alondahari/set_root")
		-- set cwd
		vim.keymap.set("n", "<space>cd", "<cmd>cd %:h<CR>")
		vim.keymap.set("n", "<space>cn", function()
			p.cd_npm_root()
		end)
		vim.keymap.set("n", "<space>cg", function()
			p.cd_git_root()
		end)
	end,
}
