(() => {
  'use strict';

  const builder = document.querySelector('#pet-builder');
  if (!builder) return;

  const details = builder.closest('details');
  const form = builder.querySelector('form');
  const { state, source, character, media, background, start, clipLength } = form.elements;
  const build = form.querySelector('[type="submit"]');
  const times = form.querySelector('.pet-builder-times');
  const status = form.querySelector('#pet-builder-status');
  const promptFields = form.querySelector('[data-prompt-fields]');
  const prompt = form.querySelector('#pet-builder-prompt');
  const copyPrompt = form.querySelector('[data-copy-prompt]');
  const promptStatus = form.querySelector('[data-prompt-status]');
  const mediaLabel = form.querySelector('[data-media-label]');
  const mediaHelp = form.querySelector('#pet-builder-media-help');
  const backgroundFields = form.querySelector('[data-background-fields]');
  const canvas = builder.querySelector('canvas');
  const preview = canvas.getContext('2d');
  const previewState = builder.querySelector('#pet-builder-preview-state');
  const previewLabel = builder.querySelector('label[for="pet-builder-preview-state"]');
  const previewActions = builder.querySelector('[data-preview-actions]');
  const play = builder.querySelector('[data-play]');
  const step = builder.querySelector('[data-step]');
  const remove = builder.querySelector('[data-remove]');
  const info = builder.querySelector('[data-preview-info]');
  const download = builder.querySelector('[data-download]');
  const gate = builder.querySelector('[data-download-gate]');
  const email = gate.elements.email;
  const unlock = gate.querySelector('[type="submit"]');
  const exportStatus = builder.querySelector('[data-export-status]');
  const example = builder.querySelector('[data-example]');
  const exampleRow = builder.querySelector('[data-example-row]');
  const exampleURL = new URL('pet-builder-example.png', document.currentScript.src);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nameOrder = new Intl.Collator(undefined, { numeric: true });
  const states = new Map();
  const size = canvas.width;
  const maxFrames = 32;
  const sheetColumns = 3;
  const sheetRows = 2;
  // The same GotCOS HubSpot form used by the site's Blueprint and Starter Kit.
  const leadFormURL = 'https://api.hsforms.com/submissions/v3/integration/submit/2474026/c5439911-36e3-4063-ae21-0e0ab792f7a3';
  // Control's folder importer sets the frame count. Playback uses these
  // native base intervals and minimum loop lengths at 100% character speed.
  const timing = {
    idle: [0.28, 8], working: [0.10, 16], duel: [0.11, 16], trio: [0.22, 12],
    swarm: [0.22, 16], waiting: [0.18, 8], done: [0.16, 8], error: [0.14, 8],
    attention: [0.14, 6], patrol: [0.28, 8],
  };
  const controlRow = {
    idle: 'Idle', working: 'Running', duel: 'Duel', trio: 'Three', swarm: 'Swarm',
    waiting: 'Waiting', done: 'Success', error: 'Error', attention: 'Attention', patrol: 'Patrol',
  };
  const poses = {
    idle: '1. Neutral, eyes open. 2. Begin a small inhale. 3. Peak of the inhale, eyelids half closed. 4. Blink. 5. Eyes open as the body settles. 6. Almost neutral again. Keep any planted feet steady.',
    working: '1. Ready. 2. Anticipate the action. 3. Begin a brisk movement that suits the character. 4. Show its clearest action pose. 5. Follow through. 6. Return toward ready. Use one action that reads at small size.',
    duel: '1. Ready. 2. Anticipate. 3. Make a quick gesture to one side. 4. Make a second distinct gesture toward the other side. 5. Recover. 6. Return toward ready. Keep the figure near the cell center.',
    trio: '1. Ready. 2. Begin an upturned gesture. 3. Sweep left. 4. Sweep right. 5. Settle. 6. Return toward ready. Make the three beats read in the silhouette.',
    swarm: '1. Ready. 2. Gather energy. 3. Begin a broad action pose. 4. Show its largest silhouette. 5. Follow through. 6. Return toward ready. Keep even the widest pose inside the safe area.',
    waiting: '1. Neutral and attentive. 2. Tilt toward the viewer. 3. Pause in a curious pose. 4. Blink. 5. Release the tilt. 6. Return toward neutral.',
    done: '1. Ready. 2. Wind up for a small celebration. 3. Show the high point. 4. Hold with a clear expression. 5. Settle. 6. Return toward ready.',
    error: '1. Neutral. 2. Notice a surprise. 3. Recoil slightly. 4. Pause with a concerned expression. 5. Recover. 6. Return toward neutral.',
    attention: '1. Neutral. 2. Notice something. 3. Lift or turn the head. 4. Hold an alert expression. 5. Settle. 6. Return toward neutral.',
    patrol: '1. Start walking in place. 2. Transfer weight. 3. Pass the first foot. 4. Take the opposite step. 5. Transfer weight again. 6. Pass the other foot. Keep the torso near the center of the frame.',
  };
  let frameIndex = 0;
  let animation = 0;
  let downloadUnlocked = false;

  function isVideo(file) {
    return file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
  }

  const providerHelp = form.querySelector('[data-provider-help]');
  const promptTitle = form.querySelector('[data-prompt-title]');
  const providers = {
    claude: { help: 'Paste into Claude with an image tool connected. Attach a reference image if you have one.', request: 'Use your connected image tool to draw' },
    chatgpt: { help: 'Paste into ChatGPT Images. Attach a reference image if you have one.', request: 'Use ChatGPT image generation to draw' },
    cursor: { help: 'Paste into Cursor Agent with an image tool enabled. Include your reference image in the chat.', request: 'Use the available image tool to draw' },
    other: { help: 'Paste into any app that can generate a transparent PNG. Attach a reference image if you have one.', request: 'Draw' },
  };

  function updatePrompt() {
    const selectedProvider = providers[form.elements.provider.value];
    providerHelp.textContent = selectedProvider.help;
    const description = character.value.trim();
    const subject = description
      ? 'Character description: ' + description
      : 'Use the attached reference as the character design. If I supplied neither a reference nor a description, ask me for one first.';
    const label = state.selectedOptions[0].text;
    promptTitle.textContent = label + ' sprite prompt';
    prompt.value = [
      `${selectedProvider.request} a desktop-pet sprite sheet for COS Control. Animation state: ${label}. ${subject}`,
      'If I attached an image, use it as the visual reference. Preserve the character’s face, colors, proportions, outfit and accessories through every pose. Use crisp shapes that stay legible at desktop-pet size.',
      'Return one downloadable PNG with true transparent alpha. Use a landscape 3:2 canvas, ideally 1536 × 1024 pixels, with exactly 3 columns and 2 rows of equal square cells. Draw six full-body poses. The top row contains frames 1–3, and the bottom row contains frames 4–6, in left-to-right order.',
      'Use an invisible grid. Center each figure horizontally in its cell. Keep the same camera, direction, lighting, and character scale. Aim for the figure to occupy about 60% of the cell height. Set the ground line at 82% of each cell’s height and keep at least 12% clear space around the figure. Leave the rest of the canvas fully transparent and empty. Exclude grid lines, text, labels, cast shadows, glow and backgrounds.',
      'Draw these poses in order. ' + poses[state.value] + ' The sixth pose should lead smoothly back to the first.',
      'Generate and return the PNG sheet now.',
    ].join('\n\n');
    promptStatus.hidden = true;
    promptStatus.textContent = '';
  }

  character.addEventListener('input', updatePrompt);
  state.addEventListener('change', updatePrompt);
  for (const option of form.elements.provider) option.addEventListener('change', updatePrompt);
  copyPrompt.addEventListener('click', async () => {
    promptStatus.hidden = false;
    try {
      await navigator.clipboard.writeText(prompt.value);
      promptStatus.textContent = 'Prompt copied.';
    } catch {
      prompt.closest('details').open = true;
      prompt.focus();
      prompt.select();
      promptStatus.textContent = 'Prompt selected. Press ⌘C or Ctrl+C to copy.';
    }
  });
  updatePrompt();

  function drawFrame(context, index, source, width, height, keyGreen) {
    const fit = Math.min(size / width, size / height);
    const fittedWidth = Math.max(1, Math.round(width * fit));
    const fittedHeight = Math.max(1, Math.round(height * fit));
    const offset = index * size;
    context.drawImage(source, offset + Math.floor((size - fittedWidth) / 2),
      Math.floor((size - fittedHeight) / 2), fittedWidth, fittedHeight);
    if (!keyGreen) return;

    const image = context.getImageData(offset, 0, size, size);
    const pixels = image.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const green = pixels[i + 1];
      const dominance = green - Math.max(pixels[i], pixels[i + 2]);
      if (green < 70 || dominance < 28) continue;
      pixels[i + 3] *= 1 - Math.min(1, (dominance - 28) / 35);
      pixels[i + 1] = Math.max(pixels[i], pixels[i + 2]);
    }
    context.putImageData(image, offset, 0);
  }

  function newStrip(count, keyGreen) {
    const strip = document.createElement('canvas');
    strip.width = count * size;
    strip.height = size;
    return { strip, context: strip.getContext('2d', { willReadFrequently: keyGreen }) };
  }

  function waitForMedia(video, event, begin) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('This video took too long to decode. Try a shorter MP4.')), 12000);
      const success = () => finish();
      const failure = () => finish(new Error('This browser couldn’t decode the video. Try an H.264 MP4 or an image sequence.'));
      function finish(error) {
        clearTimeout(timer);
        video.removeEventListener(event, success);
        video.removeEventListener('error', failure);
        if (error) reject(error);
        else resolve();
      }
      video.addEventListener(event, success);
      video.addEventListener('error', failure);
      try { begin(); } catch { failure(); }
    });
  }

  async function stripFromVideo(file, baseInterval, keyGreen) {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    const url = URL.createObjectURL(file);
    try {
      await waitForMedia(video, 'loadeddata', () => { video.src = url; });
      const first = start.valueAsNumber;
      const duration = Math.min(clipLength.valueAsNumber, video.duration - first);
      if (!(duration >= 0.1) || !Number.isFinite(duration)) {
        throw new Error('Choose a start time with at least 0.1 seconds left in the video.');
      }
      const count = Math.max(2, Math.min(maxFrames, Math.round(duration / baseInterval)));
      const { strip, context } = newStrip(count, keyGreen);
      for (let i = 0; i < count; i++) {
        const time = first + i * duration / count;
        if (Math.abs(video.currentTime - time) > 0.001) {
          await waitForMedia(video, 'seeked', () => { video.currentTime = time; });
        }
        drawFrame(context, i, video, video.videoWidth, video.videoHeight, keyGreen);
      }
      return { strip, count };
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
  }

  async function stripFromImages(files, keyGreen) {
    if (files.length > maxFrames) throw new Error('Choose up to 32 images for a state.');
    const ordered = files.sort((a, b) => nameOrder.compare(a.name, b.name));
    const { strip, context } = newStrip(ordered.length, keyGreen);
    for (const [index, file] of ordered.entries()) {
      if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
        throw new Error('Choose PNG, JPEG or WebP images.');
      }
      let bitmap;
      try { bitmap = await createImageBitmap(file); } catch {
        throw new Error(`Couldn’t open ${file.name}. Check the file or export it again.`);
      }
      try { drawFrame(context, index, bitmap, bitmap.width, bitmap.height, keyGreen); }
      finally { bitmap.close(); }
    }
    return { strip, count: ordered.length };
  }

  async function stripFromSheet(file) {
    const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const png = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!png.every((byte, i) => signature[i] === byte)) {
      throw new Error('Choose the original PNG from your image tool.');
    }
    let sheet;
    try { sheet = await createImageBitmap(file); } catch {
      throw new Error('This PNG couldn’t be opened. Download the generated image again.');
    }
    try {
      if (Math.abs(sheet.width / sheet.height - sheetColumns / sheetRows) > 0.045) {
        throw new Error('This sheet needs a 3:2 landscape canvas. Request three columns and two rows.');
      }
      const count = sheetColumns * sheetRows;
      const { strip, context } = newStrip(count, true);
      for (let index = 0; index < count; index++) {
        const column = index % sheetColumns;
        const row = Math.floor(index / sheetColumns);
        const left = Math.round(column * sheet.width / sheetColumns);
        const top = Math.round(row * sheet.height / sheetRows);
        const right = Math.round((column + 1) * sheet.width / sheetColumns);
        const bottom = Math.round((row + 1) * sheet.height / sheetRows);
        const offset = index * size;
        context.drawImage(sheet, left, top, right - left, bottom - top, offset, 0, size, size);

        const pixels = context.getImageData(offset, 0, size, size).data;
        let figure = 0;
        let touchingEdge = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (pixels[(y * size + x) * 4 + 3] < 64) continue;
            figure++;
            if (x === 0 || x === size - 1 || y === 0 || y === size - 1) touchingEdge++;
          }
        }
        if (figure < size * size * 0.01) {
          throw new Error(`Frame ${index + 1} looks empty. Request exactly one full pose in each of the six cells.`);
        }
        if (touchingEdge > size * 0.08) {
          throw new Error(`Frame ${index + 1} touches a cell edge. Request true transparency and more space around each pose.`);
        }
      }
      return { strip, count };
    } finally {
      sheet.close();
    }
  }

  function drawPreview() {
    preview.clearRect(0, 0, size, size);
    const clip = states.get(previewState.value);
    if (clip) preview.drawImage(clip.strip, frameIndex * size, 0, size, size, 0, 0, size, size);
  }

  function pause() {
    cancelAnimationFrame(animation);
    animation = 0;
    play.textContent = 'Play';
  }

  function playLoop() {
    const clip = states.get(previewState.value);
    if (!clip || clip.count < 2) return;
    const origin = performance.now() - frameIndex * clip.interval * 1000;
    function tick(now) {
      const index = Math.floor((now - origin) / (clip.interval * 1000)) % clip.count;
      if (index !== frameIndex) {
        frameIndex = index;
        drawPreview();
      }
      animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
    play.textContent = 'Pause';
  }

  function showPreview(autoplay) {
    pause();
    frameIndex = 0;
    const clip = states.get(previewState.value);
    canvas.hidden = !clip;
    play.disabled = step.disabled = !clip || clip.count < 2;
    info.textContent = clip
      ? `${clip.count} ${clip.count === 1 ? 'frame' : 'frames'} · ${(clip.count * clip.interval).toFixed(2)} s at default speed`
      : 'Sample pet · Ivory desk robot';
    drawPreview();
    if (autoplay && !reducedMotion.matches && details.open) playLoop();
  }

  function refreshStates(selected, autoplay = false) {
    previewState.replaceChildren(...Array.from(state.options)
      .filter(option => states.has(option.value))
      .map(option => new Option(option.text, option.value)));
    if (states.has(selected)) previewState.value = selected;
    previewLabel.hidden = previewState.hidden = previewActions.hidden = !states.size;
    exampleRow.hidden = states.has('idle');
    updateDownloadGate();
    exportStatus.textContent = '';
    showPreview(autoplay);
  }

  function updateDownloadGate() {
    gate.hidden = !states.size || downloadUnlocked;
    download.hidden = !states.size || !downloadUnlocked;
    download.disabled = download.hidden;
  }

  function updateMediaFields() {
    const sheet = source.value === 'sheet';
    const files = Array.from(media.files);
    promptFields.hidden = !sheet;
    backgroundFields.hidden = sheet;
    media.multiple = !sheet;
    media.accept = sheet ? '.png,image/png' : 'video/*,.mp4,.mov,.webm,.png,.jpg,.jpeg,.webp';
    mediaLabel.textContent = sheet ? 'Generated sprite sheet' : 'Video or image frames';
    mediaHelp.textContent = sheet
      ? 'Use a transparent PNG with three columns and two rows.'
      : 'Choose one video or up to 32 PNG, JPEG or WebP images. Name frames in order, like 01.png and 02.png.';
    times.hidden = sheet || !(files.length === 1 && isVideo(files[0]));
    start.disabled = clipLength.disabled = times.hidden;
  }

  source.addEventListener('change', () => {
    media.value = '';
    status.textContent = '';
    updateMediaFields();
  });
  media.addEventListener('change', () => {
    updateMediaFields();
    status.textContent = '';
  });
  updateMediaFields();

  async function buildState(selected, loadClip, success) {
    const [baseInterval, baseCount] = timing[selected];
    const controls = [build, media, state, source, background, start, clipLength, remove, download, example, email, unlock];
    controls.forEach(control => { control.disabled = true; });
    status.textContent = 'Building animation…';
    try {
      const clip = await loadClip(baseInterval);
      clip.interval = baseInterval * Math.max(1, baseCount / clip.count);
      states.set(selected, clip);
      refreshStates(selected, true);
      status.textContent = success;
    } catch (error) {
      status.textContent = error.message || 'The animation couldn’t be built. Try another file.';
    } finally {
      controls.forEach(control => { control.disabled = false; });
      start.disabled = clipLength.disabled = times.hidden;
      updateDownloadGate();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const files = Array.from(media.files);
    const selected = state.value;
    const success = `${state.selectedOptions[0].text} is ready. Add another state or download your pack.`;
    if (source.value === 'sheet') {
      void buildState(selected, () => stripFromSheet(files[0]), success);
      return;
    }
    const videos = files.filter(isVideo);
    if (videos.length && files.length !== 1) {
      status.textContent = 'Choose one video or a sequence of images.';
      return;
    }
    const keyGreen = background.value === 'green';
    void buildState(selected, baseInterval => videos.length
      ? stripFromVideo(videos[0], baseInterval, keyGreen)
      : stripFromImages(files, keyGreen), success);
  });

  example.addEventListener('click', () => {
    void buildState('idle', async () => {
      const response = await fetch(exampleURL);
      if (!response.ok) throw new Error('The example couldn’t be loaded. Try again.');
      return stripFromSheet(await response.blob());
    }, 'The generated robot is ready. Step through its six poses or download the pack.');
  });

  previewState.addEventListener('change', () => showPreview(true));
  play.addEventListener('click', () => animation ? pause() : playLoop());
  step.addEventListener('click', () => {
    pause();
    frameIndex = (frameIndex + 1) % states.get(previewState.value).count;
    drawPreview();
  });
  remove.addEventListener('click', () => {
    states.delete(previewState.value);
    refreshStates();
    status.textContent = 'State removed from the pack.';
  });
  details.addEventListener('toggle', () => { if (!details.open) pause(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) pause(); });
  function followHash() {
    if (location.hash === '#' + details.id) details.open = true;
  }
  window.addEventListener('hashchange', followHash);
  followHash();

  function pngBytes(strip) {
    return new Promise((resolve, reject) => {
      strip.toBlob(blob => {
        if (blob) resolve(blob.arrayBuffer());
        else reject(new Error('Couldn’t encode the PNG strip.'));
      }, 'image/png');
    });
  }

  // Sprite PNGs already use compression. A ZIP with stored entries keeps the
  // exporter small and opens with the built-in macOS Archive Utility.
  function makeZip(entries) {
    const encoder = new TextEncoder();
    const parts = [];
    const directory = [];
    const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
      for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      return value;
    });
    let offset = 0;
    let directorySize = 0;
    for (const [path, bytes] of entries) {
      const name = encoder.encode('COS-motion-pet/' + path);
      let crc = 0xffffffff;
      for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      crc = (crc ^ 0xffffffff) >>> 0;

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(12, 0x21, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, bytes.length, true);
      local.setUint32(22, bytes.length, true);
      local.setUint16(26, name.length, true);

      const entry = new DataView(new ArrayBuffer(46));
      entry.setUint32(0, 0x02014b50, true);
      entry.setUint16(4, 20, true);
      new Uint8Array(entry.buffer, 6, 26).set(new Uint8Array(local.buffer, 4, 26));
      entry.setUint32(42, offset, true);
      parts.push(local.buffer, name, bytes);
      directory.push(entry.buffer, name);
      offset += local.byteLength + name.length + bytes.length;
      directorySize += entry.byteLength + name.length;
    }
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, directorySize, true);
    end.setUint32(16, offset, true);
    return new Blob([...parts, ...directory, end.buffer], { type: 'application/zip' });
  }

  async function submitLead(address) {
    const page = new URL('https://www.gotcos.com/control/#custom-pet-pack');
    const query = new URLSearchParams(location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id']) {
      const value = query.get(key);
      if (value) page.searchParams.set(key, value);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(leadFormURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          fields: [{ name: 'email', value: address }],
          context: { pageUri: page.href, pageName: 'gotcos.com · COS Control · Custom Pet Pack' },
        }),
      });
      if (!response.ok) throw new Error('Email submission failed.');
    } finally {
      clearTimeout(timer);
    }
  }

  async function exportPack() {
    const address = email.value.trim();
    const controls = [download, build, remove, example, email, unlock];
    controls.forEach(control => { control.disabled = true; });
    let moveFocus = false;
    try {
      if (!downloadUnlocked) {
        exportStatus.textContent = 'Submitting email…';
        try {
          await submitLead(address);
        } catch {
          exportStatus.textContent = 'We couldn’t confirm your email. Check the address and try again. Your animation is saved in this tab.';
          return;
        }
        downloadUnlocked = true;
        email.value = '';
        moveFocus = true;
        window.gtag?.('event', 'control_pet_pack_lead');
      }

      exportStatus.textContent = 'Preparing your download…';
      const controlRow = {
    idle: 'Idle', working: 'Running', duel: 'Duel', trio: 'Three', swarm: 'Swarm',
    waiting: 'Waiting', done: 'Success', error: 'Error', attention: 'Attention', patrol: 'Patrol',
  };
  const poses = {};
      const entries = [];
      for (const [pose, clip] of states) {
        const file = pose + '.png';
        poses[pose] = { file, frames: clip.count };
        entries.push([file, new Uint8Array(await pngBytes(clip.strip))]);
      }
      entries.push(['manifest.json', new TextEncoder().encode(JSON.stringify({ poses }, null, 2) + '\n')]);
      const instructions = [
        'Install your COS Control pet',
        '',
        'Open Settings, then Pet and appearance. Enable the session pet.',
        'Turn on Show all settings if needed. Under Session pet, expand Advanced.',
        'Control 0.5.406: choose Install sprite pack, then select the folder containing manifest.json. This replaces the pet’s full set of custom states.',
        'On earlier versions, including 0.5.397 and 0.5.405, use Choose beside each state listed below. Select its PNG and set its frame count. The older folder installer can remove other local Control data.',
        '',
        ...Object.entries(poses).map(([pose, { file, frames }]) =>
          `${controlRow[pose]} row: ${file} (${frames} ${frames === 1 ? 'frame' : 'frames'})`),
        '',
      ].join('\n');
      entries.push(['INSTALL.txt', new TextEncoder().encode(instructions)]);
      const url = URL.createObjectURL(makeZip(entries));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'COS-motion-pet.zip';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      window.gtag?.('event', 'control_pet_pack_download');
      exportStatus.textContent = 'Your pack is ready. Unzip it and follow INSTALL.txt to install it in Control.';
    } catch (error) {
      exportStatus.textContent = error.message || 'The pack couldn’t be downloaded.';
    } finally {
      controls.forEach(control => { control.disabled = false; });
      updateDownloadGate();
      if (moveFocus && (document.activeElement === document.body || gate.contains(document.activeElement))) {
        download.focus({ preventScroll: true });
      }
    }
  }

  gate.addEventListener('submit', event => {
    event.preventDefault();
    if (states.size && !downloadUnlocked && !unlock.disabled) void exportPack();
  });

  download.addEventListener('click', () => {
    if (states.size && downloadUnlocked && !download.disabled) void exportPack();
  });

  builder.hidden = false;
})();
