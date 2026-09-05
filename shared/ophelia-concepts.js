/* Interactive, local-only illustrations for concepts 1–5. Never records or sends data. */
(() => {
  'use strict';
  const notes = {
    subjective: ['History & symptoms', 'Right-eye dryness and grittiness for two weeks. More noticeable in the evening.', 'Source: “My right eye has felt dry and gritty for two weeks.”'],
    objective: ['Examination findings', 'No examination findings have been dictated in this sample yet. This section stays open for the clinician.', 'Source: Awaiting examination findings.'],
    assessment: ['Clinical assessment', 'No assessment has been stated in this sample. The draft does not add a diagnosis on its own.', 'Source: Awaiting the clinician’s assessment.'],
    plan: ['Plan & follow-up', 'Next steps will be discussed after the examination. No treatment or follow-up has been specified in this sample.', 'Source: “Then we’ll talk through the next steps.”']
  };
  document.querySelectorAll('[data-workspace]').forEach(workspace => {
    const buttons = workspace.querySelectorAll('[data-soap]');
    buttons.forEach(button => button.addEventListener('click', () => {
      const note = notes[button.dataset.soap];
      if (!note) return;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      workspace.querySelector('.soap-result h3').textContent = note[0];
      workspace.querySelector('.soap-result p').textContent = note[1];
      workspace.querySelector('[data-source]').textContent = note[2];
    }));
    const review = workspace.querySelector('[data-review]');
    const status = workspace.querySelector('[data-review-status]');
    let reviewing = false;
    review.addEventListener('click', () => {
      reviewing = !reviewing;
      status.textContent = reviewing ? 'Review preview · Check each section. Nothing is sent.' : 'Draft · Your review comes first';
      review.textContent = reviewing ? 'Back to draft' : 'Preview review →';
    });
  });

  const dialog = document.getElementById('demo-dialog');
  if (!dialog) return;
  const stages = {
    listen: ['Stay in the conversation.', 'Ophelia listens while you and your patient talk. In this preview, nothing is recorded.'],
    structure: ['The details find their place.', 'Symptoms go into Subjective. Examination findings go into Objective. Your assessment and plan stay distinct, ready for review.'],
    review: ['Your judgment. Your approval.', 'Read the draft, make your changes and approve the structured note before transfer to your EHR. This demo sends nothing.']
  };
  let opener = null;
  let previousOverflow = '';
  document.querySelectorAll('[data-demo-open]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus();
  });
  const stageButtons = dialog.querySelectorAll('[data-stage]');
  stageButtons.forEach(button => button.addEventListener('click', () => {
    const stage = stages[button.dataset.stage];
    if (!stage) return;
    stageButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    dialog.querySelector('.demo-output h3').textContent = stage[0];
    dialog.querySelector('.demo-output p').textContent = stage[1];
  }));
})();
