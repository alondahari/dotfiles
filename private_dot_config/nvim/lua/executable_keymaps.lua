-- Closing buffers
vim.keymap.set('n', '<leader>xx', '<cmd>%bd|e#|bd#<cr>') -- close all other buffers
vim.keymap.set('n', '<leader>xt', '<cmd>bd<cr>') -- close this buffer
vim.keymap.set('n', '<leader>xa', '<cmd>%bd<cr>') -- close all buffers
vim.keymap.set('n', '<leader>xb', '<cmd>bp|bd#<cr>') -- close buffer but not split

-- Add new lines
vim.keymap.set('n', '<Enter>', 'o<ESC>', {silent = true})
vim.keymap.set('n', '<S-Enter>', 'O<ESC>', {silent = true})

-- move selected lines up / down
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- tack next line onto this one without moving the cursor
vim.keymap.set("n", "J", "mzJ`z")

-- move half page down without moving cursor
vim.keymap.set({"n", "v"}, "<C-h>", "<C-d>zz")
vim.keymap.set({"n", "v"}, "<C-j>", "<C-u>zz")
vim.keymap.set("n", "n", "nzzzv")
vim.keymap.set("n", "N", "Nzzzv")

-- paste without losing what's in the registr
vim.keymap.set("x", "<leader>p", [["_dP]])

-- next greatest remap ever : asbjornHaland
vim.keymap.set({"n", "v"}, "<leader>y", [["+y]])
vim.keymap.set("n", "<leader>Y", [["+Y]])

vim.keymap.set({"n", "v"}, "<leader>d", [["_d]])

-- replace all occurences of current word in file
vim.keymap.set("n", "<leader>ra", [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]])

-- source current file
vim.keymap.set("n", "<leader><leader>", "<cmd>so<CR>")

-- tree view
vim.keymap.set("n", "h", "<cmd>Ex<CR>")

-- last buffer
vim.keymap.set("n", "l", "<C-^>")
vim.keymap.set("n", "<c-l>", "<cmd>vs #<CR>")

-- make current file executable
vim.keymap.set("n", "<space>x", "<cmd>!chmod +x %<CR>", { silent = true })

-- save and quit
vim.keymap.set("n", "<leader>s", function()
  -- in git messages we want to also close the file
  local isInGit = string.find(vim.api.nvim_buf_get_name(0), '/.git/', 1, true)
  if isInGit then vim.cmd("wq") else vim.cmd("w") end
end)
vim.keymap.set("n", "<leader>q", "<cmd>q<CR>")

-- close tab
vim.keymap.set('n', 'tc', ':tabc<cr>')
vim.keymap.set('n', 'tn', ':tabn<cr>')

-- use \ to comment stuff out
vim.keymap.set({ "v", "x", "n", "o" }, "\\", "<Plug>Commentary", { noremap = true })
vim.keymap.set("n", "\\\\", "<Plug>CommentaryLine", { noremap = true })
vim.keymap.set("n", "\\u", "<Plug>Commentary<Plug>Commentary", { noremap = true })
