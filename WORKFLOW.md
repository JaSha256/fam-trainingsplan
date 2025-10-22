# FAM Trainingsplan - Development Workflow

Quick reference for the multi-project Arch Linux development setup.

## 🚀 Quick Start

```zsh
# Navigate to project (with zoxide)
z fam

# Show available commands
just

# Start development server
just dev

# Run tests
just test-e2e-ui
```

## 📋 Universal Commands

These work in any Node.js project with our setup:

| Command       | Description                               |
| ------------- | ----------------------------------------- |
| `just`        | Show available just commands              |
| `j`           | Shortcut for `just`                       |
| `jl`          | Shortcut for `just --list`                |
| `dev`         | Start dev server (auto-detects framework) |
| `pinfo`       | Show project information                  |
| `ctx`         | Show current context (git, node, env)     |
| `nr <script>` | Run npm script (shortcut for `npm run`)   |
| `scripts`     | List all npm scripts                      |
| `ntest`       | Quick test runner                         |
| `nbuild`      | Quick build                               |
| `nclean`      | Clean reinstall (removes node_modules)    |

## 🔨 Project-Specific Commands (via just)

### Development

```zsh
just dev              # Start dev server (port 5173)
just dev-open         # Start dev server and open browser
just build            # Build for production
just preview          # Preview production build
```

### Testing

```zsh
just test             # Run all tests
just test-unit        # Unit tests only
just test-unit-watch  # Unit tests in watch mode
just test-unit-ui     # Unit tests with UI
just test-integration # Integration tests
just test-e2e         # E2E tests
just test-e2e-ui      # E2E tests with UI (recommended)
just test-e2e-debug   # E2E tests in debug mode
just test-visual      # Visual regression tests
just test-a11y        # Accessibility tests
just test-perf        # Performance tests
just test-pwa         # PWA offline tests
just test-coverage    # Run tests with coverage
just test-all         # Full test suite
```

### Code Quality

```zsh
just typecheck        # TypeScript type checking
just typecheck-watch  # TypeScript in watch mode
just lint             # Run ESLint
just format           # Format code with Prettier
just check            # Run typecheck + lint
```

### Dependencies

```zsh
just install          # Install dependencies
just clean-install    # Clean install (remove node_modules first)
just update           # Update dependencies
just outdated         # Check for outdated packages
```

### Git Helpers

```zsh
just status           # Enhanced git status
just commit "message" # Stage all and commit
just push             # Push to current branch
just pull             # Pull with rebase
just log              # Show git log (last 10)
```

### Maintenance

```zsh
just clean            # Clean build artifacts
just clean-all        # Clean everything (including node_modules)
just info             # Show project info
```

### Workflows

```zsh
just setup            # Full setup (install + typecheck + ready to dev)
just ci               # CI workflow (install, typecheck, lint, test, build)
just pre-release      # Pre-release checks
```

## ⌨️ Kitty Keybindings

### Tab Management (Multi-Project)

```
Ctrl+Shift+T           New tab with current directory
Ctrl+Shift+W           Close tab
Ctrl+Shift+1-9         Jump to tab 1-9
Ctrl+Shift+Left/Right  Previous/Next tab
Ctrl+Shift+,/.         Move tab backward/forward
Ctrl+Shift+Alt+R       Rename tab
```

### Window Management (Splits)

```
Ctrl+Shift+Enter       New split with current directory
Ctrl+Shift+Q           Close split
Ctrl+Shift+[/]         Previous/Next split
Alt+Arrow              Navigate splits
Ctrl+Shift+R           Resize mode
```

### Layout

```
Ctrl+Shift+L           Cycle layouts
Ctrl+Shift+Alt+T       Tall layout
Ctrl+Shift+Alt+S       Splits layout
Ctrl+Shift+Alt+G       Grid layout
```

## 🎯 Multi-Project Workflow

### Recommended Setup in Kitty

```zsh
# Open Kitty

# Tab 1: FAM Trainingsplan
z fam && just dev

# Tab 2 (Ctrl+Shift+T): Another project
z other-project && just dev

# Tab 3 (Ctrl+Shift+T): System tasks
htop

# Switch between tabs: Ctrl+Shift+1/2/3
# Or: Ctrl+Shift+Left/Right
```

### Within a Tab (using splits)

```zsh
# Pane 1: Dev server running
just dev

# Pane 2 (Ctrl+Shift+Enter): Run tests
just test-unit-watch

# Pane 3 (Ctrl+Shift+Enter): Git operations
just status

# Navigate: Alt+Arrow keys
```

## 🔧 Environment (.envrc)

Automatically loaded when entering project directory:

```bash
NODE_ENV=development
PATH includes node_modules/.bin
VITE_PORT=5173
```

To apply changes to `.envrc`:

```zsh
direnv allow .
```

## 📚 Context Helpers

### Check Current Context

```zsh
ctx
# Shows: directory, git branch, node version, project info, direnv, just
```

### Project Information

```zsh
pinfo
# Shows: name, version, description, dependencies, scripts
```

### List Available Scripts

```zsh
scripts
# Lists all npm scripts with their commands
```

## 🎨 Customization

### Add Custom just Commands

Edit `justfile`:

```make
# My custom command
my-command:
    echo "Running custom command"
    npm run custom-script
```

### Add Project Environment Variables

Edit `.envrc`:

```bash
export MY_VAR="value"
```

Then: `direnv allow .`

### Add Universal zsh Functions

Edit `~/.config/zshrc/custom/30-multi-project-tools` or create new file in:

```
~/.config/zshrc/custom/50-my-functions
```

## 🐛 Troubleshooting

### direnv not loading

```zsh
direnv allow .
```

### Node version issues

```zsh
which node        # Should show /usr/bin/node
node --version    # Should show v24.9.0
```

### just command not found

```zsh
sudo pacman -S just
```

### Functions not available

```zsh
# Restart shell
exec zsh
```

### Kitty config not loading

- Close and reopen Kitty
- Check `~/.config/kitty/custom.conf` exists

## 📁 Setup Files

```
~/.config/zshrc/custom/30-multi-project-tools  # Universal functions
~/.config/kitty/custom.conf                     # Kitty keybindings
~/workspace/FAM/fam-trainingsplan/.envrc        # Project environment
~/workspace/FAM/fam-trainingsplan/justfile      # Project commands
```

## 🔄 For New Projects

Copy setup files:

```zsh
# In new project directory
cp ~/workspace/FAM/fam-trainingsplan/.envrc .
cp ~/workspace/FAM/fam-trainingsplan/justfile .

# Edit for your project
$EDITOR .envrc
$EDITOR justfile

# Allow direnv
direnv allow .
```

## 💡 Tips

1. **Use zoxide shortcuts**: After visiting a directory once, use `z fam`
   instead of full path
2. **Use just for consistency**: Same commands work across all projects
3. **Use Kitty tabs**: One tab per project, splits within tabs
4. **Use ctx**: Quick overview of current environment
5. **Rename tabs**: `Ctrl+Shift+Alt+R` to name tabs by project

## 🚦 Common Workflows

### Start Day

```zsh
# Tab 1: Main project
z fam && just dev

# Tab 2: Tests
z fam && just test-unit-watch

# Tab 3: Other project
z other && just dev
```

### Before Commit

```zsh
just check        # Typecheck + lint
just test         # Run tests
just status       # Review changes
just commit "fix: update feature"
```

### Before Push

```zsh
just ci           # Full CI checks
just push         # Push to remote
```

---

**Last updated**: 2025-10-21 **Setup version**: Arch Linux Multi-Project v1.0
