#!/usr/bin/env bash
# Run on the Debian server: bash deploy-caddy.sh <site.tar.gz> <release-id>
set -euo pipefail

payload=${1:?Provide the uploaded static-site archive}
release_id=${2:?Provide a unique release identifier}
case "$release_id" in
  ''|*[!a-zA-Z0-9._-]*) echo 'Invalid release identifier' >&2; exit 1 ;;
esac
base=/srv/evolve-emon
config=/etc/caddy/Caddyfile
release="$base/releases/$release_id"
test -f "$payload"
test -f "$config"
test ! -e "$release"
command -v caddy >/dev/null
command -v python3 >/dev/null
install -d -m 755 "$base/releases"
mkdir -m 755 "$release"
tar -xzf "$payload" -C "$release"
chmod -R a+rX "$release"
test -f "$release/index.html"
test -f "$release/source.tar.gz"

candidate=$(mktemp /etc/caddy/Caddyfile.evolve.XXXXXX)
trap 'rm -f "$candidate"' EXIT
python3 - "$config" "$candidate" <<'PY'
import pathlib
import re
import sys

original = pathlib.Path(sys.argv[1]).read_text()
if '\t@evolve host 192.236.223.253\n' in original:
    raise SystemExit('Remove the retired IP game route before deployment')
site = re.search(r'^evo\.emonxu\.top\s*\{([^{}]*)\}', original, re.M)
if not site or not re.search(r'^\s*root \* /srv/evolve-emon/current\s*$', site[1], re.M):
    raise SystemExit('Configure the evo.emonxu.top site before deployment')
pathlib.Path(sys.argv[2]).write_text(original)
PY
caddy validate --config "$candidate" --adapter caddyfile
backup="$config.evolve-backup-$release_id"
test ! -e "$backup"
cp -p "$config" "$backup"
previous=$(readlink "$base/current" || true)
if test -e "$base/current" && ! test -L "$base/current"; then
  echo 'Current release path is not a symlink; inspect before deployment' >&2
  exit 1
fi
ln -s "$release" "$base/current.next-$release_id"
mv -Tf "$base/current.next-$release_id" "$base/current"
install -m 644 "$candidate" "$config"

rollback() {
  cp -p "$backup" "$config"
  if test -n "$previous"; then
    ln -s "$previous" "$base/current.rollback-$release_id"
    mv -Tf "$base/current.rollback-$release_id" "$base/current"
  else
    rm -f "$base/current"
  fi
  systemctl reload caddy
}
if ! systemctl reload caddy; then
  rollback
  exit 1
fi
for resource in '' evolve/main.js source.html source.tar.gz LICENSE; do
  if ! curl --fail --silent --output /dev/null --resolve evo.emonxu.top:443:127.0.0.1 "https://evo.emonxu.top/$resource"; then
    rollback
    exit 1
  fi
done
printf 'Deployed %s\nConfig backup: %s\nURL: https://evo.emonxu.top/\n' "$release" "$backup"
