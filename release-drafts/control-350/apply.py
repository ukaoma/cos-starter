#!/usr/bin/env python3
"""Prepare only local release pages. This never publishes, installs or changes a tag."""
from __future__ import annotations

import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re

DRAFT = Path(__file__).resolve().parent
ROOT = DRAFT.parents[1]


def render(root: Path, plan: dict, release: dict | None = None) -> dict[str, str]:
    appcast_path = root / 'control/appcast.json'
    if hashlib.sha256(appcast_path.read_bytes()).hexdigest() != plan['appcastSha256']:
        raise ValueError('Appcast changed since this draft; reconcile its notice/history before applying')
    variables = {
        '{{CONTROL_URL}}': release['url'] if release else '{{CONTROL_URL}}',
        '{{CONTROL_SHA256}}': release['sha256'] if release else '{{CONTROL_SHA256}}',
        '{{RELEASE_DATE}}': release['publishedAt'][:10] if release else '{{RELEASE_DATE}}',
    }
    outputs: dict[str, str] = {}
    for patch in plan['patches']:
        name = patch['file']
        if name not in outputs:
            outputs[name] = (root / name).read_text()
        before, after = patch['before'], patch['after']
        if outputs[name].count(before) != 1:
            raise ValueError(f'{name}: current-claim anchor no longer unique: {before[:100]!r}')
        for old, new in variables.items():
            after = after.replace(old, new)
        outputs[name] = outputs[name].replace(before, after, 1)
    if release:
        appcast = json.loads(appcast_path.read_text())
        # Preserve the stable notice and every field this draft does not own.
        previous_sections = appcast['channels']['stable'].get('whatsNew', {}).get('sections', [])
        whats_new = {**release['whatsNew'], 'sections': [*release['whatsNew']['sections'], *previous_sections]}
        appcast['channels']['stable'].update({**release, 'whatsNew': whats_new})
        outputs['control/appcast.json'] = json.dumps(appcast, ensure_ascii=False, indent=2) + '\n'
        if any('{{' in text for text in outputs.values()):
            raise ValueError('Unresolved draft placeholder; no file was changed')
    return outputs


def verify_artifacts(directory: Path, release: dict) -> None:
    expected = ('0.5.350', 404, '6.92.1')
    actual = (release.get('version'), release.get('build'), release.get('serverTarget'))
    if actual != expected:
        raise ValueError(f'Release tuple {actual!r} does not match reviewed draft {expected!r}')
    checksum = release.get('sha256')
    if not isinstance(checksum, str) or not re.fullmatch(r'[0-9a-f]{64}', checksum):
        raise ValueError('Final ZIP sha256 is required')
    url = release.get('url')
    if not isinstance(url, str) or not re.fullmatch(r'https://github\.com/ukaoma/cos-starter/releases/download/control-v0\.5\.350/COS-Control-macOS-arm64-0\.5\.350\.zip', url):
        raise ValueError('Verified versioned HTTPS release URL is required')
    timestamp = release.get('publishedAt')
    if not isinstance(timestamp, str) or datetime.fromisoformat(timestamp.replace('Z', '+00:00')).tzinfo is None:
        raise ValueError('Final timezone-qualified publication timestamp is required')
    versioned = f"COS-Control-macOS-arm64-{release['version']}.zip"
    latest = 'COS-Control-macOS-arm64-latest.zip'
    digest = hashlib.sha256()
    with (directory / versioned).open('rb') as source, (directory / latest).open('rb') as alias:
        while True:
            block = source.read(4 * 1024 * 1024)
            if alias.read(4 * 1024 * 1024) != block:
                raise ValueError('Versioned and latest ZIPs are not byte-identical')
            if not block:
                break
            digest.update(block)
    if digest.hexdigest() != checksum:
        raise ValueError('Final ZIP bytes do not match the supplied SHA-256')
    for name in [versioned, latest]:
        sidecar = (directory / (name + '.sha256')).read_text().strip()
        if sidecar != f'{checksum}  {name}':
            raise ValueError(f'{name}.sha256 must identify the exact downloaded filename')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate draft anchors without changing public metadata')
    parser.add_argument('--metadata', type=Path, default=DRAFT / 'metadata.json')
    parser.add_argument('--artifact-dir', type=Path, help='Four final ZIP/sidecar files, after signing/notarization qualification')
    parser.add_argument('--apply', action='store_true', help='Write reviewed local pages only; does not prove public availability')
    args = parser.parse_args()
    plan = json.loads((DRAFT / 'patches.json').read_text())
    if not args.apply:
        outputs = render(ROOT, plan)
        print(json.dumps({'draftOnly': True, 'anchors': len(plan['patches']), 'files': list(outputs), 'requiredArtifactFields': ['url', 'sha256', 'publishedAt'], 'publicMetadataUnchanged': True}))
        return
    if not args.artifact_dir:
        parser.error('--apply requires --artifact-dir; publication/signing qualification remains the release owner’s gate')
    release = json.loads(args.metadata.read_text())
    verify_artifacts(args.artifact_dir, release)
    outputs = render(ROOT, plan, release)
    for name, text in outputs.items():
        (ROOT / name).write_text(text)
    print(json.dumps({'localDraftApplied': True, 'files': list(outputs), 'published': False, 'remaining': 'Full drift/artifact/signing and public HTTPS verification before promotion'}))


if __name__ == '__main__':
    main()
