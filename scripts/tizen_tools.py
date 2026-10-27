"""Locate the official Samsung/Tizen tools and the private local configuration.

Nothing here is committed: the TV address, signing profile and SDK location live in
ignored .local/device.json. Example:

    {"host": "192.168.1.50", "profile": "MyFrame", "sdk": "/Users/me/tizen-studio"}

Only "host" is required for TV commands. "sdk" defaults to .local/tizen-sdk, then
~/tizen-studio. "profile" is the certificate profile created in Certificate Manager.
"""
from pathlib import Path
import ipaddress
import json
import os

ROOT = Path(__file__).resolve().parents[1]
CONFIG_FILE = ROOT / '.local/device.json'
WINDOWS = os.name == 'nt'


def config():
    if not CONFIG_FILE.exists():
        return {}
    value = json.loads(CONFIG_FILE.read_text())
    if not isinstance(value, dict):
        raise SystemExit('.local/device.json must contain a JSON object.')
    return value


def sdk_roots(settings):
    candidates = [settings.get('sdk'), os.environ.get('TIZEN_SDK'), ROOT / '.local/tizen-sdk', Path.home() / 'tizen-studio']
    return [Path(c).expanduser() for c in candidates if c]


def tool(settings, relative):
    """Return the first existing SDK tool, e.g. tools/sdb or tools/ide/bin/tizen."""
    suffixes = ['.exe', '.bat', ''] if WINDOWS else ['']
    for sdk in sdk_roots(settings):
        for suffix in suffixes:
            path = sdk / (relative + suffix)
            if path.exists():
                return sdk, path
    return None, None


def host(settings, override=None):
    value = override or settings.get('host')
    if not value:
        raise SystemExit('Add your TV address to .local/device.json, e.g. {"host": "192.168.1.50"}, or pass --host.')
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        raise SystemExit('The TV host must be a local IP address, not a name: ' + str(value))
    if not address.is_private:
        raise SystemExit('Refusing a non-local TV address. Developer access belongs on your home network only.')
    return str(address)
