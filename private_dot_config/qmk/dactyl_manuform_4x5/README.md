# Dactyl Manuform 4x5 — QMK Keyboard Configuration

Custom QMK firmware for a handwired Dactyl Manuform 4x5 split keyboard with Apple Fn/Globe key support.

## Files

| File | Description |
|---|---|
| `keymap.json` | Keymap definition (QWERTY base, 8 layers) |
| `rules.mk` | Build flags (`APPLE_FN_ENABLE`, `NKRO` disabled) |
| `config.h` | USB VID/PID spoofing for Apple Fn support |
| `firmware.hex` | Last compiled firmware, ready to flash |

## Prerequisites

```sh
brew install qmk/qmk/qmk
qmk setup -y
```

Ensure AVR toolchain is on your PATH (should already be in `~/.zshrc`):

```sh
export PATH="/opt/homebrew/opt/avr-gcc@8/bin:$PATH"
```

## Editing the Keymap

Edit `~/.config/qmk/dactyl_manuform_4x5/keymap.json`. The JSON is formatted to match the physical layout:

```
Row 0:    5 left keys,                         5 right keys
Row 1:    5 left keys,                         5 right keys
Row 2:    5 left keys,                         5 right keys
Inner:    2 left,                              2 right
Thumb:    2 left (ESC, BSPC),                  2 right (SPC, ENT)
Lower:    2 left (_, Apple Fn),                2 right
Bottom:   2 left,                              2 right (_, DF(7))
```

### Layers

| Layer | Purpose |
|---|---|
| 0 | Base (QWERTY) |
| 1 | Navigation + media (held via T/F) |
| 2 | Numbers (held via M) |
| 3 | Brackets/parens (held via comma) |
| 4 | Symbols + brightness (held via D/C) |
| 5 | (transparent, unused) |
| 6 | Right Alt+GUI modifiers (held via dot) |
| 7 | Alternate QWERTY (toggled via DF(7)) |

## Compiling

Copy the keymap into QMK and compile:

```sh
cp ~/.config/qmk/dactyl_manuform_4x5/{keymap.json,rules.mk,config.h} \
   ~/qmk_firmware/keyboards/handwired/dactyl_manuform/4x5/keymaps/apple_fn/

qmk compile -kb handwired/dactyl_manuform/4x5 -km apple_fn
```

Then copy the new hex back:

```sh
cp ~/qmk_firmware/handwired_dactyl_manuform_4x5_apple_fn.hex \
   ~/.config/qmk/dactyl_manuform_4x5/firmware.hex
```

## Flashing

Open **QMK Toolbox**, load `~/.config/qmk/dactyl_manuform_4x5/firmware.hex`, reset the keyboard, and flash. Repeat for both halves.

## Notes

- **Apple Fn/Globe key** requires spoofed Apple VID/PID (`0x05AC:0x024F`) in `config.h`
- **NKRO is disabled** — Apple Fn only works with 6KRO
- The QMK source at `~/qmk_firmware` has the Apple Fn patch applied (not upstream) — if you `qmk setup` again, you'll need to re-apply it
