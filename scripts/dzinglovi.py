"""
Džinglovi za Beep Beep radio: glas + muzička podloga + "beep beep" sirena -> public/radio/dzinglovi/<id>.mp3

Pokretanje (iz fascikle projekta):  python3 scripts/dzinglovi.py

Tekstovi su u branding/dzinglovi/tekstovi.json.
Glas:
  - ako postoji snimak pravog čoveka u branding/dzinglovi/snimci/<id>.(m4a|mp3|wav|aac|ogg), koristi se on
    (snimak se očisti: odseče se tišina, ujednači jačina, glas dobije "radijski" zvuk);
  - inače se pravi probni glas iz Mac-a (glas "Lana", hrvatski), samo da se čuje kako džingl zvuči.
Podloga i sirena se prave ovde (sopstveni zvuk, bez tuđih prava).
Potrebno: ffmpeg, numpy (pip3 install --user numpy).
"""
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / 'branding/dzinglovi/tekstovi.json'
RECORDINGS = ROOT / 'branding/dzinglovi/snimci'
OUT = ROOT / 'public/radio/dzinglovi'
SR = 44100
BPM = 116


def run(*args):
    subprocess.run(args, check=True, capture_output=True)


def read_wav(path):
    with wave.open(str(path)) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return data.reshape(-1, w.getnchannels()).mean(axis=1)


def write_wav(path, stereo):
    pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def voice(item, tmp):
    """Glas kao mono niz: snimak (ako postoji) ili probni Mac glas, očišćen i ujednačen."""
    rec = next((p for p in RECORDINGS.glob(f"{item['id']}.*") if p.suffix.lower() in {'.m4a', '.mp3', '.wav', '.aac', '.ogg'}), None)
    raw = tmp / 'raw.aiff'
    if rec:
        src, kind = rec, 'snimak'
    else:
        run('say', '-v', 'Lana', '-r', '172', '-o', str(raw), item['text'])
        src, kind = raw, 'probni glas (Lana)'
    out = tmp / 'voice.wav'
    # radijski glas: bez bruma i šuštanja, odsečena tišina na krajevima, malo "prisutnosti", kompresija, ujednačena jačina
    chain = ','.join([
        'highpass=f=85',
        'lowpass=f=13000',
        'afftdn=nf=-25' if rec else 'anull',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05',
        'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse',
        'equalizer=f=180:t=q:w=1:g=2',
        'equalizer=f=3500:t=q:w=1.2:g=3',
        'acompressor=threshold=-20dB:ratio=3.5:attack=8:release=120:makeup=3',
        'loudnorm=I=-16:TP=-1.5:LRA=7',
    ])
    run('ffmpeg', '-y', '-i', str(src), '-af', chain, '-ac', '1', '-ar', str(SR), str(out))
    return read_wav(out), kind


def env(n, attack=0.005, release=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / release)


def horn(start_pause=0.12):
    """Dva kratka zvuka sirene ("beep beep"): dva bliska tona sa malo hrapavosti, kao truba malog vozila."""
    def one(d=0.16):
        n = int(SR * d)
        t = np.arange(n) / SR
        s = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.25 + np.sin(2 * np.pi * f * t) * 0.5 for f in (415, 523))
        s = np.tanh(s * 1.4) * 0.55
        fade = np.minimum(1, np.minimum(t / 0.008, (d - t) / 0.02))
        return s * fade
    gap = np.zeros(int(SR * start_pause))
    return np.concatenate([one(), gap, one(0.2)])


