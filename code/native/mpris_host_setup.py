#!/usr/bin/env python3

import os
import sys
import json
import logging
import argparse

log = logging.getLogger(__name__)

HOST_FILENAME = "streamkeys_mpris.py"
HOST_MANIFEST_FILENAME = "org.mpris.streamkeys_host.json"
CHROME_HOST_MANIFEST = {
  "name": "org.mpris.streamkeys_host",
  "description": "Streamkeys MPRIS native messaging host",
  "path": None,
  "type": "stdio",
  "allowed_origins": []
}
FIREFOX_HOST_MANIFEST = {
  "name": "org.mpris.streamkeys_host",
  "description": "Streamkeys MPRIS native messaging host",
  "path": None,
  "type": "stdio",
  "allowed_extensions": []
}
FIREFOX_EXT_ID = "streamkeys@streamkeys.com"
XDG_CONFIG_HOME = os.environ.get("XDG_CONFIG_HOME",
                                 default=os.path.expanduser("~/.config"))


def initialize_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", dest="install_dir",
                        default=os.path.join(XDG_CONFIG_HOME, "streamkeys"),
                        help="The directory to install the host script")
    subparsers = parser.add_subparsers(title="Commands", metavar="")

    p = subparsers.add_parser("install",
                              help="Install the native messaging host")
    p.add_argument("id", help="The extension ID")
    p.set_defaults(func=main_install, firefox=False)

    p = subparsers.add_parser("uninstall",
                              help="Uninstall the native messaging host")
    p.set_defaults(func=main_uninstall, firefox=False)

    p = subparsers.add_parser("install-ff",
                              help="Install the native messaging host for"
                                   " Firefox instead of Chrome")
    p.add_argument("--id", default=FIREFOX_EXT_ID, help="The extension ID")
    p.set_defaults(func=main_install, firefox=True)

    p = subparsers.add_parser("uninstall-ff",
                              help="Uninstall the native messaging host for"
                                   " Firefox instead of Chrome")
    p.set_defaults(func=main_uninstall, firefox=True)
    return parser


def get_chrome_xdg_config_paths():
    return [os.path.join(XDG_CONFIG_HOME, "chromium"),
            os.path.join(XDG_CONFIG_HOME, "google-chrome")]


def get_chrome_manifest_paths():
    paths = []
    xdg_paths = get_chrome_xdg_config_paths()
    for path in xdg_paths:
        if not os.path.exists(path):
            continue
        message_hosts = os.path.join(path, "NativeMessagingHosts")
        manifest_path = os.path.join(message_hosts, HOST_MANIFEST_FILENAME)
        paths.append(manifest_path)
    return paths


def get_firefox_manifest_paths():
    paths = []
    message_hosts = os.path.expanduser("~/.mozilla/native-messaging-hosts")
    manifest_path = os.path.join(message_hosts, HOST_MANIFEST_FILENAME)
    paths.append(manifest_path)
    return paths


def install_host(ext_id, install_dir, firefox=False):
    # Copy the host script
    host_path = os.path.join(install_dir, HOST_FILENAME)
    os.makedirs(install_dir, exist_ok=True)
    src = os.path.join(os.path.dirname(os.path.realpath(__file__)), "mpris.py")
    with open(src, "rb") as f:
        data = f.read()
    with open(host_path, "wb") as f:
        f.write(data)
    os.chmod(host_path, 0o744)

    # Create the manifest file
    if firefox:
        manifest_paths = get_firefox_manifest_paths()
        manifest = dict(FIREFOX_HOST_MANIFEST)
        manifest["path"] = host_path
        manifest["allowed_extensions"].append(ext_id)
    else:
        manifest_paths = get_chrome_manifest_paths()
        manifest = dict(CHROME_HOST_MANIFEST)
        manifest["path"] = host_path
        manifest["allowed_origins"].append("chrome-extension://%s/" % ext_id)

    for path in manifest_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(manifest, f, indent=2)
        os.chmod(path, 0o644)


def uninstall_host(install_dir, firefox=False):
    # Remove host script
    host_path = os.path.join(install_dir, HOST_FILENAME)
    if os.path.isfile(host_path):
        os.remove(host_path)

    # Remove manifest file
    if firefox:
        manifest_paths = get_firefox_manifest_paths()
    else:
        manifest_paths = get_chrome_manifest_paths()

    for path in manifest_paths:
        if os.path.isfile(path):
            os.remove(path)


def setup_logger(level=logging.DEBUG):
    log = logging.getLogger()
    log.setLevel(level)
    stream = logging.StreamHandler(sys.stdout)
    stream.setLevel(level)
    log.addHandler(stream)
    return log


def main():
    global log

    parser = initialize_parser()
    args = parser.parse_args()
    log = setup_logger()

    return args.func(args)


def main_install(args):
    if not args.firefox:
        # Chrome's extension IDs are in hexadecimal but using a-p, referred
        # internally as "mpdecimal". See https://stackoverflow.com/a/2050916
        if (len(args.id) != 32
                or any(ord(c) not in range(97, 113) for c in args.id)):
            raise RuntimeError("Not valid extension ID: %s" % args.id)

    try:
        from gi.repository import GLib, Gio  # noqa: F401
    except ImportError:
        raise RuntimeError("Required dependency `python3-gobject' not"
                           " found")

    try:
        import pydbus  # noqa: F401
    except ImportError:
        raise RuntimeError("Required dependency `python3-pydbus' not"
                           " found")

    install_host(args.id, args.install_dir, firefox=args.firefox)


def main_uninstall(args):
    uninstall_host(args.install_dir, firefox=args.firefox)


if __name__ == "__main__":
    sys.exit(main())
