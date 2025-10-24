#!/bin/bash
# Generate PWA icons from FAM logo

set -e

LOGO_URL="https://fam-muenchen.de/files/layout/img/fam-logo-white.svg"
ICONS_DIR="public/icons"
TEMP_SVG="${ICONS_DIR}/fam-logo.svg"

# Create icons directory
mkdir -p "${ICONS_DIR}"

# Download logo
echo "Downloading FAM logo..."
curl -sL "${LOGO_URL}" -o "${TEMP_SVG}"

# Check if download was successful
if [ ! -f "${TEMP_SVG}" ] || [ ! -s "${TEMP_SVG}" ]; then
    echo "Error: Failed to download logo"
    exit 1
fi

echo "Logo downloaded successfully"

# Define icon sizes
SIZES=(72 96 128 144 152 192 384 512)

# Generate PNG icons from SVG using ImageMagick
echo "Generating PNG icons..."
for SIZE in "${SIZES[@]}"; do
    OUTPUT="${ICONS_DIR}/icon-${SIZE}x${SIZE}.png"
    echo "  Generating ${SIZE}x${SIZE}..."

    # Convert SVG to PNG with white background for better visibility
    convert -background "#005892" -density 300 "${TEMP_SVG}" -resize ${SIZE}x${SIZE} "${OUTPUT}"

    if [ ! -f "${OUTPUT}" ]; then
        echo "    Warning: Failed to generate ${OUTPUT}"
    else
        echo "    ✓ Created ${OUTPUT}"
    fi
done

# Generate maskable icon (with padding for safe area)
echo "Generating maskable icon..."
convert -background "#005892" -density 300 "${TEMP_SVG}" -resize 432x432 \
    -gravity center -extent 512x512 "${ICONS_DIR}/icon-maskable-512x512.png"

# Generate shortcut icons (96x96)
echo "Generating shortcut icons..."
for SHORTCUT in "today" "map" "favorites"; do
    cp "${ICONS_DIR}/icon-96x96.png" "${ICONS_DIR}/shortcut-${SHORTCUT}-96x96.png"
    echo "  ✓ Created shortcut-${SHORTCUT}-96x96.png"
done

# Generate favicon
echo "Generating favicon.ico..."
convert "${ICONS_DIR}/icon-72x72.png" "${ICONS_DIR}/icon-96x96.png" \
    "${ICONS_DIR}/icon-128x128.png" "public/favicon.ico"

# Generate apple-touch-icon
echo "Generating apple-touch-icon.png..."
convert -background "#005892" -density 300 "${TEMP_SVG}" -resize 180x180 "public/apple-touch-icon.png"

echo ""
echo "✓ All icons generated successfully!"
echo "Generated files:"
ls -lh "${ICONS_DIR}"/*.png | awk '{print "  " $9 " - " $5}'
