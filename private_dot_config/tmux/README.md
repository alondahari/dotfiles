# My `.tmux.conf` setup

This is my personal `.tmux` directory setup which contains my `.tmux.conf` and
any dependencies.

## Installation

### Link Configuration

    cd ~/
    git clone https://github.com/drewdeponte/dottmux.git ~/.config/tmux
    ln -s ~/.config/tmux/tmux.conf ~/.tmux.conf

### Add Utilities to PATH

Add `$HOME/.config/tmux/bin` to your PATH environment variable in your shell
configurations.

### Tmux installation

Install using homebrew:

```sh
brew install tmux
```

Also need to install reattach-to-user-namespace:

```sh
brew install reattach-to-user-namespace
```