def bed(seconds, seed=0):
    """Vesela muzička podloga (sopstvena): akordi I-V-vi-IV, bas, udaraljke. Vraća stereo niz."""
    rng = np.random.default_rng(seed)
    n = int(SR * seconds)
    out = np.zeros((n, 2), dtype=np.float32)
    beat = 60 / BPM
    keys = [(0, [0, 4, 7]), (7, [-5, -1, 2]), (9, [-3, 0, 4]), (5, [-7, -3, 0])]
    root = 220.0 * 2 ** ((rng.integers(0, 5) - 2) / 12)
    hz = lambda semi: root * 2 ** (semi / 12)

    def add(sig, at, pan=0.0, gain=1.0):
        i = int(at * SR)
        if i >= n:
            return
        sig = sig[: n - i] * gain
        out[i : i + len(sig), 0] += sig * (1 - pan) * 0.5 * 2 ** 0.5
        out[i : i + len(sig), 1] += sig * (1 + pan) * 0.5 * 2 ** 0.5

    t_beat = 0.0
    bar = 0
    while t_beat < seconds:
        bass_note, chord = keys[bar % 4]
        for b in range(4):
            at = t_beat + b * beat
            # kik na svaki takt, klap na 2 i 4, hi-hat na osmine
            k = int(SR * 0.25)
            tk = np.arange(k) / SR
            add(np.sin(2 * np.pi * (50 + 90 * np.exp(-tk * 30)) * tk) * env(k, 0.001, 0.12), at, 0, 0.55)
            if b in (1, 3):
                c = int(SR * 0.15)
                add(rng.standard_normal(c) * env(c, 0.001, 0.05), at, 0.1, 0.18)
            for h in (0, 0.5):
                c = int(SR * 0.04)
                noise = np.diff(rng.standard_normal(c + 1))
                add(noise * env(c, 0.001, 0.012), at + h * beat, -0.3, 0.07)
            # bas: osmine
            for h in (0, 0.5):
                m = int(SR * beat * 0.45)
                tm = np.arange(m) / SR
                f = hz(bass_note - 24)
                add((np.sin(2 * np.pi * f * tm) + 0.3 * np.sin(4 * np.pi * f * tm)) * env(m, 0.004, 0.18), at + h * beat, 0, 0.32)
            # akordi: kratki "plucks" na kontra-dobe
            m = int(SR * beat * 0.4)
            tm = np.arange(m) / SR
            pluck = sum(np.sin(2 * np.pi * hz(s) * tm) + 0.25 * np.sin(4 * np.pi * hz(s) * tm) for s in chord)
            add(pluck * env(m, 0.003, 0.11), at + 0.5 * beat, 0.25 if b % 2 else -0.25, 0.09)
        t_beat += 4 * beat
        bar += 1
    peak = np.abs(out).max() or 1
    return out / peak * 0.8


def make(item, index):
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d)
        v, kind = voice(item, tmp)
        h = horn()
        lead, tail = 0.9, 1.6
        total = lead + len(v) / SR + tail
        music = bed(total, seed=index)
        n = len(music)
        # podloga je glasna na početku i kraju, a tiša dok se priča ("ducking")
        t = np.arange(n) / SR
        v_start, v_end = lead, lead + len(v) / SR
        duck = np.where((t > v_start - 0.25) & (t < v_end + 0.2), 0.22, 0.7)
        duck = np.convolve(duck, np.ones(2205) / 2205, mode='same')
        fade = np.minimum(1, np.minimum(t / 0.3, (total - t) / 0.9))
        mix = music * (duck * fade)[:, None]
        # sirena na početku, glas posle nje
        hi = int(SR * 0.08)
        mix[hi : hi + len(h)] += np.repeat(h[:, None], 2, axis=1) * 0.5
        vi = int(SR * v_start)
        mix[vi : vi + len(v)] += np.repeat(v[:, None], 2, axis=1) * 0.95
        wav = tmp / 'mix.wav'
        write_wav(wav, mix)
        OUT.mkdir(parents=True, exist_ok=True)
        mp3 = OUT / f"{item['id']}.mp3"
        run('ffmpeg', '-y', '-i', str(wav), '-af', 'alimiter=limit=0.89,loudnorm=I=-15:TP=-1', '-ar', str(SR), '-b:a', '128k', str(mp3))
        print(f"{mp3.relative_to(ROOT)}  ({kind}, {total:.1f} s)")


if __name__ == '__main__':
    items = json.loads(TEXTS.read_text())
    for i, item in enumerate(items):
        make(item, i)
