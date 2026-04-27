(function () {
  const focusNames = {
    career: "career and worldly standing",
    wealth: "wealth and the keeping of what is earned",
    love: "affection and human bonds",
    protection: "protection and the guarding of one's field",
    balance: "the ordering of the whole life pattern"
  };

  const closings = {
    demo: {
      career: "Those who read fate in the old manner do not rush to speak of promotion or delay. They first ask whether the person's timing is aligned and whether the work of the hands is supported by the mandate of the chart. In career matters, what should be cultivated is steady name, measured effort, and conduct that can bear weight. Keep the work in order, keep the mind from scattering, and let the proper support remain near the body. In time, the closed gate may open.",
      wealth: "Those who read fate in the old manner do not look at wealth as mere gain. They ask whether what is earned can be held, whether what is held can be increased, and whether desire runs ahead of measure. In wealth matters, what should be cultivated is clarity, restraint, and the patient keeping of resources. Let the proper support remain near the body, and what is loosely gathered may begin to stay.",
      love: "Those who read fate in the old manner do not praise passion without asking what it can endure. They look to whether the heart can remain sincere, whether speech can remain gentle, and whether feeling can rest without disorder. In matters of affection, what should be cultivated is steadiness, softness, and right timing. Let the proper support remain near the body, and what is uncertain may gradually settle.",
      protection: "Those who read fate in the old manner do not chase force for its own sake. They ask whether the spirit is guarded, whether disturbance is entering from outside, and whether the person's field is too open to disorder. In protection matters, what should be cultivated is cleanliness of mind, order of dwelling, and a proper symbol kept near the body. In time, what presses too closely may withdraw.",
      balance: "Those who read fate in the old manner do not look only at what is prosperous or troubled in the moment. They look to the root, the season, and whether the person's steps accord with the current beneath the surface. What is favorable should be nourished, what is excessive should be moderated, and what is weak should be supported with patience. Keep your conduct upright, keep your living space orderly, and let the proper symbol remain near the body. In time, what is unsettled may gather itself again."
    },
    brief: {
      career: "The old readers do not fear a slow rise, nor are they deceived by a quick one. In career matters, they ask whether the chart can truly bear authority, recognition, and responsibility. What should be restrained is impatience; what should be nourished is steadiness of work and clearness of intention. The fuller reading is where the hidden turns behind status and advancement are judged with greater care.",
      wealth: "The old readers do not envy what is easily gained, for they know gain without root may depart just as easily. In wealth matters, they ask what allows resources to remain, increase, and avoid needless leakage. What should be restrained is restless appetite; what should be nourished is measure, order, and right support close to the body. The fuller reading is where these turns are judged with greater care.",
      love: "The old readers do not mistake intensity for destiny. In affection, they ask whether the bond can endure, whether the heart is quiet enough to receive, and whether timing is in harmony with the chart. What should be restrained is emotional haste; what should be nourished is sincerity, patience, and peace in the dwelling. The fuller reading is where these hidden turns are judged with greater care.",
      protection: "The old readers do not add fierceness where calmness is first required. In protection, they ask what weakens the boundary, what stirs disturbance, and what support should be carried close to the body. What should be restrained is agitation; what should be nourished is clarity, order, and a steadier field. The fuller reading is where these hidden turns are judged with greater care.",
      balance: "The old readers do not fear a difficult chart, nor do they flatter an easy one. They look to what should be restrained, what should be nourished, and what should be carried close to the body so that the person's path may become more settled. What is shown here is only a brief opening. The fuller reading is where the hidden turns of the chart are judged with greater care."
    },
    premium: {
      career: "In reading a chart, one does not merely ask whether the road to office or profession is open. One asks whether Heaven has granted the strength to bear rank, whether the season supports movement, and whether the person's conduct can keep what is gained. Your work should be handled with measure, not restlessness. If the body is accompanied by the proper support and the mind does not outrun its season, what seems delayed in name and position may still arrive in due time.",
      wealth: "In reading a chart, one does not merely ask whether money will come. One asks whether the vessel can hold it, whether the current can keep it, and whether greed is stronger than measure. Wealth should be handled with order, restraint, and support that steadies the field rather than exciting it further. If the body is accompanied by the proper support and desire is not permitted to race ahead, what is earned may remain with greater peace.",
      love: "In reading a chart, one does not merely ask whether affection will appear. One asks whether the heart can remain open without being consumed, whether the bond is timely, and whether sincerity can endure beyond the first stirring. Matters of love should be handled with measure, not emotional haste. If the body is accompanied by the proper support and the dwelling is kept in peace, what is distant may draw nearer in a more truthful form.",
      protection: "In reading a chart, one does not merely ask whether misfortune is near. One asks where the boundary has thinned, where the spirit has become tired, and what kind of support can gather the field without causing further disturbance. Protection should be handled with measure, not alarm. If the body is accompanied by the proper support and the mind is kept clean, much that seemed pressing may lose its force and pass by.",
      balance: "In reading a chart, one does not merely seek what is fortunate or unfortunate. One seeks where Heaven has given excess, where Earth has left a lack, and how the person's conduct may pass between the two without wasting spirit. Your pillars should be handled with measure, not impulse. What is favorable should be drawn near; what is contrary should not be provoked without reason. If the body is accompanied by the proper support, and the mind does not run ahead of its season, much that seemed blocked may in time find a way through."
    }
  };

  function getQueryFocus() {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    return focusNames[focus] ? focus : "balance";
  }

  function applyLineageVoice(tier) {
    const focus = getQueryFocus();
    const block = document.getElementById("lineageClosing");
    if (!block) return;
    block.textContent = closings[tier][focus];
  }

  window.LineageVoice = {
    applyLineageVoice
  };
})();
