"""Build and sign CleanFrame with the official Samsung/Tizen SDK.

Two signing routes:
- Tizen Studio (default): the certificate profile you created in Certificate Manager,
  named by "profile" in .local/device.json. The SDK may ask for its password in this terminal.
- Reference machine: SDK, certificates and generated password copied into .local/
  (.local/certificates/private/). The password is supplied and redacted automatically.
"""
from pathlib import Path
import os
import subprocess
import time
import xml.etree.ElementTree as XML
import zipfile
from font_assets import write_widget_archive
from tizen_tools import ROOT, config, tool

settings = config()
SDK, CLI = tool(settings, 'tools/ide/bin/tizen')
if not CLI:
    raise SystemExit('Tizen CLI not found. Install Samsung\'s TV SDK (Tizen Studio) or set "sdk" in .local/device.json. See SETUP-DE.md.')
PRIVATE = ROOT / '.local/certificates/private'
password_file = PRIVATE / 'certificate-password.txt'
reference = password_file.exists()
profile_name = settings.get('profile') or ('FrameHome' if reference else '')
if not profile_name:
    raise SystemExit('Add your certificate profile name to .local/device.json, e.g. {"profile": "MyFrame"}. See SETUP-DE.md.')
dist = ROOT / 'dist'
dist.mkdir(exist_ok=True)
unsigned = dist / 'CleanFrame-unsigned.wgt'
signed_dir = dist / 'signed'
signed_dir.mkdir(exist_ok=True)
command = [str(CLI), 'package', '-t', 'wgt', '-s', profile_name, '-o', str(signed_dir), '--', str(unsigned)]


def sign_reference():
    # pty is POSIX-only; this route is the maintainer's macOS setup.
    import pty
    import select
    import signal
    password = password_file.read_bytes().strip()
    if not password:
        raise SystemExit('Signing password is empty.')
    data = SDK / 'data'
    data.mkdir(exist_ok=True)
    (SDK / 'sdk.info').write_text('TIZEN_SDK_INSTALLED_PATH=' + str(SDK) + '\nTIZEN_SDK_DATA_PATH=' + str(data) + '\nJDK_PATH=' + str(SDK / 'jdk') + '\n')
    profile = PRIVATE / 'profiles.xml'
    tree = XML.parse(profile)
    for item in tree.getroot().iter('profileitem'):
        for key in ['key', 'ca', 'rootca']:
            value = item.get(key)
            if value:
                folder = PRIVATE if key == 'key' else PRIVATE.parent / 'ca'
                item.set(key, str(folder / Path(value).name))
    tree.write(profile, encoding='UTF-8', xml_declaration=True)
    profile.chmod(0o600)
    result = subprocess.run([str(CLI), 'cli-config', 'default.profiles.path=' + str(profile)], capture_output=True, timeout=30)
    if result.returncode:
        raise SystemExit('SDK signing profile configuration failed.')
    write_widget_archive(unsigned)
    pid, terminal = pty.fork()
    if pid == 0:
        os.execv(command[0], command)
    output = b''
    passwords = saves = 0
    deadline = time.monotonic() + 60
    try:
        while time.monotonic() < deadline:
            ready, _, _ = select.select([terminal], [], [], 1)
            if ready:
                try:
                    chunk = os.read(terminal, 8192)
                except OSError:
                    break
                if not chunk:
                    break
                output += chunk
                count = output.lower().count(b'password:')
                if count > passwords:
                    os.write(terminal, password + b'\n')
                    passwords = count
                count = output.count(b'No: (N) ?')
                if count > saves:
                    os.write(terminal, b'n\n')
                    saves = count
        else:
            os.kill(pid, signal.SIGTERM)
            raise SystemExit('SDK signing timed out.')
    finally:
        os.close(terminal)
    os.waitpid(pid, 0)
    redacted = output.replace(password, b'[redacted]').decode(errors='replace')
    if 'is created successfully' not in redacted:
        print(redacted)
        raise SystemExit('SDK did not confirm a signed package.')


def sign_with_studio():
    # The SDK talks to you directly, so any password prompt stays in your terminal.
    write_widget_archive(unsigned)
    result = subprocess.run(command, timeout=300)
    if result.returncode:
        raise SystemExit('Signing failed. Check the profile name in .local/device.json and Certificate Manager.')


sign_reference() if reference else sign_with_studio()
signed = signed_dir / unsigned.name
with zipfile.ZipFile(signed) as package:
    if not {'author-signature.xml', 'signature1.xml'}.issubset(package.namelist()):
        raise SystemExit('Package is missing its signing files.')
target = dist / 'CleanFrame.wgt'
target.write_bytes(signed.read_bytes())
print('Signed widget created: ' + str(target))
