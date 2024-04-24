-- Helpers to set current root in big projects
local M = {}

local function get_git_root()
	local dot_git_path = vim.fn.finddir(".git", ".;")
	return vim.fn.fnamemodify(dot_git_path, ":h")
end

M.cd_git_root = function()
	vim.api.nvim_set_current_dir(get_git_root())
end

local function get_npm_root()
	local dot_git_path = vim.fn.findfile("package.json", ".;")
	return vim.fn.fnamemodify(dot_git_path, ":h")
end

M.cd_npm_root = function()
	vim.api.nvim_set_current_dir(get_npm_root())
end

return M
