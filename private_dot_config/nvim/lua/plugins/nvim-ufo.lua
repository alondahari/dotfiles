return {
	"kevinhwang91/nvim-ufo",
	dependencies = {
		"kevinhwang91/promise-async",
	},
	config = function()
		-- Tell the server the capability of foldingRange,
		-- Neovim hasn't added foldingRange to default capabilities, users must add it manually
		local capabilities = vim.lsp.protocol.make_client_capabilities()
		capabilities.textDocument.foldingRange = {
			dynamicRegistration = false,
			lineFoldingOnly = true,
		}

		-- Setup nvim-ufo with LSP and treesitter as providers
		require("ufo").setup({
			provider_selector = function(bufnr, filetype, buftype)
				return { "treesitter", "indent" }
			end,
		})

		-- Using ufo provider need remap `zR` and `zM`
		vim.keymap.set("n", "zR", require("ufo").openAllFolds, { desc = "Open all folds" })
		vim.keymap.set("n", "zM", require("ufo").closeAllFolds, { desc = "Close all folds" })

		-- Peek folded lines with K
		vim.keymap.set("n", "K", function()
			local winid = require("ufo").peekFoldedLinesUnderCursor()
			if not winid then
				vim.lsp.buf.hover()
			end
		end, { desc = "Peek fold or hover" })
	end,
}
