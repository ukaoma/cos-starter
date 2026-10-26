#!/usr/bin/env python3
"""Read-only draft rendering/fixtures; no real artifact, browser, network or publication."""
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result
apply = module('control350_apply', HERE / 'apply.py')
drift = module('control350_drift', ROOT / 'scripts/check-version-drift.py')
plan = json.loads((HERE / 'patches.json').read_text())
metadata = json.loads((HERE / 'metadata.json').read_text())
summary = 'Explore Usage with date ranges, provider trends and daily breakdowns. Windu gets smoother running and recovery from failed cast loads. Plus everything in 0.5.349: Usage tooltips, cache-aware comparisons and Windu idle motion.'
assert metadata['whatsNew']['summary'] == summary
assert metadata['serverTarget'] == '6.92.0'
assert all(metadata[field] is None for field in ['url', 'sha256', 'publishedAt'])
assert hashlib.sha256((ROOT / 'control/appcast.json').read_bytes()).hexdigest() == plan['appcastSha256']
current = json.loads((ROOT / 'control/appcast.json').read_text())['channels']['stable']
assert (current['version'], current['build'], current['serverTarget']) == ('0.5.349', 403, '6.92.0')
for text in [json.dumps(metadata), *[p['after'] for p in plan['patches']]]:
    assert not re.search(r'6\.92\.1|Anonymous Mac voices|conditional live Mac voice|Live Mac Voice N|Mac voice numbers stay', text)
assert len(plan['patches']) == 27
apply.render(ROOT, plan)
with tempfile.TemporaryDirectory(prefix='cos350-site-fixture-') as temp:
    directory = Path(temp)
    data = b'SYNTHETIC draft-only artifact fixture; not a COS application'
    digest = hashlib.sha256(data).hexdigest()
    release = {**metadata, 'url': 'https://github.com/ukaoma/cos-starter/releases/download/control-v0.5.350/COS-Control-macOS-arm64-0.5.350.zip', 'sha256': digest, 'publishedAt': '2026-10-26T19:00:00Z'}
    names = ['COS-Control-macOS-arm64-0.5.350.zip', 'COS-Control-macOS-arm64-latest.zip']
    for name in names:
        (directory / name).write_bytes(data)
        (directory / (name + '.sha256')).write_text(digest + '  ' + name)
    apply.verify_artifacts(directory, release)
    def refused(candidate):
        try:
            apply.verify_artifacts(directory, candidate)
        except ValueError:
            return
        raise AssertionError('Invalid artifact fixture accepted')
    refused({**release, 'sha256': '0' * 64})
    refused({**release, 'serverTarget': '6.92.1'})
    (directory / names[1]).write_bytes(b'wrong alias')
    refused(release)
    (directory / names[1]).write_bytes(data)
    (directory / (names[1] + '.sha256')).write_text(digest + '  ' + names[0])
    refused(release)
    rendered = apply.render(ROOT, plan, release)
stable = json.loads(rendered['control/appcast.json'])['channels']['stable']
assert stable['whatsNew']['sections'][1:] == current['whatsNew']['sections']
assert stable.get('notice') == current.get('notice')
fail, _ = drift.evaluate(docs=rendered['docs/index.html'], control=rendered['control/index.html'], stable=stable, zip_sha=digest, latest_zip_sha=digest, versioned_sidecar=digest + '  ' + names[0], latest_sidecar=digest + '  ' + names[1], npm='6.92.0', home=(ROOT / 'index.html').read_text())
fail += drift.evaluate_control_docs(rendered['control/docs/index.html'], stable)
fail += drift.evaluate_wizard(rendered['wizard/index.html'], stable)
assert not fail, fail
class Stack(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack = []
    def handle_starttag(self, tag, attrs):
        if tag not in ('br','img','meta','link','input','hr','source','path','circle','rect','line'): self.stack.append(tag)
    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag: self.stack.pop()
for name in ['control/index.html', 'control/docs/index.html', 'docs/index.html', 'wizard/index.html']:
    baseline = subprocess.check_output(['git', 'show', plan['baseSiteCommit'] + ':' + name], cwd=ROOT, text=True)
    output = rendered.get(name, (ROOT / name).read_text())
    old, new = Stack(), Stack(); old.feed(baseline); new.feed(output)
    assert new.stack == old.stack, (name, old.stack, new.stack)
    for version in ['349', '348', '345']:
        pattern = r'<(section|details)\b[^>]*\bid="release-' + version + r'"[^>]*>.*?</\1>'
        old_blocks = [m.group(0) for m in re.finditer(pattern, baseline, re.S)]
        new_blocks = [m.group(0) for m in re.finditer(pattern, output, re.S)]
        assert old_blocks == new_blocks, (name, version)
assert hashlib.sha256((ROOT / 'control/appcast.json').read_bytes()).hexdigest() == plan['appcastSha256']
print('PASS Control350 Usage/Windu draft: 27 anchors; scope/summary/current349 pin; future in-memory drift; unchanged history/notice; synthetic artifact accept + 4 refusals; baseline HTML stacks. No publication or real artifacts checked.')
