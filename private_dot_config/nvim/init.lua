-- --------------------------------------------------------------------------
-- Leader Key
-- --------------------------------------------------------------------------
vim.g.mapleader = ","

-- --------------------------------------------------------------------------
-- Bootstrap lazy.nvim if it isn't installed
-- --------------------------------------------------------------------------
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- --------------------------------------------------------------------------
-- Setup lazy.nvim using the plugins directory for the lazy.nvim plugin specs
-- --------------------------------------------------------------------------
require("lazy").setup("plugins")

-- --------------------------------------------------------------------------
-- General Options, not tied to specific plugins
-- --------------------------------------------------------------------------

require("basic")
require("autocommands")
require("keymaps")
