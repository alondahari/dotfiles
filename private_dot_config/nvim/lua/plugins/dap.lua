return {
	"rcarriga/nvim-dap-ui",
	dependencies = { "mfussenegger/nvim-dap", "nvim-neotest/nvim-nio", "suketa/nvim-dap-ruby" },
	config = function()
		require("dap-ruby").setup()
		require("dapui").setup()
	end,
}
