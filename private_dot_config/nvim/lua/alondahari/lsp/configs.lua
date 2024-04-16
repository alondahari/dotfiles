require("alondahari.lsp.configs.rust_analyzer")
require("alondahari.lsp.configs.sorbet")
require("alondahari.lsp.configs.tsserver")

local Config = require("alondahari.lsp.config")
local lspconfig = require("lspconfig")
local features = require("alondahari.lsp.features")

-- This is a default config that is safe to use for all LSPs without any specific configuration
local cfg = Config:new({})

if features.ruby_ls then
	lspconfig.ruby_ls.setup(cfg:to_lspconfig())
end

if features.tailwind then
	lspconfig.tailwindcss.setup(cfg:to_lspconfig())
end

lspconfig.eslint.setup(cfg:to_lspconfig())
