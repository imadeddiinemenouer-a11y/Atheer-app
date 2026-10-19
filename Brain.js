export const Brain = {
  facts: JSON.parse(localStorage.getItem('a5_facts') || '[]'),
  kb: JSON.parse(localStorage.getItem('a5_kb') || '{}'),
  skills: JSON.parse(localStorage.getItem('a5_skills') || '[]'),
  addFact(f) {
    this.facts.push({...f, ts: Date.now()});
    localStorage.setItem('a5_facts', JSON.stringify(this.facts));
  },
  learn(k, v) {
    this.kb[k] = v;
    localStorage.setItem('a5_kb', JSON.stringify(this.kb));
  }
};