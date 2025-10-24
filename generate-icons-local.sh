#!/bin/bash
# Generate PWA icons from existing FAM logo

set -e

SOURCE_SVG="public/fam-logo.svg"
ICONS_DIR="public/icons"

# Check if source exists
if [ ! -f "${SOURCE_SVG}" ]; then
    echo "Error: Source logo not found at ${SOURCE_SVG}"
    exit 1
fi

echo "Using existing FAM logo: ${SOURCE_SVG}"

# Define icon sizes
SIZES=(72 96 128 144 152 192 384 512)

# Define FAM brand color (from website)
BG_COLOR="#005892"  # FAM Blue

# Generate PNG icons from SVG using ImageMagick
echo "Generating PNG icons with FAM brand color (${BG_COLOR})..."
for SIZE in "${SIZES[@]}"; do
    OUTPUT="${ICONS_DIR}/icon-${SIZE}x${SIZE}.png"
    echo "  Generating ${SIZE}x${SIZE}..."

    # Convert SVG to PNG with FAM blue background
    convert -background "${BG_COLOR}" -density 300 "${SOURCE_SVG}" \
        -resize ${SIZE}x${SIZE} "${OUTPUT}"

    if [ -f "${OUTPUT}" ]; then
        echo "    ✓ Created ${OUTPUT} ($(du -h "${OUTPUT}" | cut -f1))"
    else
        echo "    ✗ Failed to generate ${OUTPUT}"
    fi
done

# Generate maskable icon (with padding for safe area)
echo ""
echo "Generating maskable icon with safe padding..."
MASKABLE_OUTPUT="${ICONS_DIR}/icon-maskable-512x512.png"

# 1. Convert SVG to 432x432 (84.375% of 512 for safe area)
# 2. Add padding to center it in 512x512 canvas
convert -background "${BG_COLOR}" -density 300 "${SOURCE_SVG}" \
    -resize 432x432 -gravity center -extent 512x512 "${MASKABLE_OUTPUT}"

if [ -f "${MASKABLE_OUTPUT}" ]; then
    echo "  ✓ Created ${MASKABLE_OUTPUT} ($(du -h "${MASKABLE_OUTPUT}" | cut -f1))"
fi

# Generate shortcut icons (96x96) - same as main icon for now
echo ""
echo "Generating shortcut icons..."
for SHORTCUT in "today" "map" "favorites"; do
    SHORTCUT_OUTPUT="${ICONS_DIR}/shortcut-${SHORTCUT}-96x96.png"
    cp "${ICONS_DIR}/icon-96x96.png" "${SHORTCUT_OUTPUT}"
    echo "  ✓ Created shortcut-${SHORTCUT}-96x96.png"
done

# Generate favicon.ico (multi-resolution)
echo ""
echo "Generating favicon.ico..."
convert "${ICONS_DIR}/icon-72x72.png" "${ICONS_DIR}/icon-96x96.png" \
    "${ICONS_DIR}/icon-128x128.png" "public/favicon.ico"

if [ -f "public/favicon.ico" ]; then
    echo "  ✓ Created favicon.ico ($(du -h "public/favicon.ico" | cut -f1))"
fi

# Generate apple-touch-icon (180x180 for iOS)
echo ""
echo "Generating apple-touch-icon.png..."
convert -background "${BG_COLOR}" -density 300 "${SOURCE_SVG}" \
    -resize 180x180 "public/apple-touch-icon.png"

if [ -f "public/apple-touch-icon.png" ]; then
    echo "  ✓ Created apple-touch-icon.png ($(du -h "public/apple-touch-icon.png" | cut -f1))"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ All PWA icons generated successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Generated files:"
ls -lh "${ICONS_DIR}"/*.png 2>/dev/null | awk '{print "  " $9 " - " $5}'
ls -lh public/favicon.ico public/apple-touch-icon.png 2>/dev/null | awk '{print "  " $9 " - " $5}'
