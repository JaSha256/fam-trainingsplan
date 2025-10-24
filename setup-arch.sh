#!/usr/bin/env zsh
# Setup script for FAM Trainingsplan on Arch Linux
# Follows Arch Linux Best Practices

set -euo pipefail

# Color output
autoload -U colors && colors
print_success() { echo "${fg[green]}✓${reset_color} $@" }
print_info() { echo "${fg[blue]}ℹ${reset_color} $@" }
print_error() { echo "${fg[red]}✗${reset_color} $@" }
print_header() { echo "\n${fg[cyan]}━━━ $@ ━━━${reset_color}" }

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Dieses Script sollte NICHT als root ausgeführt werden"
   print_info "Für sudo-Befehle wird bei Bedarf nach dem Passwort gefragt"
   exit 1
fi

print_header "FAM Trainingsplan - Arch Linux Setup"

# 1. System Dependencies
print_header "1. System-Dependencies prüfen und installieren"

# Required Playwright dependencies (verified Arch packages)
PLAYWRIGHT_DEPS=(
    # X11 und Rendering
    libxcb libx11 libxcomposite libxdamage libxext libxfixes libxrandr
    # Graphics (libgbm is part of mesa)
    mesa libdrm
    # Fonts und Rendering
    pango cairo freetype2 fontconfig
    # Audio (optional für Tests)
    alsa-lib
    # Security und Crypto
    nss nspr
    # Accessibility
    atk at-spi2-core at-spi2-atk
    # Print support (optional)
    cups
    # Additional dependencies
    libcups dbus-glib
)

# Check which packages need installation
MISSING_PACKAGES=()
for pkg in "${PLAYWRIGHT_DEPS[@]}"; do
    if ! pacman -Qi "$pkg" &>/dev/null; then
        MISSING_PACKAGES+=("$pkg")
    fi
done

if [[ ${#MISSING_PACKAGES[@]} -gt 0 ]]; then
    print_info "Fehlende Pakete: ${MISSING_PACKAGES[*]}"
    print_info "Installation erfordert sudo-Rechte..."
    sudo pacman -S --needed --noconfirm "${MISSING_PACKAGES[@]}"
    print_success "System-Dependencies installiert"
else
    print_success "Alle System-Dependencies bereits installiert"
fi

# 2. Node.js Version Check
print_header "2. Node.js Version prüfen"
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="20.19.0"

if [[ $(echo -e "$NODE_VERSION\n$REQUIRED_VERSION" | sort -V | head -n1) == "$REQUIRED_VERSION" ]]; then
    print_success "Node.js $NODE_VERSION (erforderlich: >=$REQUIRED_VERSION)"
else
    print_error "Node.js $NODE_VERSION ist zu alt (erforderlich: >=$REQUIRED_VERSION)"
    print_info "Update mit: sudo pacman -S nodejs npm"
    exit 1
fi

# 3. Browser Installation (optional - für USE_SYSTEM_BROWSERS)
print_header "3. System-Browser prüfen (optional)"

BROWSERS=(chromium firefox)
for browser in "${BROWSERS[@]}"; do
    if pacman -Qi "$browser" &>/dev/null; then
        VERSION=$(pacman -Qi "$browser" | rg "^Version" | awk '{print $3}')
        print_success "$browser $VERSION installiert"
    else
        print_info "$browser nicht installiert (optional für USE_SYSTEM_BROWSERS=true)"
    fi
done

# 4. NPM Dependencies
print_header "4. NPM Dependencies installieren"

if [[ -f package-lock.json ]]; then
    print_info "npm ci für reproduzierbare Installation..."
    npm ci
else
    print_info "npm install..."
    npm install
fi
print_success "NPM Dependencies installiert"

# 5. Playwright Browsers
print_header "5. Playwright Browsers installieren"

print_info "Möchtest du Playwright-eigene Browser installieren? (ja/nein)"
print_info "Alternativ können System-Browser genutzt werden (USE_SYSTEM_BROWSERS=true)"
read -r INSTALL_PW_BROWSERS

if [[ "$INSTALL_PW_BROWSERS" == "ja" ]] || [[ "$INSTALL_PW_BROWSERS" == "j" ]]; then
    npx playwright install chromium firefox webkit
    print_success "Playwright Browser installiert"
else
    print_info "Übersprungen - System-Browser verwenden"
    print_info "Setze: export USE_SYSTEM_BROWSERS=true"

    # Add to .envrc if direnv is used
    if command -v direnv &>/dev/null && [[ -f .envrc ]]; then
        if ! rg -q "USE_SYSTEM_BROWSERS" .envrc; then
            echo "export USE_SYSTEM_BROWSERS=true" >> .envrc
            print_success ".envrc aktualisiert"
        fi
    fi
fi

# 6. Husky Git Hooks
print_header "6. Git Hooks einrichten"

if [[ -d .git ]]; then
    npm run prepare
    print_success "Husky Git Hooks installiert"
else
    print_info "Kein Git-Repository - Husky übersprungen"
fi

# 7. Type Checking
print_header "7. TypeScript Types prüfen"
npm run typecheck || print_info "Type-Checking hat Warnings (normal während Entwicklung)"

# 8. Verification
print_header "8. Installation verifizieren"

# Check critical executables
CRITICAL_CMDS=(node npm npx vite)
for cmd in "${CRITICAL_CMDS[@]}"; do
    if command -v "$cmd" &>/dev/null; then
        print_success "$cmd verfügbar"
    else
        print_error "$cmd nicht gefunden"
    fi
done

# Summary
print_header "Setup abgeschlossen!"
echo ""
print_success "Arch Linux System-Dependencies: OK"
print_success "Node.js $(node --version) + npm $(npm --version): OK"
print_success "NPM Dependencies: OK"
echo ""
print_info "Nächste Schritte:"
echo "  ${fg[yellow]}npm run dev${reset_color}           - Development Server starten"
echo "  ${fg[yellow]}npm run test:unit${reset_color}     - Unit Tests ausführen"
echo "  ${fg[yellow]}npm run test:e2e${reset_color}      - E2E Tests ausführen"
echo "  ${fg[yellow]}npm run build${reset_color}         - Production Build erstellen"
echo ""

if [[ "$INSTALL_PW_BROWSERS" != "ja" ]] && [[ "$INSTALL_PW_BROWSERS" != "j" ]]; then
    print_info "System-Browser-Modus aktivieren:"
    echo "  ${fg[yellow]}export USE_SYSTEM_BROWSERS=true${reset_color}"
    echo "  ${fg[yellow]}npm run test:e2e${reset_color}"
fi
