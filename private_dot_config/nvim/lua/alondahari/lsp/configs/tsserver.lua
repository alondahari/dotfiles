local features = require("alondahari.lsp.features")
local lspconfig = require("lspconfig")
local Config = require("alondahari.lsp.config")

if not features.typescript then
	return
end

local cfg = Config:new({
	on_attach = function(client)
		-- disable  formatting for tsserver so that prettier handles it through
		-- null-ls
		client.server_capabilities.documentFormattingProvider = false
		client.server_capabilities.documentRangeFormattingProvider = false
	end,
})

lspconfig.tsserver.setup(cfg:to_lspconfig())
