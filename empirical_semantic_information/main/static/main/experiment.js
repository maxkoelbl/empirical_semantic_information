const PRACTICE = [
  {
    "kind": "practice",
    "id": "P1",
    "condition": "practice",
    "scene": "",
    "sentence": "Der Mann bestellt die",
    "target": "Rechnung",
    "neighbours": ["Karte", "Suppe"],
    "image": "pic/uebung_cafe_K3.png"
  },
  {
    "kind": "practice",
    "id": "P2",
    "condition": "practice",
    "scene": "",
    "sentence": "Die Frau beobachtet die",
    "target": "Vögel",
    "neighbours": ["Kinder", "Enten"],
    "image": "pic/uebung_park_K2.png"
  },
  {
    "kind": "practice",
    "id": "P3",
    "condition": "practice",
    "scene": "",
    "sentence": "Das Kind sammelt die",
    "target": "Muscheln",
    "neighbours": ["Steine", "Schnecken"],
    "image": "pic/uebung_strand_K3.png"
  },
  {
    "kind": "practice",
    "id": "P4",
    "condition": "practice",
    "scene": "",
    "sentence": "Der Junge repariert die",
    "target": "Kette",
    "neighbours": ["Bremse", "Lampe"],
    "image": "pic/uebung_garage_K2.png"
  },
  {
    "kind": "practice",
    "id": "P5",
    "condition": "practice",
    "scene": "",
    "sentence": "Die Frau prüft die",
    "target": "Temperatur",
    "neighbours": ["Hitze", "Garzeit"],
    "image": null
  }
];

let TRIALS = [];
let phase = 'intro', idx = 0, data = [], meta = {};
let tCtx = 0, tSent = 0, firstKey = null, inPractice = true;


function show(id) {
  document.querySelectorAll('.screen').forEach(
    e => e.classList.remove('on')
  );

  document.getElementById(id).classList.add('on');
}


function norm(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/^(der|die|das|den|dem|ein|eine|einen)\s+/, '')
    .replace(/[.,;:!?]+$/, '');
}


function judge(resp, t) {
  const r = norm(resp);

  if (r === norm(t.target)) {
    return 'target';
  }

  for (const n of t.neighbours) {
    if (r === norm(n)) {
      return 'neighbour';
    }
  }

  return 'other';
}


function currentSet() {
  return inPractice ? PRACTICE : TRIALS;
}


function beginPractice() {
  const pid = document.getElementById('pid').value;
  const age = document.getElementById('age').value;
  const sex = document.getElementById('sex').value;
  const l1  = document.getElementById('l1').value;

  if (!pid || !age || !sex || !l1) {
    document.getElementById('e_intro').textContent =
      'Bitte alle Angaben ausfüllen.';

    return;
  }

  meta = {
    pid: pid,
    list: ((parseInt(pid) - 1) % 5) + 1,
    age: age,
    sex: sex,
    l1: l1,
    started: new Date().toISOString()
  };

  fetch('/trials?pid=' + encodeURIComponent(pid))
    .then(r => r.json())
    .then(t => {
      TRIALS = t;
    });

  phase = 'pracintro';
  show('s_pracintro');
}


function startBlock(practice) {
  inPractice = practice;
  idx = 0;
  runContext();
}


function runContext() {
  const set = currentSet();

  if (idx >= set.length) {
    endBlock();
    return;
  }

  const t = set[idx];

  document.getElementById('ctx_body').innerHTML = t.image
    ? '<img src="' + t.image + '" alt="">'
    : '<div class="fix">+</div>';

  document.getElementById('prog').textContent =
    (inPractice ? 'Übung ' : 'Durchgang ') +
    (idx + 1) +
    ' / ' +
    set.length;

  phase = 'ctx';
  show('s_ctx');
  tCtx = performance.now();
}


function runSentence() {
  const t = currentSet()[idx];

  document.getElementById('frame').textContent = t.sentence;

  const inp = document.getElementById('resp');

  inp.value = '';
  firstKey = null;

  phase = 'sent';
  show('s_sent');

  inp.focus();
  tSent = performance.now();
}


function runFeedback(resp) {
  const t = currentSet()[idx];
  const v = judge(resp, t);

  document.getElementById('fb_yours').textContent = resp;
  document.getElementById('fb_target').textContent = t.target;

  document.getElementById('fb_ok').textContent =
    v === 'neighbour'
      ? 'Ihre Antwort zählt ebenfalls.'
      : '';

  phase = 'fb';
  show('s_fb');

  return v;
}


function endBlock() {
  if (inPractice) {
    phase = 'mainintro';
    show('s_mainintro');
  } else {
    phase = 'done';
    show('s_done');
    document.getElementById('prog').textContent = '';
  }
}


document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') {
    return;
  }

  if (phase === 'pracintro') {
    e.preventDefault();
    startBlock(true);
    return;
  }

  if (phase === 'mainintro') {
    e.preventDefault();
    startBlock(false);
    return;
  }

  if (phase === 'ctx') {
    e.preventDefault();

    currentSet()[idx]._ctx_ms =
      Math.round(performance.now() - tCtx);

    phase = 'blank';
    show('s_blank');

    setTimeout(runSentence, 300);
    return;
  }

  if (phase === 'sent') {
    e.preventDefault();

    const val =
      document.getElementById('resp').value.trim();

    if (!val) {
      return;
    }

    const t = currentSet()[idx];

    const submit_ms =
      Math.round(performance.now() - tSent);

    const v = runFeedback(val);

    if (!inPractice) {
      data.push({
        pid: meta.pid,
        list: meta.list,
        position: idx + 1,
        kind: t.kind,
        item: t.id,
        condition: t.condition,
        scene: t.scene,
        image: t.image || '',
        sentence: t.sentence,
        target: t.target,
        response: val,
        verdict: v,
        correct: (v === 'other' ? 0 : 1),
        ctx_view_ms: t._ctx_ms,
        rt_first_key_ms: firstKey,
        rt_submit_ms: submit_ms
      });
    }

    return;
  }

  if (phase === 'fb') {
    e.preventDefault();
    idx++;
    runContext();
    return;
  }
});


document
  .getElementById('resp')
  .addEventListener('keydown', function(e) {
    if (firstKey === null && e.key.length === 1) {
      firstKey =
        Math.round(performance.now() - tSent);
    }
  });


function downloadCSV() {
  const cols = [
    'pid',
    'list',
    'age',
    'sex',
    'l1',
    'started',
    'position',
    'kind',
    'item',
    'condition',
    'scene',
    'image',
    'sentence',
    'target',
    'response',
    'verdict',
    'correct',
    'ctx_view_ms',
    'rt_first_key_ms',
    'rt_submit_ms'
  ];

  const esc = function(v) {
    return '"' +
      String(
        v === null || v === undefined ? '' : v
      ).replace(/"/g, '""') +
      '"';
  };

  const rows = data.map(function(r) {
    return cols.map(function(c) {
      return esc(
        c in r
          ? r[c]
          : (meta[c] === undefined ? '' : meta[c])
      );
    }).join(',');
  });

  const csv =
    cols.join(',') + '\n' + rows.join('\n');

  const a = document.createElement('a');

  a.href = URL.createObjectURL(
    new Blob(
      [csv],
      {type: 'text/csv;charset=utf-8'}
    )
  );

  a.download = 'exp_p' + meta.pid + '.csv';
  a.click();
}
