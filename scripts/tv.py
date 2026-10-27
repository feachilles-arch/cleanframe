"""Connect, inspect, install or launch CleanFrame. These commands preserve Home/startup settings."""
import argparse
import hashlib
import re
import subprocess
import time
import xml.etree.ElementTree as XML

from tizen_tools import ROOT, config, host, tool

parser = argparse.ArgumentParser()
parser.add_argument('action', choices=['info', 'apps', 'install', 'launch'])
parser.add_argument('--host')
args = parser.parse_args()
settings = config()
address = host(settings, args.host)
_, sdb = tool(settings, 'tools/sdb')
if not sdb:
    raise SystemExit('SDB not found. Install Samsung\'s TV SDK (Tizen Studio) or set "sdk" in .local/device.json. See SETUP-DE.md.')
manifest = XML.parse(ROOT / 'app/config.xml').getroot()
app_id = manifest.find('{http://tizen.org/ns/widgets}application').get('id')


def run(*command, quiet=False):
    result = subprocess.run([str(sdb), *command], text=True, capture_output=True, timeout=45)
    output = result.stdout + result.stderr
    if not quiet:
        print(output, end='' if output.endswith('\n') else '\n', flush=True)
    if result.returncode:
        raise SystemExit('SDB command failed.')
    return output


serial = address + ':26101'
connected = run('connect', serial)
if 'connected to ' not in connected.lower() and 'already connected' not in connected.lower():
    raise SystemExit('TV connection was not confirmed. Check Developer Mode, the Host PC IP and that both devices share a network.')
if args.action == 'info':
    run('-s', serial, 'capability')
elif args.action == 'apps':
    # Read-only: lists installed app IDs so Home shortcuts can use this TV's real IDs.
    listing = run('-s', serial, 'shell', '0', 'applist', quiet=True)
    rows = re.findall(r"'([^']*)'\s+'([A-Za-z0-9][\w.-]+)'", listing)
    for name, identifier in sorted(rows, key=lambda row: row[0].lower()):
        print(identifier.ljust(48) + name)
    if not rows:
        print(listing)
elif args.action == 'launch':
    output = run('-s', serial, 'shell', '0', 'execute', app_id)
    if 'successfully launched' not in output:
        raise SystemExit('App launch was not confirmed. Check the TV.')
else:
    widget = ROOT / 'dist/CleanFrame.wgt'
    if not widget.exists():
        raise SystemExit('Run npm run package first.')
    digest = hashlib.sha256(widget.read_bytes()).hexdigest()[:12]
    remote = '/home/owner/share/tmp/sdk_tools/CleanFrame-' + digest + '-' + str(time.time_ns()) + '.wgt'
    pushed = run('-s', serial, 'push', str(widget), remote)
    if '1 file(s) pushed' not in pushed or 'failed' in pushed.lower():
        raise SystemExit('Widget transfer was not confirmed.')
    output = run('-s', serial, 'shell', '0', 'vd_appinstall', app_id, remote)
    if 'install completed' not in output or 'install failed' in output:
        raise SystemExit('TV installation failed or was not confirmed.')
    installed = run('-s', serial, 'shell', '0', 'applist', quiet=True)
    if app_id not in installed:
        raise SystemExit('App was not found in the installed-app list.')
    print('CleanFrame installation confirmed. Startup defaults are unchanged.')
