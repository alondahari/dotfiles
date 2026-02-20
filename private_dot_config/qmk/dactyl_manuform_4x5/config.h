// Copyright 2024 Alon Dahari
// SPDX-License-Identifier: GPL-2.0-or-later

#pragma once

// Spoof Apple VID/PID for Globe/Fn key support
#undef VENDOR_ID
#define VENDOR_ID 0x05AC
#undef PRODUCT_ID
#define PRODUCT_ID 0x024F
