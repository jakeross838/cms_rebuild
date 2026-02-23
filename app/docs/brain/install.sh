#!/bin/bash
# ╔══════════════════════════════════════════════════════════╗
# ║  Ross Built Brain — One-Command Setup                   ║
# ║  Run this in your project root:                         ║
# ║  bash install.sh                                        ║
# ╚══════════════════════════════════════════════════════════╝

set -e

echo "🧠 Installing Ross Built Brain..."
echo ""

# ── Create directories ───────────────────────────────────
mkdir -p docs/brain/scripts
mkdir -p .claude/agents

# ── Copy core files (only if they don't exist) ──────────
copy_if_missing() {
  local src="$1"
  local dest="$2"
  if [ ! -f "$dest" ]; then
    cp "$src" "$dest"
    echo "  ✅ Created $dest"
  else
    echo "  ⏭️  Skipped $dest (already exists)"
  fi
}

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Core brain files
copy_if_missing "$SCRIPT_DIR/docs/brain/feature-map.md" "docs/brain/feature-map.md"
copy_if_missing "$SCRIPT_DIR/docs/brain/intent-log.md" "docs/brain/intent-log.md"
copy_if_missing "$SCRIPT_DIR/docs/brain/secrets.local.md" "docs/brain/secrets.local.md"
copy_if_missing "$SCRIPT_DIR/docs/brain/test-matrix.md" "docs/brain/test-matrix.md"
copy_if_missing "$SCRIPT_DIR/docs/brain/scripts/scan.js" "docs/brain/scripts/scan.js"

# Agent
copy_if_missing "$SCRIPT_DIR/.claude/agents/brain-tracker.md" ".claude/agents/brain-tracker.md"

# ── Update .gitignore ───────────────────────────────────
GITIGNORE=".gitignore"
ENTRIES=(
  "docs/brain/secrets.local.md"
  "CLAUDE.local.md"
)

for entry in "${ENTRIES[@]}"; do
  if [ -f "$GITIGNORE" ]; then
    if ! grep -qF "$entry" "$GITIGNORE"; then
      echo "$entry" >> "$GITIGNORE"
      echo "  ✅ Added $entry to .gitignore"
    fi
  else
    echo "$entry" > "$GITIGNORE"
    echo "  ✅ Created .gitignore with $entry"
  fi
done

# ── Merge CLAUDE.md ─────────────────────────────────────
if [ -f "CLAUDE.md" ]; then
  echo ""
  echo "  ⚠️  CLAUDE.md already exists in your project."
  echo "  Please manually add these lines to the TOP of your CLAUDE.md:"
  echo ""
  echo '  @docs/brain/feature-map.md'
  echo '  @docs/brain/intent-log.md'
  echo '  @docs/brain/secrets.local.md'
  echo '  @docs/brain/test-matrix.md'
  echo ""
  echo '  ## Post-Session Rule'
  echo '  After EVERY coding task, run the brain-tracker agent to update the feature map.'
  echo ""
else
  cp "$SCRIPT_DIR/CLAUDE.md" "CLAUDE.md"
  echo "  ✅ Created CLAUDE.md"
fi

# ── Initial scan ────────────────────────────────────────
echo ""
echo "🔍 Running initial scan..."
node docs/brain/scripts/scan.js . --credentials > /tmp/brain-initial-scan.json 2>/dev/null && \
  echo "  ✅ Initial scan complete — $(cat /tmp/brain-initial-scan.json | grep -o '"filesWithElements":[0-9]*' | cut -d: -f2) files with interactive elements found" || \
  echo "  ⚠️  Scan found no files yet (that's OK if this is a new project)"

# ── Git hook (optional) ─────────────────────────────────
echo ""
read -p "📎 Install post-commit git hook for auto-tracking? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  mkdir -p .git/hooks
  cat > .git/hooks/post-commit << 'HOOK'
#!/bin/bash
# Auto-scan after every commit
echo "🧠 Brain: Scanning changes..."
node docs/brain/scripts/scan.js . --changed-only > /tmp/brain-latest-scan.json 2>/dev/null
ELEMENTS=$(cat /tmp/brain-latest-scan.json 2>/dev/null | grep -o '"totalElements":[0-9]*' | cut -d: -f2)
echo "🧠 Brain: Found ${ELEMENTS:-0} interactive elements in changed files"
echo "💡 Run 'update the brain' in Claude Code to process these changes"
HOOK
  chmod +x .git/hooks/post-commit
  echo "  ✅ Git hook installed"
else
  echo "  ⏭️  Skipped git hook"
fi

# ── Done ────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🧠 Brain installed successfully!                       ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  Now in Claude Code, just say:                           ║"
echo "║                                                          ║"
echo "║    'update the brain'        → scan & track everything   ║"
echo "║    'what have we built'      → see the feature map       ║"
echo "║    'test the CMS'            → run tests from matrix     ║"
echo "║    'show the test matrix'    → see all test cases        ║"
echo "║                                                          ║"
echo "║  The brain auto-tracks after every coding session.       ║"
echo "║  It gets smarter every time you use it.                  ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
